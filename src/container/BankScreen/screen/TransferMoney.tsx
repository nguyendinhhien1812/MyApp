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
import SubHeader from '../../../components/UI/SubHeader';
import { useLanguage } from '../../../context/LanguageContext';
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../../theme/tokens';

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
      <SubHeader title={t.transferScreen.title} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Người nhận */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t.transferScreen.recipient}</Text>
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
              <Text style={styles.verifiedText}>{t.transferScreen.verified}</Text>
            </View>
          </View>
        </View>

        {/* Số tiền hero */}
        <View style={styles.card}>
          <View style={styles.amountHero}>
            <Text style={styles.sectionLabel}>{t.transferScreen.amountLabel}</Text>
            <Text style={styles.amountBig}>{money(AMOUNT)}</Text>
            <View style={styles.freeBadge}>
              <Icon type="ionicon" name="checkmark-circle" size={12} color="#16a34a" />
              <Text style={styles.freeText}>{t.transferScreen.feeFree}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.transferScreen.note}</Text>
            <Text style={styles.rowValue}>{t.transferScreen.noteValue}</Text>
          </View>
        </View>

        {/* Tổng kết */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.transferScreen.fromAccount}</Text>
            <Text style={styles.rowValue}>{t.transferScreen.fromAccountValue}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.transferScreen.balanceNow}</Text>
            <Text style={styles.rowValue}>{money(balance)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.transferScreen.balanceAfter}</Text>
            <Text style={styles.rowRemain}>{money(balance - AMOUNT)}</Text>
          </View>
        </View>

        {/* Security note */}
        <View style={styles.securityRow}>
          <Icon type="ionicon" name="shield-checkmark-outline" size={14} color={colors.muted} />
          <Text style={styles.securityText}>{t.transferScreen.ssl}</Text>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <View style={styles.securityRowCenter}>
          <Icon type="ionicon" name="lock-closed-outline" size={13} color={colors.hint} />
          <Text style={styles.securityTextSmall}>{t.transferScreen.faceIdNote}</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.85}
          onPress={() => setConfirmVisible(true)}>
          <Icon type="ionicon" name="happy-outline" size={20} color="#fff" />
          <Text style={styles.confirmText}>{t.transferScreen.confirmFaceId}</Text>
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

  // Scroll
  scroll: { padding: SPACING.screenX, gap: SPACING.s3, paddingBottom: 16 },

  // Card
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    paddingHorizontal: SPACING.s4,
    paddingTop: SPACING.s4,
    paddingBottom: SPACING.s3,
  },

  // Recipient
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s3,
    paddingHorizontal: SPACING.s4,
    paddingBottom: SPACING.s4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: c.accent,
  },
  recipientInfo: { flex: 1 },
  recipientName: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.text },
  recipientBank: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, marginTop: 3 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e6f7ef',
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: { fontFamily: FONT.medium, fontSize: 9, color: '#16a34a' },

  // Amount hero
  amountHero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    gap: 8,
  },
  amountBig: {
    fontFamily: FONT.bold,
    fontSize: 34,
    color: c.text,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e6f7ef',
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  freeText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: '#16a34a' },

  // Rows
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginHorizontal: SPACING.s4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.s4,
    paddingVertical: 13,
  },
  rowLabel: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  rowValue: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  rowRemain: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.accent700 },

  // Security
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  securityText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },

  // Bottom
  bottom: {
    padding: SPACING.screenX,
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
  securityTextSmall: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.hint },
  confirmBtn: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.item,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
