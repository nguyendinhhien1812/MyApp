import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

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

// Toast luôn dùng nền tối bão hoà (chuẩn toast) → chữ trắng đọc tốt ở cả 2 mode
const TONE_BG: Record<Tone, string> = {
  default: '#2c2c2c',
  success: '#1a7a40',
  danger: '#c0392b',
  info: '#1a4a7a',
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
        ? { label: actionLabel, textColor: '#fff', onPress: onAction ?? onDismiss }
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
