import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';

import MainNavigator from './MainNavigator';
import { useAppTheme } from '../context/ThemeContext';

const AppNavigator = () => {
  const { scheme, colors } = useAppTheme();

  // Theme nền cho navigator để không nháy trắng khi chuyển màn ở chế độ tối
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.white,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
