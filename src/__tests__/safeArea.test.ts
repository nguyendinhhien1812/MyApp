import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// `SafeAreaView` của 'react-native' CHỈ chạy trên iOS — ở Android nó là <View>
// rỗng, không chừa chỗ nào. Dự án đặt targetSdk 35, mà từ Android 15 hệ điều
// hành ÉP edge-to-edge: nội dung vẽ tràn xuống dưới thanh trạng thái nếu app
// không tự chừa. Kết quả là tiêu đề đè lên đồng hồ ở mọi màn.
//
// Phải lấy SafeAreaView từ 'react-native-safe-area-context' (và
// SafeAreaProvider phải bọc ngoài cùng trong src/app.tsx, nếu không
// useSafeAreaInsets() trả về 0).

const moiFileNguon = (goc: string): string[] => {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (f !== '__tests__') {
          walk(p);
        }
      } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        out.push(p);
      }
    }
  };
  walk(goc);
  return out;
};

describe('vùng an toàn', () => {
  const files = moiFileNguon('src');

  it('quét được file để kiểm (chống test rỗng tự khen)', () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it("không file nào nhập SafeAreaView từ 'react-native'", () => {
    const sai: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
        if (m[2] === 'react-native' && /\bSafeAreaView\b/.test(m[1])) {
          sai.push(f);
        }
      }
    }
    expect(sai).toEqual([]);
  });

  it('SafeAreaProvider được gắn ở gốc', () => {
    const app = readFileSync('src/app.tsx', 'utf8');
    expect(app).toContain("from 'react-native-safe-area-context'");
    expect(app).toMatch(/<SafeAreaProvider>/);
  });
});
