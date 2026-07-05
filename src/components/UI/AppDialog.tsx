import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import AppButton from './AppButton';
import { BRAND } from '../../theme/paperTheme';

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

const TONE_BG: Record<Tone, string> = {
  primary: BRAND.primaryLight,
  danger: '#fdecea',
  success: '#e8f8f0',
  info: '#eaf1f8',
};

const TONE_COLOR: Record<Tone, string> = {
  primary: BRAND.primaryDark,
  danger: BRAND.danger,
  success: BRAND.success,
  info: BRAND.info,
};

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
}: AppDialogProps) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <View style={styles.body}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: TONE_BG[tone] }]}>
            <Icon type="ionicon" name={icon} size={28} color={TONE_COLOR[tone]} />
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

export default AppDialog;

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: BRAND.white,
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
    color: BRAND.text,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: BRAND.subtext,
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
