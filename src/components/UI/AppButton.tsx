import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { BRAND } from '../../theme/paperTheme';

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

const BUTTON_COLOR: Record<Variant, string | undefined> = {
  primary: BRAND.primary,
  danger: BRAND.danger,
  outline: undefined,
  ghost: undefined,
};

const TEXT_COLOR: Record<Variant, string> = {
  primary: BRAND.white,
  danger: BRAND.white,
  outline: BRAND.primaryDark,
  ghost: BRAND.primaryDark,
};

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: AppButtonProps) => (
  <Button
    mode={MODE[variant]}
    onPress={onPress}
    loading={loading}
    disabled={disabled || loading}
    icon={icon}
    buttonColor={BUTTON_COLOR[variant]}
    textColor={TEXT_COLOR[variant]}
    style={[styles.btn, variant === 'outline' && styles.btnOutline, style]}
    contentStyle={styles.content}
    labelStyle={styles.label}>
    {title}
  </Button>
);

export default AppButton;

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: BRAND.primaryBorder,
  },
  content: {
    height: 50,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
