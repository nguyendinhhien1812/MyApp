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
import Splash from './components/Splash';

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
        <AppNavigator />
        <Splash />
      </PaperProvider>
    </RNEThemeProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
