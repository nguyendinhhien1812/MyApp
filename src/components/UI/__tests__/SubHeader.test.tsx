import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import SubHeader from '../SubHeader';
import { ThemeProvider } from '../../../context/ThemeContext';
import { LIGHT, DARK } from '../../../theme/paperTheme';

// SubHeader là header dùng chung của MỌI màn con (CLAUDE.md: "không tự dựng
// header"). Nó hỏng thì hỏng cả loạt màn, nên đáng có test render.

jest.mock('../../Icon', () => 'Icon');

const dung = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SubHeader', () => {
  it('hiện tiêu đề được truyền vào', () => {
    dung(<SubHeader title="Lịch sử giao dịch" onBack={jest.fn()} />);
    expect(screen.getByText('Lịch sử giao dịch')).toBeTruthy();
  });

  it('bấm nút back thì gọi onBack đúng một lần', () => {
    const onBack = jest.fn();
    dung(<SubHeader title="Đầu tư" onBack={onBack} />);
    // Nút back là phần bấm được duy nhất khi không truyền `right`
    fireEvent.press(screen.UNSAFE_getByType(TouchableOpacity));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('không truyền `right` thì không dựng ô phải', () => {
    dung(<SubHeader title="Chi tiêu" onBack={jest.fn()} />);
    expect(screen.queryByText('làm mới')).toBeNull();
  });

  it('truyền `right` thì nội dung đó xuất hiện', () => {
    dung(<SubHeader title="Chi tiêu" onBack={jest.fn()} right={<Text>làm mới</Text>} />);
    expect(screen.getByText('làm mới')).toBeTruthy();
  });

  it('màu chữ tiêu đề lấy từ theme, không hardcode', () => {
    // Bất biến quan trọng hơn giá trị: chỉ cần màu nằm trong palette đang dùng.
    dung(<SubHeader title="Ngân hàng" onBack={jest.fn()} />);
    const style = screen.getByText('Ngân hàng').props.style;
    const mau = (Array.isArray(style) ? Object.assign({}, ...style) : style).color;
    expect([LIGHT.text, DARK.text]).toContain(mau);
  });
});
