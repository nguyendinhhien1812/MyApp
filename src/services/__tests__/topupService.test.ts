import { listCarriers, getCarrier, listDenoms, popularDenom } from '../topupService';

describe('nhà mạng', () => {
  it('mã nhà mạng không trùng', () => {
    const ids = listCarriers().map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getCarrier lấy đúng nhà mạng theo mã', () => {
    for (const c of listCarriers()) {
      expect(getCarrier(c.id).id).toBe(c.id);
    }
  });

  it('mã lạ không làm nổ — vẫn trả về một nhà mạng để màn hình có cái mà vẽ', () => {
    // Ép kiểu vì đây đúng là ca "dữ liệu bẩn từ ngoài vào"
    expect(() => getCarrier('khong-co' as never)).not.toThrow();
    expect(getCarrier('khong-co' as never)).toBeDefined();
  });
});

describe('mệnh giá', () => {
  it('đều là số dương', () => {
    expect(listDenoms().every(d => d > 0)).toBe(true);
  });

  it('sắp tăng dần', () => {
    const d = listDenoms();
    expect([...d].sort((a, b) => a - b)).toEqual(d);
  });

  it('mệnh giá phổ biến phải nằm trong danh sách', () => {
    expect(listDenoms()).toContain(popularDenom());
  });

  it('sửa kết quả không đụng dữ liệu gốc', () => {
    const n = listDenoms().length;
    listDenoms().pop();
    expect(listDenoms()).toHaveLength(n);
  });
});
