#!/usr/bin/env bash
# Nạp một file registry lên Worker production.
#
#   ./server/registry-put.sh server/registry.seed.json
#
# Token nhập kín (read -s) nên không lọt vào lịch sử shell, không vào file nào,
# và không đi qua đâu ngoài đúng request này.

set -euo pipefail

WORKER=https://myapp-ai-proxy.kyonguyen00775.workers.dev
FILE="${1:-}"

[ -n "$FILE" ] || { echo "Dùng: ./server/registry-put.sh <file.json>"; exit 1; }
[ -f "$FILE" ]  || { echo "Không thấy file: $FILE"; exit 1; }
python3 -m json.tool "$FILE" >/dev/null || { echo "JSON hỏng."; exit 1; }

printf 'ADMIN_TOKEN: '
read -rs TOKEN
printf '\n'
[ -n "$TOKEN" ] || { echo "Chưa nhập token."; exit 1; }

CODE=$(curl -s -o /tmp/registry-put.out -w '%{http_code}' -m 30 \
  -X PUT "$WORKER/registry/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @"$FILE")

case "$CODE" in
  200) printf '\033[32mĐã lưu.\033[0m\n'; python3 -m json.tool /tmp/registry-put.out ;;
  401) printf '\033[31mToken không đúng.\033[0m\n'; exit 1 ;;
  *)   printf '\033[31mLỗi %s:\033[0m ' "$CODE"; cat /tmp/registry-put.out; echo; exit 1 ;;
esac
rm -f /tmp/registry-put.out
