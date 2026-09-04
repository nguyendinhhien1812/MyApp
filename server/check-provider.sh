#!/usr/bin/env bash
# Hỏi Worker xem nó THỰC SỰ thấy provider nào đã cấu hình.
# Chỉ trả boolean — không bao giờ in giá trị key ra.
set -euo pipefail
WORKER=https://myapp-ai-proxy.kyonguyen00775.workers.dev

printf 'ADMIN_TOKEN: '
read -rs TOKEN
printf '\n\n'
[ -n "$TOKEN" ] || { echo "Chưa nhập token."; exit 1; }

OUT=$(curl -s -m 30 -H "Authorization: Bearer $TOKEN" "$WORKER/health")
if ! printf '%s' "$OUT" | grep -q '"configured"'; then
  echo "Token không đúng, hoặc Worker chưa có bản mới. Nhận: $OUT"
  exit 1
fi
printf '%s' "$OUT" | python3 -m json.tool
