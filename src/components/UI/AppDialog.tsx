import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import AppButton from './AppButton';
import { ThemeColors } from '../../theme/paperTheme';
import { useAppTheme } from '../../context/ThemeContext';

type Tone = 'primary' | 'danger' | 'success' | 'info';

interface AppDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description?: string;
  icon?: string; // tên ionicon
  tone?: Tone;
  cancelText?: string;  // không truyền → ẩn nút huỷ
  confirmText: string;
  onConfirm: () => void;
  loading?: boolean;
}

// Nền vòng tròn icon theo tone + mode
const toneBg = (c: ThemeColors, isDark: boolean): Record<Tone, string> => ({
  primary: c.primaryLight,
  danger: isDark ? '#3a1f1f' : '#fdecea',
  success: isDark ? '#16301f' : '#e8f8f0',
  info: isDark ? '#16283a' : '#eaf1f8',
});

const AppDialog = ({
  visible,
  onDismiss,
  title,
  description,
  icon,
  tone = 'primary',
  cancelText,
  confirmText,
  onConfirm,
  loading = false,
}: AppDialogProps) => {
  const { colors, scheme } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bg = toneBg(colors, scheme === 'dark');
  const toneColor: Record<Tone, string> = {
    primary: colors.primaryDark,
    danger: colors.danger,
    success: colors.success,
    info: colors.info,
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.body}>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: bg[tone] }]}>
              <Icon type="ionicon" name={icon} size={28} color={toneColor[tone]} />
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.desc}>{description}</Text> : null}
          <View style={styles.btnRow}>
            {cancelText ? (
              <AppButton
                title={cancelText}
                variant="ghost"
                onPress={onDismiss}
                style={styles.btn}
              />
            ) : null}
            <AppButton
              title={confirmText}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
              style={styles.btn}
            />
          </View>
        </View>
      </Dialog>
    </Portal>
  );
};

export default AppDialog;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    dialog: {
      backgroundColor: c.white,
      borderRadius: 20,
      marginHorizontal: 32,
    },
    body: {
      padding: 24,
      alignItems: 'center',
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
    },
    desc: {
      fontSize: 13,
      color: c.subtext,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 19,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
      alignSelf: 'stretch',
    },
    btn: {
      flex: 1,
    },
  });
