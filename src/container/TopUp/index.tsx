import React, { useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

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
  const [selectedCarrier, setSelectedCarrier] = useState('viettel');
  const [selectedAmount, setSelectedAmount] = useState(50000);

  const currentCarrier = CARRIERS.find(c => c.id === selectedCarrier) ?? CARRIERS[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nạp tiền điện thoại</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Số điện thoại */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SỐ ĐIỆN THOẠI</Text>
          <Text style={styles.phoneNumber}>0901 234 567</Text>
          <View style={styles.autoDetectRow}>
            <View style={[styles.carrierLogoSm, { backgroundColor: currentCarrier.color }]}>
              <Text style={styles.carrierLogoSmText}>{currentCarrier.short}</Text>
            </View>
            <Text style={styles.autoDetectText}>
              {currentCarrier.name} • Tự động nhận diện
            </Text>
            <Icon type="ionicon" name="checkmark-circle" size={14} color="#22c55e" />
          </View>
        </View>

        {/* Nhà mạng */}
        <View>
          <Text style={styles.sectionTitle}>CHỌN NHÀ MẠNG</Text>
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
          <Text style={styles.sectionTitle}>CHỌN MỆNH GIÁ</Text>
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
                  <Text style={styles.popularLabel}>Phổ biến</Text>
                ) : (
                  <Text style={styles.denomUnit}>đồng</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>TỔNG THANH TOÁN</Text>
            <Text style={styles.summaryAmount}>{money(selectedAmount)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryBalanceLabel}>Số dư ví</Text>
            <Text style={styles.summaryBalance}>1.000.000.000 đ</Text>
          </View>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <Icon type="ionicon" name="phone-portrait-outline" size={18} color="#fff" />
          <Text style={styles.ctaText}>Nạp ngay {money(selectedAmount)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TopUpScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#fff' },

  scroll: { padding: 16, gap: 14, paddingBottom: 20 },

  // Phone card
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionLabel: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
    marginBottom: 8,
  },
  phoneNumber: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', letterSpacing: 0.5 },
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
  carrierLogoSmText: { fontSize: 7, fontWeight: '700', color: '#fff' },
  autoDetectText: { fontSize: 12, color: '#555', flex: 1 },

  // Section title
  sectionTitle: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
    marginBottom: 8,
  },

  // Carrier
  carrierList: { gap: 8 },
  carrierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
  },
  carrierItemActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  carrierLogo: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierLogoText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  carrierName: { fontSize: 12, color: '#555', fontWeight: '500' },
  carrierNameActive: { color: PRIMARY_DARK },

  // Denomination
  denomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  denomItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
  },
  denomItemActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  denomValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  denomValueActive: { color: PRIMARY_DARK },
  denomUnit: { fontSize: 10, color: '#aaa', marginTop: 2 },
  popularLabel: { fontSize: 10, color: PRIMARY, marginTop: 2, fontWeight: '500' },

  // Summary
  summaryCard: {
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {},
  summaryLabel: { fontSize: 10, color: '#aaa', letterSpacing: 0.5, fontWeight: '500' },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: PRIMARY_DARK, marginTop: 4 },
  summaryRight: { alignItems: 'flex-end' },
  summaryBalanceLabel: { fontSize: 10, color: '#aaa' },
  summaryBalance: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginTop: 3 },

  // Bottom
  bottom: { padding: 16, paddingBottom: 24, backgroundColor: '#F2F2F7' },
  ctaBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
