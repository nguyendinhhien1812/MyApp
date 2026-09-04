import React from 'react';
export type LoyaltyProps = {
    /** Host truyền vào để mini-app không tự đoán chế độ sáng/tối */
    scheme?: 'light' | 'dark';
    onBack?: () => void;
};
declare const LoyaltyScreen: ({ scheme, onBack }: LoyaltyProps) => React.JSX.Element;
export default LoyaltyScreen;
