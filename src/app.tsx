import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { COLORS_DARK, COLORS_LIGHT } from './theme/ColorScheme';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications

export default function App() {
  const theme = createTheme({
    lightColors: COLORS_LIGHT,
    darkColors: COLORS_DARK,
    mode: 'light',
  });
  return (
    <ThemeProvider theme={theme}>
      <AppNavigator />
    </ThemeProvider>
  );
}
