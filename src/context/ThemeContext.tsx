import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK, ThemeColors } from '../theme/paperTheme';
import { logger } from '../utils/logger';

// mode = lựa chọn của user; scheme = mode thực tế đang áp dụng (đã resolve 'system')
export type ThemeMode = 'light' | 'dark' | 'system';
export type Scheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  scheme: Scheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = '@myapp/theme-mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  scheme: 'light',
  colors: LIGHT,
  setMode: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<Scheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  // Nạp lựa chọn đã lưu (chạy 1 lần)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(err =>
        // Đọc lỗi thì giữ mode 'system' — không cần báo user, app vẫn dùng được
        logger.warn('theme', 'không đọc được theme đã lưu, dùng theo hệ thống', err),
      );
  }, []);

  // Lắng nghe thay đổi màu hệ thống (chỉ có tác dụng khi mode = 'system')
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    // Lưu lỗi thì theme vẫn đổi trong phiên này, chỉ không nhớ cho lần mở sau
    AsyncStorage.setItem(STORAGE_KEY, next).catch(err =>
      logger.warn('theme', 'không lưu được theme, chỉ áp dụng cho phiên này', err),
    );
  };

  const scheme: Scheme = mode === 'system' ? systemScheme : mode;
  const colors = scheme === 'dark' ? DARK : LIGHT;

  const value = useMemo(
    () => ({ mode, scheme, colors, setMode }),
    [mode, scheme, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);

// Hook tiện dụng: chỉ lấy colors (dùng trong makeStyles)
export const useThemeColors = (): ThemeColors => useContext(ThemeContext).colors;
