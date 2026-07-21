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
      .catch(() => {});
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
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
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
