#!/usr/bin/env bash
# Phát hành một phiên bản mini-app: build -> đẩy lên R2 -> in sẵn cấu hình registry.
#
#   ./miniapps/release.sh loyalty 1.1.0
#   ./miniapps/release.sh loyalty 1.1.0 --local     # đẩy vào R2 giả lập của wrangler dev
#
# KHÔNG deploy Worker, KHÔNG phát hành app. Đó chính là điểm của kiến trúc này:
# đổi mini-app không đụng tới host.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP="${1:-}"
VERSION="${2:-}"
LOCAL_FLAG="${3:-}"

BUCKET=myapp-miniapps
export WRANGLER_SEND_METRICS=false

# Gọi thẳng binary trong server/, KHÔNG dùng `npx wrangler` từ gốc repo:
# ở gốc không có wrangler nên npx sẽ tải bản mới nhất (v4), mà v4 đòi Node 22.
WRANGLER="$ROOT/server/node_modules/.bin/wrangler"

die() { printf '\033[31m\n  %s\033[0m\n\n' "$1"; exit 1; }
say() { printf '\n\033[1m%s\033[0m\n' "$1"; }
ok()  { printf '\033[32m  %s\033[0m\n' "$1"; }

[ -n "$APP" ] && [ -n "$VERSION" ] || die "Dùng: ./miniapps/release.sh <mini-app> <x.y.z> [--local]"
[ -x "$WRANGLER" ] || die "Chưa cài wrangler. Chạy: cd server && npm install"
[ -d "miniapps/$APP" ] || die "Không có thư mục miniapps/$APP"
printf '%s' "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$' \
  || die "Phiên bản phải dạng x.y.z (registry so sánh theo số, không theo chuỗi)"

# ── Build ───────────────────────────────────────────────────────────────────
say "1/3  Build $APP"
BUILD="miniapps/$APP/build"
rm -rf "$BUILD"
npx react-native bundle \
  --platform ios --dev false \
  --entry-file "miniapps/$APP/index.js" \
  --config "miniapps/$APP/rspack.config.mjs" \
  --bundle-output "$BUILD/entry.bundle" >/dev/null
rm -f "$BUILD"/entry.bundle* "$BUILD"/index.bundle*

CONTAINER="$BUILD/$APP.container.bundle"
[ -f "$CONTAINER" ] || die "Build xong nhưng không thấy $APP.container.bundle — kiểm tra 'filename' trong rspack.config.mjs"
ok "$(ls -1 "$BUILD" | wc -l | tr -d ' ') file, container $(du -h "$CONTAINER" | cut -f1)"

# ── Chép vào assets của Worker ──────────────────────────────────────────────
say "2/3  Chép vào assets ($APP/$VERSION)"
DEST="$ROOT/server/assets/bundles/$APP/$VERSION"
rm -rf "$DEST"
mkdir -p "$DEST"

# Bỏ .map: chỉ hữu ích khi debug, mà nó phơi toàn bộ mã nguồn mini-app ra public
COUNT=0
while IFS= read -r f; do
  cp "$f" "$DEST/"
  COUNT=$((COUNT + 1))
done < <(find "$BUILD" -type f -name '*.bundle')
ok "$COUNT file vào server/assets/bundles/$APP/$VERSION"

VERSIONS=$(find "$ROOT/server/assets/bundles" -mindepth 2 -maxdepth 2 -type d 2>/dev/null | wc -l | tr -d ' ')
ok "tổng cộng $VERSIONS phiên bản đang nằm trong assets"

if [ "$LOCAL_FLAG" = "--local" ]; then
  say "Bỏ qua deploy (--local). Chạy lại không có --local để đẩy lên Cloudflare."
else
  # Assets là MỘT PHẦN của bản deploy: deploy lại là cách duy nhất để file mới
  # có mặt, và cũng có nghĩa là thư mục phải đầy đủ mọi phiên bản còn muốn giữ.
  say "3/3  Deploy Worker (assets đi kèm bản deploy)"
  (cd "$ROOT/server" && "$WRANGLER" deploy) 2>&1 \
    | grep -vE "out-of-date|npm install --save-dev|After installation|Please update" \
    || die "Deploy thất bại."
fi

# ── In cấu hình cho registry ────────────────────────────────────────────────
BASE="https://myapp-ai-proxy.kyonguyen00775.workers.dev/bundles/$APP/$VERSION"
say "Dán vào registry (trang /admin)"
cat <<TXT

  version    $VERSION
  container  $BASE/$APP.container.bundle
  chunkBase  $BASE
  status     draft        <- để draft, mở rollout dần sau khi thử
  rollout    0

  Thử trực tiếp:
    curl -I $BASE/$APP.container.bundle

TXT
