// Provider Claude (Anthropic).
//
// Giao diện chung của mọi provider — index.js chỉ biết đúng ba thứ này:
//   isConfigured(env) -> có key chưa
//   complete({...})   -> { kind: 'text' | 'tool' | 'refusal', ... }
//   streamText({...}) -> async iterator nhả từng đoạn chữ

import Anthropic from '@anthropic-ai/sdk';

export const NAME = 'claude';

const MODEL = 'claude-opus-5';

// Trả lời chat ngắn nên 2048 token là thừa; đây là trần chi phí cố ý.
const MAX_TOKENS = 2048;

// effort 'low': trợ lý hỏi-đáp ngắn, không phải tác vụ suy luận dài.
// Nâng lên 'medium'/'high' nếu câu trả lời thấy hời hợt.
const EFFORT = 'low';

export const isConfigured = env => Boolean(env.ANTHROPIC_API_KEY);

const buildParams = ({ system, messages, tools }) => ({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  system,
  messages,
  output_config: { effort: EFFORT },
  // Bộ lọc an toàn từ chối thì chạy lại trên model dự phòng ngay trong cùng lời
  // gọi, thay vì trả về một câu cụt cho người dùng.
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
  ...(tools ? { tools } : {}),
});

const client = env => new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const complete = async ({ env, system, messages, tools }) => {
  const message = await client(env).beta.messages.create(buildParams({ system, messages, tools }));

  if (message.stop_reason === 'refusal') {
    return { kind: 'refusal', category: message.stop_details?.category ?? null };
  }

  const toolUse = message.content.find(b => b.type === 'tool_use');
  if (tools && toolUse) {
    return { kind: 'tool', id: toolUse.id, name: toolUse.name, input: toolUse.input ?? {} };
  }

  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();

  return { kind: 'text', text };
};

export const streamText = async function* ({ env, system, messages }) {
  const stream = client(env).beta.messages.stream(buildParams({ system, messages }));

  for await (const event of stream) {
    // Chỉ lấy chữ. Block `thinking` cố ý KHÔNG gửi cho client.
    if (
      event.type === 'content_block_delta' &&
      event.delta?.type === 'text_delta' &&
      event.delta.text
    ) {
      yield event.delta.text;
    }
  }

  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') {
    throw new Error('refusal');
  }
};
