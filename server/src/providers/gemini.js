// Provider Gemini (Google).
//
// App luôn nói MỘT giao thức duy nhất — hình dạng của Anthropic. Provider này
// dịch qua lại sang hình dạng Gemini, nên đổi provider không cần đụng tới app.
//
// Chỗ dễ sai nhất: Anthropic ghép lời gọi tool với kết quả qua `tool_use_id`,
// còn Gemini ghép qua TÊN hàm. Dịch xuôi thì phải tra ngược id -> tên; dịch
// ngược thì phải bịa ra một id.

export const NAME = 'gemini';

// Google khai tử model khá nhanh: 1.5-flash rồi 2.0-flash đều đã ngừng.
// Khi API trả 404, thông điệp lỗi có nêu tên bản thay thế — đọc log Worker.
const MODEL = 'gemini-3.6-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const isConfigured = env => Boolean(env.GEMINI_API_KEY);

/** Anthropic messages -> Gemini contents. Hàm thuần, test được. */
export const toGeminiContents = messages => {
  // id -> tên, lấy từ các lượt tool_use đi trước, để dịch được tool_result
  const nameById = new Map();
  for (const m of messages) {
    if (!Array.isArray(m.content)) { continue; }
    for (const b of m.content) {
      if (b.type === 'tool_use') { nameById.set(b.id, b.name); }
    }
  }

  return messages
    .map(m => {
      const role = m.role === 'assistant' ? 'model' : 'user';

      if (typeof m.content === 'string') {
        return { role, parts: [{ text: m.content }] };
      }
      if (!Array.isArray(m.content)) { return null; }

      const parts = m.content
        .map(b => {
          if (b.type === 'text') { return { text: b.text }; }
          if (b.type === 'tool_use') {
            return { functionCall: { name: b.name, args: b.input ?? {} } };
          }
          if (b.type === 'tool_result') {
            const name = nameById.get(b.tool_use_id);
            // Không tra được tên thì bỏ hẳn: gửi functionResponse không tên lên
            // Gemini là lỗi 400, mà lỗi đó rất khó lần ra từ phía app.
            if (!name) { return null; }
            let result = b.content;
            try { result = JSON.parse(b.content); } catch { /* để nguyên chuỗi */ }
            return { functionResponse: { name, response: { result } } };
          }
          return null;
        })
        .filter(Boolean);

      return parts.length ? { role, parts } : null;
    })
    .filter(Boolean);
};

/** Tool khai theo chuẩn Anthropic -> chuẩn Gemini. Chỉ khác tên khoá. */
export const toGeminiTools = tools =>
  tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    parameters: input_schema,
  }));

const call = async (env, path, body) => {
  const res = await fetch(`${BASE}/${MODEL}:${path}key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
};

const buildBody = ({ system, messages, tools }) => ({
  system_instruction: { parts: [{ text: system }] },
  contents: toGeminiContents(messages),
  ...(tools ? { tools: [{ function_declarations: toGeminiTools(tools) }] } : {}),
});

export const complete = async ({ env, system, messages, tools }) => {
  const res = await call(env, 'generateContent?', buildBody({ system, messages, tools }));
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(`gemini ${res.status}: ${data?.error?.message ?? 'lỗi không rõ'}`);
  }

  const part = data.candidates?.[0]?.content?.parts?.[0];

  if (tools && part?.functionCall) {
    // Gemini không cấp id — tự sinh, app chỉ cần nó khớp ở lượt tool_result sau
    return {
      kind: 'tool',
      id: `gem_${part.functionCall.name}`,
      name: part.functionCall.name,
      input: part.functionCall.args ?? {},
    };
  }

  return { kind: 'text', text: (part?.text ?? '').trim() };
};

export const streamText = async function* ({ env, system, messages }) {
  const res = await call(env, 'streamGenerateContent?alt=sse&', buildBody({ system, messages }));
  if (!res.ok) {
    // Đọc cả thân lỗi: chỉ có mã trạng thái thì không lần ra nguyên nhân
    const detail = await res.text().catch(() => '');
    throw new Error(`gemini stream ${res.status}: ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) { break; }
    buffer += dec.decode(value, { stream: true });

    // Giữ lại đoạn cuối chưa trọn dòng cho lần đọc sau
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) { continue; }
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') { continue; }
      try {
        const text = JSON.parse(payload).candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { yield text; }
      } catch {
        // Một dòng hỏng không nên giết cả stream
        console.error('sse gemini parse lỗi', payload.slice(0, 120));
      }
    }
  }
};
