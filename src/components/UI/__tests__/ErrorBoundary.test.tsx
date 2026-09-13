import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';
import { ThemeProvider } from '../../../context/ThemeContext';
import { LanguageProvider } from '../../../context/LanguageContext';
import { vi } from '../../../i18n/translations';

// React in cả stack lỗi ra console khi boundary bắt được — ở đây là hành vi
// ĐÚNG nên bịt lại, kẻo output test đầy vệt đỏ trông như hỏng thật.
let errSpy: jest.SpyInstance;
beforeAll(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => errSpy.mockRestore());

const dung = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>,
  );

const No = ({ khi }: { khi: boolean }) => {
  if (khi) {
    throw new Error('lỗi render giả lập');
  }
  return <Text>nội dung bình thường</Text>;
};

describe('ErrorBoundary', () => {
  it('không lỗi thì hiện nguyên nội dung', () => {
    dung(
      <ErrorBoundary>
        <No khi={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('nội dung bình thường')).toBeTruthy();
    expect(screen.queryByText(vi.crash.title)).toBeNull();
  });

  it('con ném lỗi thì hiện màn báo lỗi thay vì màn trắng', () => {
    dung(
      <ErrorBoundary>
        <No khi={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(vi.crash.title)).toBeTruthy();
    expect(screen.queryByText('nội dung bình thường')).toBeNull();
  });

  it('bấm "thử lại" thì dựng lại cây con', () => {
    // Lần dựng đầu ném lỗi, lần sau thì không — mô phỏng lỗi nhất thời.
    let lanDau = true;
    const Chap = () => {
      if (lanDau) {
        lanDau = false;
        throw new Error('chỉ hỏng lần đầu');
      }
      return <Text>đã hồi phục</Text>;
    };

    dung(
      <ErrorBoundary>
        <Chap />
      </ErrorBoundary>,
    );
    expect(screen.getByText(vi.crash.title)).toBeTruthy();

    fireEvent.press(screen.getByText(vi.crash.retry));
    expect(screen.getByText('đã hồi phục')).toBeTruthy();
  });

  it('lỗi tất định thì bấm thử lại vẫn ở màn báo lỗi, không văng ra ngoài', () => {
    dung(
      <ErrorBoundary>
        <No khi={true} />
      </ErrorBoundary>,
    );
    fireEvent.press(screen.getByText(vi.crash.retry));
    // Quan trọng là KHÔNG ném ra ngoài boundary — người dùng bấm mãi cũng chỉ
    // quay lại đây chứ app không sập.
    expect(screen.getByText(vi.crash.title)).toBeTruthy();
  });
});
