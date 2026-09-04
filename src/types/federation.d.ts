// Remote Module Federation không có file nguồn ở repo này — bundle tải lúc chạy.
// Khai báo để `import('loyalty/App')` không đỏ trong TypeScript.
//
// Props phải khớp LoyaltyProps ở miniapps/loyalty/src/LoyaltyScreen.tsx.
// Hai bên build riêng nên TypeScript KHÔNG kiểm chéo được — đổi props một bên
// mà quên bên kia thì chỉ vỡ lúc chạy.
declare module 'loyalty/App' {
  import type { ComponentType } from 'react';
  const LoyaltyScreen: ComponentType<{
    scheme?: 'light' | 'dark';
    onBack?: () => void;
  }>;
  export default LoyaltyScreen;
}
