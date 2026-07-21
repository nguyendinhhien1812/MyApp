import React, { useMemo } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';

type Variant = 'primary' | 'danger' | 'outline' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string; // tên MaterialCommunityIcons (mặc định của Paper)
  style?: StyleProp<ViewStyle>;
}

const MODE: Record<Variant, 'contained' | 'outlined' | 'text'> = {
  primary: 'contained',
  danger: 'contained',
  outline: 'outlined',
  ghost: 'text',
};

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: AppButtonProps) => {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const buttonColor: Record<Variant, string | undefined> = {
    primary: c.primary,
    danger: c.danger,
    outline: undefined,
    ghost: undefined,
  };
  const textColor: Record<Variant, string> = {
    primary: '#fff', // text trên nền cam
    danger: '#fff',
    outline: c.primaryDark,
    ghost: c.primaryDark,
  };

  return (
    <Button
      mode={MODE[variant]}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      buttonColor={buttonColor[variant]}
      textColor={textColor[variant]}
      style={[styles.btn, variant === 'outline' && styles.btnOutline, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}>
      {title}
    </Button>
  );
};

export default AppButton;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    btn: {
      borderRadius: 12,
    },
    btnOutline: {
      borderWidth: 1,
      borderColor: c.primaryBorder,
    },
    content: {
      height: 50,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
