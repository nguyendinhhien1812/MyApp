// Nạp bundle mini-app từ xa và giữ lại component đã nạp.
//
// Vì sao có bảng LOADERS cứng ở đây: Module Federation nối dây lúc BUILD, nên
// host chỉ nạp được những remote đã khai trong rspack.config.mjs. Registry
// điều khiển được PHIÊN BẢN, URL và tỉ lệ rollout của các remote đó mà không
// cần phát hành app mới — nhưng thêm một mini-app hoàn toàn mới thì vẫn phải
// ra bản host mới. Đây là giới hạn thật, không phải thiếu sót tạm thời.

import type { ComponentType } from 'react';

export type MiniAppComponent = ComponentType<{
  scheme?: 'light' | 'dark';
  onBack?: () => void;
}>;

const LOADERS: Record<string, () => Promise<{ default: MiniAppComponent }>> = {
  loyalty: () => import('loyalty/App'),
};

// Bundle đã tải thì giữ luôn — mở lại mini-app không phải tải lần nữa
const loaded = new Map<string, MiniAppComponent>();

/** Host này có biết cách nạp mini-app đó không. */
export const isLoadable = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(LOADERS, id);

export const getLoaded = (id: string): MiniAppComponent | undefined => loaded.get(id);

export const loadMiniApp = async (id: string): Promise<MiniAppComponent> => {
  const cached = loaded.get(id);
  if (cached) { return cached; }

  const loader = LOADERS[id];
  if (!loader) {
    throw new Error(`Host chưa khai báo remote "${id}"`);
  }

  const mod = await loader();
  const Component = mod?.default;
  if (typeof Component !== 'function') {
    // Tải được file nhưng nội dung không phải component — thường là build sai
    // entry, hoặc URL trỏ nhầm sang bundle khác.
    throw new Error(`Bundle "${id}" không xuất ra component`);
  }

  loaded.set(id, Component);
  return Component;
};
