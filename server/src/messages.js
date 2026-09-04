// Lọc và chuẩn hoá message trước khi gửi lên Claude.
// Hình dạng dữ liệu:
// Tách khỏi index.js để test cạn được: đây là chỗ chặn client bịa cấu trúc,
// nhồi prompt khổng lồ, hay gọi tool ngoài danh sách khai báo.

import { isAllowedTool } from './tools.js';

// Chặn người ta mượn proxy để chạy prompt khổng lồ
export const MAX_TURNS = 20;
export const MAX_CHARS_PER_TURN = 2000;

// Hình dạng của Anthropic: mỗi message là { role: 'user'|'assistant', content }
// với content là chuỗi, hoặc mảng block khi có tool_use / tool_result.
export const sanitizeMessages = raw => {
  if (!Array.isArray(raw)) {
    return null;
  }

  const cleaned = raw
    .slice(-MAX_TURNS)
    .map(item => {
      const role = item?.role === 'assistant' ? 'assistant' : 'user';

      // Chuỗi thuần — lượt chat bình thường
      if (typeof item?.content === 'string') {
        const text = item.content.trim();
        return text ? { role, content: text.slice(0, MAX_CHARS_PER_TURN) } : null;
      }

      if (!Array.isArray(item?.content)) {
        return null;
      }

      // Mảng block: chỉ giữ text / tool_use / tool_result, và chặn tên tool lạ
      const blocks = item.content
        .map(b => {
          if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim()) {
            return { type: 'text', text: b.text.slice(0, MAX_CHARS_PER_TURN) };
          }
          if (b?.type === 'tool_use') {
            if (!isAllowedTool(b.name) || !b.id) { return null; }
            return { type: 'tool_use', id: b.id, name: b.name, input: b.input ?? {} };
          }
          if (b?.type === 'tool_result') {
            if (!b.tool_use_id) { return null; }
            // content của tool_result do APP sinh ra, nhưng vẫn cắt độ dài
            const text = typeof b.content === 'string' ? b.content : JSON.stringify(b.content ?? null);
            return { type: 'tool_result', tool_use_id: b.tool_use_id, content: String(text).slice(0, MAX_CHARS_PER_TURN) };
          }
          return null;
        })
        .filter(Boolean);

      return blocks.length ? { role, content: blocks } : null;
    })
    .filter(Boolean);

  if (!cleaned.length) {
    return null;
  }

  // Anthropic bắt buộc message đầu tiên phải là 'user'
  const firstUser = cleaned.findIndex(c => c.role === 'user');
  if (firstUser < 0) { return null; }
  return cleaned.slice(firstUser);
};

