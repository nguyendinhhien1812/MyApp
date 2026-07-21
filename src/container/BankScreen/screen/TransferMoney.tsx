import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { StackScreenProps } from '@react-navigation/stack';
import { AppDialog, AppSnackbar } from '../../../components/UI';
import { useLanguage } from '../../../context/LanguageContext';
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/paperTheme';

const RECIPIENT = {
  name: 'John Smith',
  bank: 'Vietcombank',
  accountMasked: '****  ****  ****  5432',
  avatar: 'https://i.pravatar.cc/80?img=1',
};

const AMOUNT = 500000;

const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

interface Props extends StackScreenProps<any> {}

const TransferMoney = ({ navigation, route }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const balance = (route.params as any)?.balance ?? 1000000000;
  // Người nhận truyền từ Gửi nhanh / Gửi lại — mặc định RECIPIENT demo
  const recipient = { ...RECIPIENT, ...((route.params as any)?.contact ?? {}) };
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận chuyển</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Người nhận */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>NGƯỜI NHẬN</Text>
          <View style={styles.recipientRow}>
            <Image source={{ uri: recipient.avatar }} style={styles.avatar} />
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{recipient.name}</Text>
              <Text style={styles.recipientBank}>
                {recipient.bank} · {recipient.accountMasked}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Icon type="ionicon" name="checkmark-circle" size={12} color="#16a34a" />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          </View>
        </View>

        {/* Số tiền hero */}
        <View style={styles.card}>
          <View style={styles.amountHero}>
            <Text style={styles.sectionLabel}>SỐ TIỀN CHUYỂN</Text>
            <Text style={styles.amountBig}>{money(AMOUNT)}</Text>
            <View style={styles.freeBadge}>
              <Icon type="ionicon" name="checkmark-circle" size={12} color="#16a34a" />
              <Text style={styles.freeText}>Phí: Miễn phí</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nội dung</Text>
            <Text style={styles.rowValue}>Chuyển tiền ăn tối</Text>
          </View>
        </View>

        {/* Tổng kết */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Từ tài khoản</Text>
            <Text style={styles.rowValue}>TK Thanh toán</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Số dư hiện tại</Text>
            <Text style={styles.rowValue}>{money(balance)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Số dư sau khi chuyển</Text>
            <Text style={styles.rowRemain}>{money(balance - AMOUNT)}</Text>
          </View>
        </View>

        {/* Security note */}
        <View style={styles.securityRow}>
          <Icon type="ionicon" name="shield-checkmark-outline" size={14} color={colors.muted} />
          <Text style={styles.securityText}>Giao dịch được mã hoá 256-bit SSL</Text>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <View style={styles.securityRowCenter}>
          <Icon type="ionicon" name="lock-closed-outline" size={13} color={colors.hint} />
          <Text style={styles.securityTextSmall}>Bảo mật bởi Face ID</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.85}
          onPress={() => setConfirmVisible(true)}>
          <Icon type="ionicon" name="happy-outline" size={20} color="#fff" />
          <Text style={styles.confirmText}>Xác nhận bằng Face ID</Text>
        </TouchableOpacity>
      </View>

      {/* Xác nhận + thông báo thành công */}
      <AppDialog
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        icon="swap-horizontal"
        tone="primary"
        title={t.bank.transferConfirmTitle}
        description={`${money(AMOUNT)} → ${recipient.name}. ${t.bank.transferConfirmDesc}`}
        cancelText={t.common.cancel}
        confirmText={t.common.confirm}
        onConfirm={() => {
          setConfirmVisible(false);
          setSuccessVisible(true);
        }}
      />
      <AppSnackbar
        visible={successVisible}
        onDismiss={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
        message={t.bank.transferSuccess}
        tone="success"
        duration={1600}
      />
    </SafeAreaView>
  );
};

export default TransferMoney;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  // Header
  header: {
    backgroundColor: c.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Scroll
  scroll: { padding: 16, gap: 12, paddingBottom: 16 },

  // Card
  card: {
    backgroundColor: c.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 10,
    color: c.hint,
    letterSpacing: 0.6,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  // Recipient
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
  },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 15, fontWeight: '600', color: c.text },
  recipientBank: { fontSize: 12, color: c.subtext, marginTop: 3 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e6f7ef',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 9, color: '#16a34a', fontWeight: '500' },

  // Amount hero
  amountHero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    gap: 8,
  },
  amountBig: {
    fontSize: 34,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.5,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e6f7ef',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  freeText: { fontSize: 11, color: '#16a34a', fontWeight: '500' },

  // Rows
  divider: { height: 0.5, backgroundColor: c.divider, marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontSize: 14, color: c.subtext },
  rowValue: { fontSize: 14, color: c.text, fontWeight: '500' },
  rowRemain: { fontSize: 14, color: c.primary, fontWeight: '700' },

  // Security
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  securityText: { fontSize: 11, color: c.muted },

  // Bottom
  bottom: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
    backgroundColor: c.bg,
  },
  securityRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  securityTextSmall: { fontSize: 11, color: c.hint },
  confirmBtn: {
    backgroundColor: c.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
