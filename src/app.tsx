import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import {
  ThemeProvider as RNEThemeProvider,
  createTheme,
} from '@rneui/themed';
import { PaperProvider } from 'react-native-paper';
import { COLORS_DARK, COLORS_LIGHT } from './theme/ColorScheme';
import { paperLightTheme, paperDarkTheme } from './theme/paperTheme';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Splash from './components/Splash';
import ErrorBoundary from './components/UI/ErrorBoundary';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications

// Bên trong ThemeProvider — chọn theme Paper/rneui/StatusBar theo scheme hiện tại
const ThemedApp = () => {
  const { scheme } = useAppTheme();
  const isDark = scheme === 'dark';

  const rneTheme = createTheme({
    lightColors: COLORS_LIGHT,
    darkColors: COLORS_DARK,
    mode: isDark ? 'dark' : 'light',
  });

  return (
    <RNEThemeProvider theme={rneTheme}>
      <PaperProvider theme={isDark ? paperDarkTheme : paperLightTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#121212' : '#F2F2F7'}
        />
        {/* Bọc TRONG hai Provider để màn báo lỗi còn dùng được theme và i18n,
            và NGOÀI navigator để bắt được cả lỗi của chính navigator. Splash
            để ngoài: nó phải hiện được kể cả khi cây bên dưới đã sập. */}
        <ErrorBoundary scope="navigator">
          <AppNavigator />
        </ErrorBoundary>
        <Splash />
      </PaperProvider>
    </RNEThemeProvider>
  );
};

export default function App() {
  return (
    // SafeAreaProvider phải ở NGOÀI CÙNG: thiếu nó thì useSafeAreaInsets() trả
    // về 0 và SafeAreaView của safe-area-context không chừa chỗ nào.
    // Bắt buộc với targetSdk 35: từ Android 15 hệ điều hành ép edge-to-edge,
    // nội dung vẽ tràn xuống dưới thanh trạng thái nếu app không tự chừa.
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemedApp />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
