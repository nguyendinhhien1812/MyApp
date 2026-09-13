import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// Nút CHỈ CÓ ICON mà không có accessibilityLabel thì VoiceOver/TalkBack đọc là
// "button" trống — người dùng không đoán nổi nó làm gì. Nút có chữ bên trong
// thì React Native tự lấy chữ làm nhãn, không cần khai thêm.
//
// Không dùng regex để cắt thẻ mở: `onPress={() => x}` có dấu '>' nên regex sẽ
// ngắt sớm và tưởng nhãn nằm ngoài thẻ. Phải đếm độ sâu ngoặc và bỏ qua chuỗi.

const THE = ['TouchableOpacity', 'Pressable'] as const;

const moiFileTsx = (goc: string): string[] => {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (f !== '__tests__') {
          walk(p);
        }
      } else if (p.endsWith('.tsx')) {
        out.push(p);
      }
    }
  };
  walk(goc);
  return out;
};

/** Vị trí dấu '>' kết thúc thẻ mở bắt đầu tại `i`, hoặc -1. */
const ketThucTheMo = (src: string, i: number, tag: string) => {
  let sau = 0;
  let nhay: string | null = null;
  for (let j = i + tag.length + 1; j < src.length; j++) {
    const ch = src[j];
    if (nhay) {
      if (ch === nhay && src[j - 1] !== '\\') {
        nhay = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      nhay = ch;
    } else if (ch === '{') {
      sau++;
    } else if (ch === '}') {
      sau--;
    } else if (sau === 0 && ch === '>') {
      return j;
    }
  }
  return -1;
};

const timNutThieuNhan = (goc: string) => {
  const thieu: string[] = [];
  let tong = 0;
  for (const f of moiFileTsx(goc)) {
    const src = readFileSync(f, 'utf8');
    for (const tag of THE) {
      let from = 0;
      for (;;) {
        const i = src.indexOf('<' + tag, from);
        if (i < 0) {
          break;
        }
        from = i + 1;
        const het = ketThucTheMo(src, i, tag);
        if (het < 0) {
          break;
        }
        tong++;
        const attrs = src.slice(i, het);
        const tuDong = src[het - 1] === '/';
        let body = '';
        if (!tuDong) {
          const end = src.indexOf('</' + tag, het);
          body = end < 0 ? '' : src.slice(het, end);
        }
        if (/accessibilityLabel/.test(attrs) || /<Text[\s>]/.test(body)) {
          continue;
        }
        thieu.push(`${f}:${src.slice(0, i).split('\n').length}`);
      }
    }
  }
  return { thieu, tong };
};

describe('trợ năng', () => {
  const { thieu, tong } = timNutThieuNhan('src');

  it('quét được nút để kiểm (chống test rỗng tự khen)', () => {
    // Nếu bộ phân tích hỏng và trả về 0 nút, test dưới sẽ xanh một cách vô
    // nghĩa. Chốt một sàn để điều đó lộ ra.
    expect(tong).toBeGreaterThan(80);
  });

  it('không nút chỉ-có-icon nào thiếu accessibilityLabel', () => {
    expect(thieu).toEqual([]);
  });
});
