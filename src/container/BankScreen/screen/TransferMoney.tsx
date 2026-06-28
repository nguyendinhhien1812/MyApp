import React from 'react';
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

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

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
  const balance = (route.params as any)?.balance ?? 1000000000;

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
            <Image source={{ uri: RECIPIENT.avatar }} style={styles.avatar} />
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{RECIPIENT.name}</Text>
              <Text style={styles.recipientBank}>
                {RECIPIENT.bank} · {RECIPIENT.accountMasked}
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
          <Icon type="ionicon" name="shield-checkmark-outline" size={14} color="#bbb" />
          <Text style={styles.securityText}>Giao dịch được mã hoá 256-bit SSL</Text>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <View style={styles.securityRowCenter}>
          <Icon type="ionicon" name="lock-closed-outline" size={13} color="#aaa" />
          <Text style={styles.securityTextSmall}>Bảo mật bởi Face ID</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85}>
          <Icon type="ionicon" name="happy-outline" size={20} color="#fff" />
          <Text style={styles.confirmText}>Xác nhận bằng Face ID</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TransferMoney;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

  // Header
  header: {
    backgroundColor: PRIMARY,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#aaa',
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
    borderColor: PRIMARY_BORDER,
  },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  recipientBank: { fontSize: 12, color: '#888', marginTop: 3 },
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
    color: '#1a1a1a',
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
  divider: { height: 0.5, backgroundColor: '#F0F0F0', marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontSize: 14, color: '#888' },
  rowValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  rowRemain: { fontSize: 14, color: PRIMARY, fontWeight: '700' },

  // Security
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  securityText: { fontSize: 11, color: '#bbb' },

  // Bottom
  bottom: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
    backgroundColor: '#F2F2F7',
  },
  securityRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  securityTextSmall: { fontSize: 11, color: '#aaa' },
  confirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
