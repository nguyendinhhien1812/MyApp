# myapp-ai-proxy

Cloudflare Worker đứng giữa app MyApp và nhà cung cấp model (Claude hoặc Gemini). Lý do tồn tại: **API key nhúng
trong app di động luôn moi ra được** — kể cả để trong `.env`, vì `.env` kiểu React Native
chỉ được inline vào bundle lúc build chứ không phải bí mật. Đưa key lên đây thì app chỉ
biết URL proxy, không biết key.

## Bản đang chạy

`https://myapp-ai-proxy.kyonguyen00775.workers.dev`

Dashboard: `https://myapp-ai-proxy.kyonguyen00775.workers.dev/admin`

## Chọn provider

Worker nhìn xem secret nào đang có rồi tự chọn:

| Secret có mặt | Dùng |
|---|---|
| `ANTHROPIC_API_KEY` | Claude (`claude-opus-5`) |
| `GEMINI_API_KEY` | Gemini (`gemini-2.0-flash`) |
| cả hai | Claude — nó đứng trước trong `PROVIDERS` |
| không có cái nào | `/chat` trả `no_provider`, app rơi về chế độ demo |

Đổi provider = nạp secret khác rồi thôi. **Không sửa một dòng nào ở app.**

Làm được vậy vì app luôn nói một giao thức duy nhất — hình dạng message của
Anthropic — còn Worker lo phần dịch. Chỗ khó nhất nằm ở `providers/gemini.js`:
Anthropic ghép lời gọi tool với kết quả qua `tool_use_id`, Gemini ghép qua **tên**
hàm, nên phải tra ngược id → tên khi dịch xuôi và bịa ra id khi dịch ngược.

Lấy key: Claude ở `platform.claude.com/settings/keys` (cần credit),
Gemini ở `aistudio.google.com/apikey` (có gói miễn phí).

```bash
npx wrangler secret put GEMINI_API_KEY      # hoặc ANTHROPIC_API_KEY
```

## Endpoint

| Method | Path | Body | Trả về |
|---|---|---|---|
| `POST` | `/chat` | `{ "contents": [{ "role": "user", "parts": [{ "text": "..." }] }] }` | `{ "text": "..." }` |
| `GET` | `/health` | — | `{ "ok": true }` |
| `GET` | `/registry` | — (query `host`, `device`, `pin`) | `{ "miniApps": [...] }` |
| `GET`/`PUT` | `/registry/admin` | toàn bộ registry | cần `Authorization: Bearer $ADMIN_TOKEN` |
| `GET` | `/registry/admin/log` | — | Nhật ký thay đổi (cần token) |
| `GET` | `/registry/simulate` | query `app`, `host`, `n` | Ước lượng phân bố rollout (cần token) |
| `GET` | `/bundles/<app>/<ver>/<file>` | — | Bundle mini-app (Workers Assets) |
| `GET` | `/admin` | — | Trang quản trị (HTML) |

Lỗi trả `{ "error": "<mã>" }`; riêng `rate_limited` (429) kèm `message` tiếng Việt để app
hiển thị thẳng cho người dùng.

System prompt nằm ở server, không nhận từ client — để client không sửa được vai trò của
trợ lý.

## Hạn mức

Sửa trong `src/index.js`:

- `PER_IP_HOURLY = 20` — mỗi IP tối đa 20 tin/giờ
- `DAILY_TOTAL = 1000` — trần tổng mỗi ngày
- `MAX_TURNS = 20`, `MAX_CHARS_PER_TURN = 2000` — chặn prompt khổng lồ

Đây là **trần thiệt hại** nếu URL proxy bị lộ, không phải tường lửa. Đừng nới tuỳ tiện.

Bộ đếm dùng Cloudflare KV, vốn nhất quán kiểu eventual — bị dội nhiều request cùng lúc thì
số đếm có thể hụt vài đơn vị. Chấp nhận được cho hàng rào thô; cần chính xác tuyệt đối thì
phải đổi sang Durable Objects.

## Triển khai

Đăng nhập một lần (mở trình duyệt):

```bash
cd server && npx wrangler login
```

Rồi chạy script — nó tạo KV, hỏi secret, deploy và tự kiểm tra sau deploy:

```bash
./server/deploy.sh
```

Script chạy lại được nhiều lần; bước nào xong thì bỏ qua. Secret nhập qua lời nhắc của
`wrangler secret put`, không đi qua file nào trong repo.

Nếu muốn làm tay, các lệnh bên dưới:

```bash
cd server && npm install
```

```bash
npx wrangler login
```

Tạo KV namespace rồi dán `id` in ra vào `wrangler.toml`:

```bash
npx wrangler kv namespace create RATE_LIMIT
```

Nạp key Anthropic (tạo tại platform.claude.com/settings/keys — API tính theo credit, không có gói miễn phí). Lệnh này hỏi key qua stdin, key
**không** nằm trong repo và không hiện trong lịch sử shell:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Deploy:

```bash
npx wrangler deploy
```

Xong sẽ in ra URL dạng `https://myapp-ai-proxy.<tên>.workers.dev`. Dán URL đó vào
`AI_PROXY_URL` trong `src/components/Chatbot/index.tsx`.

## Bundle mini-app (Workers Assets)

Bundle nằm trong `server/assets/bundles/<app>/<version>/`, phục vụ qua route `/bundles/*`.

`run_worker_first = true` nên mọi request đi vào code Worker trước; asset chỉ với tới được
qua binding `ASSETS`. Nhờ vậy giữ được header, ETag và các chốt chặn ở `handleBundle` thay
vì để tầng asset trả file thô.

**Không dùng R2** vì bật R2 đòi thông tin thanh toán kể cả với gói miễn phí.

### Cái bẫy phải nhớ

`assets/` là **một phần của bản deploy**. Deploy khi thư mục thiếu file = **gỡ sạch mọi
mini-app đang chạy**. Hai hệ quả:

- `server/assets/` được **commit**, không gitignore. Nó là artifact đã phát hành, không
  phải rác build.
- `deploy.sh` hỏi lại nếu `assets/bundles` rỗng, thay vì im lặng xoá.

### Đánh đổi so với R2

Đổi mini-app vẫn phải deploy lại Worker — mất tính "mini-app deploy hoàn toàn độc lập".
Nhưng **app vẫn không cần phát hành lại**, và registry vẫn điều khiển phiên bản lẫn rollout
y như cũ. Muốn độc lập thật thì bật R2 rồi đổi `handleBundle` sang đọc `env.BUNDLES`.

### Phát hành

```bash
./miniapps/release.sh loyalty 1.1.0
```

Build → chép vào `assets/` → deploy → in sẵn `container`/`chunkBase` để dán vào `/admin`.

Đường dẫn có sẵn số phiên bản nên nội dung không bao giờ đổi → `Cache-Control: immutable`.

File `.map` **không** được đẩy lên: chỉ hữu ích khi debug, mà lại phơi toàn bộ mã nguồn
mini-app cho bất kỳ ai đoán ra URL.

## Trang quản trị

Mở `https://<worker>/admin`, nhập `ADMIN_TOKEN`.

| Việc | Cách làm |
|---|---|
| Sửa phiên bản | Bảng trong từng thẻ mini-app |
| Tăng/giảm rollout | Nút nhanh `0 · 10 · 25 · 50 · 100` |
| Xem ai nhận bản nào | **Mô phỏng phát hành** — chạy 4000 thiết bị giả qua đúng `resolveVersion` |
| Kiểm một thiết bị cụ thể | Khối *Thiết bị này sẽ nhận gì*, gọi `/registry` thật |
| Xem đã đổi những gì | **Nhật ký thay đổi**, giữ 50 lần gần nhất |

Trang **không tự tính** phiên bản nào tới thiết bị nào — nó hỏi server, vì logic chọn nằm ở
`registry.js`. Cài lại lần hai ở phía trình duyệt là tự mua đường để hai bên nói khác nhau.

Mô phỏng chạy trên bản **đã lưu**, nên nút bị khoá khi còn thay đổi treo.

Cảnh báo đáng chú ý nhất: *"bản X đang active nhưng không thiết bị nào nhận"* — thường do một
bản cao hơn đã phủ 100%, tức là đợt rollout từng phần bạn tưởng đang chạy thật ra không chạy.

Chặn trước khi lưu: trùng id, trùng phiên bản, semver sai dạng, thiếu tên tiếng Việt, bản
`active` thiếu `container`/`chunkBase`, và URL không phải `https` (chỉ `http://localhost`
được phép, để chạy thử).

Trang HTML là công khai nhưng **không chứa secret** — mọi thao tác đọc/ghi vẫn phải kèm
token, và token chỉ nằm trong `sessionStorage` của tab đang mở.

Chạy thử ở máy: tạo `server/.dev.vars` (đã bị `.gitignore`) rồi `npm run dev`.

```
ADMIN_TOKEN=mot-token-nao-do
```

## Kiểm tra

```bash
curl https://myapp-ai-proxy.<tên>.workers.dev/health
```

```bash
curl -X POST https://myapp-ai-proxy.<tên>.workers.dev/chat -H 'Content-Type: application/json' -d '{"contents":[{"role":"user","parts":[{"text":"Chào bạn"}]}]}'
```

Xem log thời gian thực:

```bash
npx wrangler tail
```

## Tool calling

`POST /chat/tools` là **chặng 1** của vòng tool calling. Model đọc câu hỏi rồi quyết
định gọi hàm nào; endpoint trả về một trong hai:

```json
{ "functionCall": { "name": "totalSpent", "args": {} } }
```
```json
{ "text": "..." }
```

Chặng này **không stream được** — thứ trả về là lệnh gọi hàm chứ không phải chữ.

App thực thi hàm bằng `src/services/toolRunner.ts` rồi gọi tiếp `/chat/stream`, lần
này kèm cả `functionCall` và `functionResponse` trong `contents`. Chặng cuối mới stream.

Danh sách hàm nằm ở `src/tools.js`. **Mọi hàm đều chỉ đọc** — không có hàm nào chuyển
tiền. `openScreen` chỉ mở màn và điền sẵn, người dùng vẫn phải tự bấm xác nhận.

Tên hàm được chặn hai lớp: khi model trả lệnh gọi, và khi client gửi lại lịch sử.
Model bịa ra `transferMoney` thì lượt đó bị loại bỏ chứ không đi tiếp tới Claude.
