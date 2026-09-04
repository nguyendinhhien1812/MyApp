#!/usr/bin/env bash
# Deploy Worker lên Cloudflare.
#
# Chạy được nhiều lần: bước nào xong rồi thì bỏ qua.
# Script KHÔNG bao giờ nhận secret qua tham số hay biến môi trường — `wrangler
# secret put` tự hỏi và gửi thẳng lên Cloudflare, giá trị không đi qua file nào.

set -euo pipefail
cd "$(dirname "$0")"

WRANGLER="npx wrangler"
export WRANGLER_SEND_METRICS=false

say()  { printf '\n\033[1m%s\033[0m\n' "$1"; }
warn() { printf '\033[33m  %s\033[0m\n' "$1"; }
ok()   { printf '\033[32m  %s\033[0m\n' "$1"; }
die()  { printf '\033[31m\n  %s\033[0m\n\n' "$1"; exit 1; }

# ── 1. Đăng nhập ────────────────────────────────────────────────────────────
say "1/5  Tài khoản Cloudflare"
if ! $WRANGLER whoami 2>&1 | grep -q "You are logged in\|associated with the email\|Account Name"; then
  die "Chưa đăng nhập. Chạy: npx wrangler login   (mở trình duyệt, đăng nhập rồi chạy lại script này)"
fi
$WRANGLER whoami 2>/dev/null | grep -iE "email|Account Name" | head -2 || true
ACCOUNT_ID=$($WRANGLER whoami 2>/dev/null | grep -oE '[0-9a-f]{32}' | head -1)
ok "đã đăng nhập"

# ── 2. KV namespace ─────────────────────────────────────────────────────────
say "2/5  KV namespace (đếm rate limit + lưu registry)"
if grep -q "THAY_BANG_ID_KV_CUA_BAN" wrangler.toml; then
  echo "  đang tạo namespace RATE_LIMIT…"
  OUT=$($WRANGLER kv namespace create RATE_LIMIT 2>&1) || { echo "$OUT"; die "Tạo KV thất bại."; }
  # Wrangler in ra khối TOML gợi ý, trong đó có dòng:  id = "abc123..."
  # Bám vào chính dòng đó trước; dò hex trần chỉ là phương án dự phòng.
  KV_ID=$(printf '%s' "$OUT" | sed -n 's/.*id[[:space:]]*=[[:space:]]*"\([0-9a-f]\{32\}\)".*/\1/p' | head -1)
  [ -n "$KV_ID" ] || KV_ID=$(printf '%s' "$OUT" | grep -oE '[0-9a-f]{32}' | head -1)
  [ -n "$KV_ID" ] || { echo "$OUT"; die "Không đọc được id KV từ output. Dán tay vào wrangler.toml."; }
  # macOS và GNU sed khác nhau ở -i, nên dùng file tạm cho chắc
  sed "s/THAY_BANG_ID_KV_CUA_BAN/$KV_ID/" wrangler.toml > wrangler.toml.tmp
  mv wrangler.toml.tmp wrangler.toml
  ok "đã tạo và ghi id vào wrangler.toml: $KV_ID"
else
  ok "đã có id trong wrangler.toml"
fi

# ── 2b. Assets ──────────────────────────────────────────────────────────────
say "2b/5  Bundle mini-app (Workers Assets)"
ASSET_DIR="assets/bundles"
if [ ! -d "$ASSET_DIR" ] || [ -z "$(find "$ASSET_DIR" -name '*.bundle' -print -quit 2>/dev/null)" ]; then
  # Cái bẫy lớn nhất của Workers Assets: assets đi kèm bản deploy, nên deploy khi
  # thư mục rỗng sẽ GỠ SẠCH mọi mini-app đang chạy. Hỏi lại thay vì im lặng làm.
  warn "assets/bundles không có file .bundle nào."
  warn "Deploy tiếp sẽ GỠ mọi mini-app đang chạy trên production."
  echo "  Phát hành lại trước bằng:  ./miniapps/release.sh loyalty <x.y.z>"
  read -r -p "  Vẫn deploy? [y/N] " ans
  [ "${ans:-n}" = "y" ] || [ "${ans:-n}" = "Y" ] || die "Đã dừng."
else
  NVER=$(find "$ASSET_DIR" -mindepth 2 -maxdepth 2 -type d | wc -l | tr -d ' ')
  NFILE=$(find "$ASSET_DIR" -name '*.bundle' | wc -l | tr -d ' ')
  ok "$NVER phiên bản, $NFILE file ($(du -sh "$ASSET_DIR" | cut -f1))"
fi

# ── 3. Secret ───────────────────────────────────────────────────────────────
say "3/5  Secret"
EXISTING=$($WRANGLER secret list 2>/dev/null || echo '[]')
need_secret() { ! printf '%s' "$EXISTING" | grep -q "\"$1\""; }

if need_secret ADMIN_TOKEN; then
  warn "Thiếu ADMIN_TOKEN — trang /admin sẽ KHOÁ hẳn (401) cho tới khi có."
  echo "  Sinh một token ngẫu nhiên rồi dán vào lời nhắc sau:"
  echo "    openssl rand -base64 32"
  echo
  $WRANGLER secret put ADMIN_TOKEN
else
  ok "ADMIN_TOKEN đã có"
fi

if need_secret GEMINI_API_KEY; then
  warn "Thiếu GEMINI_API_KEY — /chat sẽ trả 502. Registry vẫn chạy bình thường."
  read -r -p "  Nhập key bây giờ? [y/N] " ans
  if [ "${ans:-n}" = "y" ] || [ "${ans:-n}" = "Y" ]; then
    $WRANGLER secret put GEMINI_API_KEY
  else
    warn "bỏ qua — chạy sau: npx wrangler secret put GEMINI_API_KEY"
  fi
else
  ok "GEMINI_API_KEY đã có"
fi

# ── 4. Deploy ───────────────────────────────────────────────────────────────
say "4/5  Deploy"
DEPLOY_OUT=$($WRANGLER deploy 2>&1) || {
  echo "$DEPLOY_OUT" | grep -vE "out-of-date|npm install --save-dev|After installation|Please update"
  # Lần deploy đầu trên một tài khoản mới hay vướng đúng chỗ này: code đã upload
  # xong nhưng tài khoản chưa có subdomain workers.dev nên không có URL nào trỏ tới.
  if printf '%s' "$DEPLOY_OUT" | grep -q "workers.dev subdomain"; then
    ACC=$(printf '%s' "$DEPLOY_OUT" | grep -oE '[0-9a-f]{32}' | head -1)
    # Wrangler 3 in ra link /workers/onboarding — link đó đã chết (404).
    # Chỗ đúng là trang Workers & Pages, mục "Your subdomain" -> Change.
    die "Worker đã upload nhưng tài khoản chưa có subdomain workers.dev.
  Mở: https://dash.cloudflare.com/${ACC}/workers-and-pages
  Bấm 'Change' cạnh 'Your subdomain', đặt tên, rồi chạy lại script này."
  fi
  die "Deploy thất bại."
}
echo "$DEPLOY_OUT" | grep -vE "out-of-date|npm install --save-dev|After installation|Please update"
URL=$(printf '%s' "$DEPLOY_OUT" | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1)
[ -n "$URL" ] || die "Deploy xong nhưng không đọc được URL. Xem output ở trên."
ok "URL: $URL"

# ── 5. Kiểm tra sau deploy ──────────────────────────────────────────────────
say "5/5  Kiểm tra"
check() {
  local label="$1" expect="$2" path="$3"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 15 "$URL$path")
  if [ "$code" = "$expect" ]; then ok "$label → $code"
  else printf '\033[31m  %s → %s (chờ %s)\033[0m\n' "$label" "$code" "$expect"; fi
}
check "/health"                       200 "/health"
check "/registry"                     200 "/registry?host=1.0.0&device=kiemtra"
check "/admin (trang)"                200 "/admin"
check "/registry/admin (không token)" 401 "/registry/admin"

cat <<TXT

$(printf '\033[1mCòn lại\033[0m')

  Dashboard:  $URL/admin

  Nối app vào Worker — sửa hai hằng số:
    src/services/miniAppService.ts   REGISTRY_URL = '$URL'
    src/components/Chatbot/index.tsx AI_PROXY_URL = '$URL'

  Bundle mini-app phải nằm trên HTTPS thì app mới tải được; trang /admin chặn
  URL http (trừ localhost).

TXT
