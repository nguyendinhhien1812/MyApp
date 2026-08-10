import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Icon } from '@rneui/themed';
import SubHeader from '../../components/UI/SubHeader';
import { AppDialog, AppSnackbar } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WALLET_BALANCE = 1000000000;

const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const formatDenom = (n: number) =>
  n >= 1000000 ? `${n / 1000000}tr` : `${n / 1000}k`;

const CARRIERS = [
  { id: 'viettel', name: 'Viettel', color: '#E89951', short: 'V' },
  { id: 'vinaphone', name: 'Vinaphone', color: '#0077c8', short: 'VP' },
  { id: 'mobifone', name: 'Mobifone', color: '#00a651', short: 'MB' },
  { id: 'gmobile', name: 'Gmobile', color: '#8b0000', short: 'GT' },
  { id: 'itelecom', name: 'Itelecom', color: '#ff6b00', short: 'IT' },
];

const DENOMS = [10000, 20000, 50000, 100000, 200000, 500000];
const POPULAR = 50000;

// Width for 3 columns with gaps
const DENOM_ITEM_WIDTH = Math.floor((SCREEN_WIDTH - 32 - 16 - 4) / 3);

interface Props {
  navigation: any;
}

const TopUpScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selectedCarrier, setSelectedCarrier] = useState('viettel');
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const currentCarrier = CARRIERS.find(c => c.id === selectedCarrier) ?? CARRIERS[0];

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader title={t.topup.title} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Số điện thoại */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t.topup.phoneLabel}</Text>
          <Text style={styles.phoneNumber}>0901 234 567</Text>
          <View style={styles.autoDetectRow}>
            <View style={[styles.carrierLogoSm, { backgroundColor: currentCarrier.color }]}>
              <Text style={styles.carrierLogoSmText}>{currentCarrier.short}</Text>
            </View>
            <Text style={styles.autoDetectText}>
              {currentCarrier.name} • {t.topup.autoDetect}
            </Text>
            <Icon type="ionicon" name="checkmark-circle" size={14} color="#22c55e" />
          </View>
        </View>

        {/* Nhà mạng */}
        <View>
          <Text style={styles.sectionTitle}>{t.topup.chooseCarrier}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carrierList}>
            {CARRIERS.map(carrier => (
              <TouchableOpacity
                key={carrier.id}
                style={[
                  styles.carrierItem,
                  selectedCarrier === carrier.id && styles.carrierItemActive,
                ]}
                onPress={() => setSelectedCarrier(carrier.id)}>
                <View style={[styles.carrierLogo, { backgroundColor: carrier.color }]}>
                  <Text style={styles.carrierLogoText}>{carrier.short}</Text>
                </View>
                <Text
                  style={[
                    styles.carrierName,
                    selectedCarrier === carrier.id && styles.carrierNameActive,
                  ]}>
                  {carrier.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mệnh giá */}
        <View>
          <Text style={styles.sectionTitle}>{t.topup.chooseDenom}</Text>
          <View style={styles.denomGrid}>
            {DENOMS.map(denom => (
              <TouchableOpacity
                key={denom}
                style={[
                  styles.denomItem,
                  { width: DENOM_ITEM_WIDTH },
                  selectedAmount === denom && styles.denomItemActive,
                ]}
                onPress={() => setSelectedAmount(denom)}>
                <Text
                  style={[
                    styles.denomValue,
                    selectedAmount === denom && styles.denomValueActive,
                  ]}>
                  {formatDenom(denom)}
                </Text>
                {denom === POPULAR ? (
                  <Text style={styles.popularLabel}>{t.topup.popular}</Text>
                ) : (
                  <Text style={styles.denomUnit}>{t.topup.unit}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>{t.topup.totalPay}</Text>
            <Text style={styles.summaryAmount}>{money(selectedAmount)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryBalanceLabel}>{t.topup.walletBalance}</Text>
            <Text style={styles.summaryBalance}>{money(WALLET_BALANCE)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => setConfirmVisible(true)}>
          <Icon type="ionicon" name="phone-portrait-outline" size={18} color="#fff" />
          <Text style={styles.ctaText}>{t.topup.topUpNow} {money(selectedAmount)}</Text>
        </TouchableOpacity>
      </View>

      {/* Xác nhận + thông báo thành công */}
      <AppDialog
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        icon="phone-portrait-outline"
        tone="primary"
        title={t.bank.topUpConfirmTitle}
        description={`${currentCarrier.name} · ${money(selectedAmount)}. ${t.bank.topUpConfirmDesc}`}
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
        message={t.bank.topUpSuccess}
        tone="success"
        duration={1600}
      />
    </SafeAreaView>
  );
};

export default TopUpScreen;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { padding: SPACING.screenX, gap: SPACING.s4, paddingBottom: 20 },

  // Phone card
  card: { backgroundColor: c.white, borderRadius: RADII.card, padding: SPACING.s4 },
  sectionLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginBottom: 8,
  },
  phoneNumber: { fontFamily: FONT.semibold, fontSize: 26, color: c.text },
  autoDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  carrierLogoSm: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierLogoSmText: { fontFamily: FONT.bold, fontSize: 7, color: '#fff' },
  autoDetectText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, flex: 1 },

  // Section title
  sectionTitle: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginBottom: 8,
  },

  // Carrier
  carrierList: { gap: 8 },
  carrierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: c.white,
    borderRadius: RADII.item,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  carrierItemActive: {
    backgroundColor: c.accent100,
    borderWidth: 1.5,
    borderColor: c.accent,
  },
  carrierLogo: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierLogoText: { fontFamily: FONT.bold, fontSize: 8, color: '#fff' },
  carrierName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.subtext },
  carrierNameActive: { color: c.accent700 },

  // Denomination
  denomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  denomItem: {
    backgroundColor: c.white,
    borderRadius: RADII.item,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  denomItemActive: {
    backgroundColor: c.accent100,
    borderWidth: 1.5,
    borderColor: c.accent,
  },
  denomValue: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  denomValueActive: { color: c.accent700 },
  denomUnit: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 2 },
  popularLabel: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700, marginTop: 2 },

  // Summary
  summaryCard: {
    backgroundColor: c.accent100,
    borderRadius: RADII.card,
    padding: SPACING.s4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {},
  summaryLabel: { fontFamily: FONT.regular, fontSize: TYPE.caption, letterSpacing: 0.5, color: c.accent700 },
  summaryAmount: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.accent700, marginTop: 4 },
  summaryRight: { alignItems: 'flex-end' },
  summaryBalanceLabel: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
  summaryBalance: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.text, marginTop: 3 },

  // Bottom
  bottom: { padding: SPACING.screenX, paddingBottom: 24, backgroundColor: c.bg },
  ctaBtn: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.item,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
