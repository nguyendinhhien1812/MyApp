import { vi, en, translations } from '../translations';

// tsc đã lo phần "en có đủ khoá của vi chưa" (en được khai kiểu Translations
// = typeof vi). Những gì dưới đây là thứ kiểu không bắt được: chuỗi rỗng, và
// chuỗi CHÉP NGUYÊN tiếng Việt sang en — lỗi hay gặp khi thêm khoá mới vội.

// Ký tự chỉ có trong tiếng Việt. Dùng để phân biệt "quên dịch" với "trùng nhau
// một cách hợp lệ" (tên riêng, thuật ngữ: GitHub, MWG, QR Pay, HOSE/HNX...).
const CHU_VIET =
  /[ăâđêôơưĂÂĐÊÔƠƯáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;

// "500.000đ" giữ nguyên ở bản en là ĐÚNG — đó là ký hiệu tiền tệ, không phải
// chữ chưa dịch. Bỏ nó ra trước khi dò, nếu không 4 khoá notification.* sẽ
// báo động giả mãi mãi.
const boKyHieuTien = (s: string) => s.replace(/(\d)\s?[đĐ]/g, '$1');
const conChuViet = (s: string) => CHU_VIET.test(boKyHieuTien(s));

type Node = { [k: string]: string | Node };

/** Duyệt mọi khoá lá, trả về [đường.dẫn, giá trị vi, giá trị en]. */
const duyetLa = (a: Node, b: Node, path: string[] = []): [string, string, unknown][] => {
  const out: [string, string, unknown][] = [];
  for (const k of Object.keys(a)) {
    const av = a[k];
    const bv = (b ?? {})[k];
    if (av && typeof av === 'object') {
      out.push(...duyetLa(av, bv as Node, [...path, k]));
    } else {
      out.push([[...path, k].join('.'), av as string, bv]);
    }
  }
  return out;
};

const LA = duyetLa(vi as unknown as Node, en as unknown as Node);

describe('translations', () => {
  it('có khoá để duyệt (chống test rỗng tự khen)', () => {
    // Nếu cấu trúc file đổi kiểu khiến duyetLa trả về mảng rỗng, mọi test dưới
    // sẽ xanh một cách vô nghĩa. Chốt một sàn để điều đó lộ ra.
    expect(LA.length).toBeGreaterThan(300);
  });

  it('không khoá nào rỗng ở cả hai ngôn ngữ', () => {
    const rong = LA.filter(
      ([, v, e]) =>
        (typeof v === 'string' && !v.trim()) || (typeof e === 'string' && !e.trim()),
    ).map(([p]) => p);
    expect(rong).toEqual([]);
  });

  it('không chuỗi tiếng Việt nào bị chép nguyên sang en', () => {
    const quenDich = LA.filter(
      ([, v, e]) => typeof v === 'string' && v === e && conChuViet(v),
    ).map(([p, v]) => `${p} = ${JSON.stringify(v)}`);
    expect(quenDich).toEqual([]);
  });

  it('en không chứa chữ tiếng Việt ở bất kỳ khoá nào', () => {
    // Bắt cả trường hợp dịch NỬA CHỪNG: "Transfer tiền" — v !== e nên test
    // trên không thấy, nhưng vẫn là lỗi.
    const conSotViet = LA.filter(([, , e]) => typeof e === 'string' && conChuViet(e))
      .map(([p, , e]) => `${p} = ${JSON.stringify(e)}`);
    expect(conSotViet).toEqual([]);
  });

  it('translations trỏ đúng vào hai bảng', () => {
    expect(translations.vi).toBe(vi);
    expect(translations.en).toBe(en);
  });
});
