import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { BRAND } from '../../theme/paperTheme';

type Tone = 'default' | 'success' | 'danger' | 'info';

interface AppSnackbarProps {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  tone?: Tone;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const TONE_BG: Record<Tone, string> = {
  default: BRAND.text,
  success: BRAND.success,
  danger: BRAND.danger,
  info: BRAND.info,
};

const AppSnackbar = ({
  visible,
  onDismiss,
  message,
  tone = 'default',
  duration = 2500,
  actionLabel,
  onAction,
}: AppSnackbarProps) => (
  <Snackbar
    visible={visible}
    onDismiss={onDismiss}
    duration={duration}
    style={[styles.bar, { backgroundColor: TONE_BG[tone] }]}
    action={
      actionLabel
        ? { label: actionLabel, textColor: BRAND.white, onPress: onAction ?? onDismiss }
        : undefined
    }>
    {message}
  </Snackbar>
);

export default AppSnackbar;

const styles = StyleSheet.create({
  bar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
