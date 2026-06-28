// ─── Imports ─────────────────────────────────────────────────────────────────
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
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { useLanguage } from '../../../context/LanguageContext';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PRIMARY        = '#E89951';
const PRIMARY_DARK   = '#b36a1a';
const PRIMARY_LIGHT  = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';
const COLOR_DANGER   = '#c0392b';
const COLOR_SUCCESS  = '#1a7a40';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const shortMoney = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  return `${(n / 1_000).toFixed(0)}k`;
};

// i18n-safe: maps categoryId → translated name
const getCatName = (id: string, t: any): string => {
  const map: Record<string, string> = {
    food:      t.expense.catFood,
    shopping:  t.expense.catShopping,
    fun:       t.expense.catFun,
    transport: t.expense.catTransport,
    utility:   t.expense.catUtility,
    other:     t.expense.catOther,
  };
  return map[id] ?? id;
};

// ─── Chart data per period ────────────────────────────────────────────────────
const CHART_DATA = {
  week: {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    values: [163_980, 85_000, 250_000, 199_000, 320_000, 60_230, 35_000],
  },
  month: {
    labels: ['T1', 'T2', 'T3', 'T4'],
    values: [2_100_000, 3_450_000, 1_890_000, 885_110],
  },
  year: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    values: [7_200_000, 8_100_000, 6_500_000, 9_300_000, 7_800_000, 8_500_000,
             10_200_000, 9_100_000, 8_325_110, 7_600_000, 8_900_000, 11_000_000],
  },
};

// Period index → key mapping (i18n-safe)
const PERIOD_KEYS: Array<keyof typeof CHART_DATA> = ['week', 'month', 'year'];

// ─── Category breakdown data ───────────────────────────────────────────────────
type CategoryStat = {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
  total: number;
  percent: number;
};

const CAT_STATS: CategoryStat[] = [
  { id: 'food',      name: 'Ăn uống',   icon: 'restaurant-outline',      iconBg: '#fff4e8', iconColor: PRIMARY_DARK,   barColor: PRIMARY,       total: 3_200_000, percent: 0.38 },
  { id: 'shopping',  name: 'Mua sắm',   icon: 'bag-handle-outline',      iconBg: '#f5f0ff', iconColor: '#6c3fc4',      barColor: '#6c3fc4',     total: 2_100_000, percent: 0.25 },
  { id: 'utility',   name: 'Tiện ích',  icon: 'flash-outline',           iconBg: '#ffeaea', iconColor: COLOR_DANGER,   barColor: COLOR_DANGER,  total: 1_485_110, percent: 0.18 },
  { id: 'fun',       name: 'Giải trí',  icon: 'game-controller-outline', iconBg: '#e8f0f8', iconColor: '#1a4a7a',     barColor: '#1a4a7a',     total: 890_000,   percent: 0.11 },
  { id: 'transport', name: 'Di chuyển', icon: 'car-outline',             iconBg: '#e8f8f0', iconColor: COLOR_SUCCESS,  barColor: COLOR_SUCCESS, total: 650_000,   percent: 0.08 },
];

// Top transactions
const TOP_TX = [
  { id: 1, name: 'Điện EVN',         categoryId: 'utility',  icon: 'flash-outline',       iconBg: '#ffeaea', iconColor: COLOR_DANGER,  amount: 320_000 },
  { id: 2, name: 'Shopee',           categoryId: 'shopping', icon: 'bag-handle-outline',  iconBg: '#f5f0ff', iconColor: '#6c3fc4',     amount: 250_000 },
  { id: 3, name: 'Starbucks Coffee', categoryId: 'food',     icon: 'cafe-outline',        iconBg: '#fff4e8', iconColor: PRIMARY_DARK,  amount: 163_980 },
];

// ─── Bar chart component ───────────────────────────────────────────────────────
const SCREEN_W   = Dimensions.get('window').width;
const CHART_W    = SCREEN_W - 64;  // card: mh:16 + ph:16 each side
const CHART_H    = 100;

interface BarChartProps {
  data: number[];
  labels: string[];
}

const BarChart = ({ data, labels }: BarChartProps) => {
  const max        = Math.max(...data, 1);
  const n          = data.length;
  const slotW      = CHART_W / n;
  const barW       = Math.max(slotW * 0.52, 8);
  const hiIdx      = data.indexOf(max);
  const tooltipW   = 44;

  return (
    <Svg width={CHART_W} height={CHART_H + 22}>
      {data.map((v, i) => {
        const barH   = Math.max((v / max) * CHART_H, 4);
        const x      = i * slotW + (slotW - barW) / 2;
        const y      = CHART_H - barH;
        const isHi   = i === hiIdx;
        const tipX   = Math.max(tooltipW / 2 + 2, Math.min(x + barW / 2, CHART_W - tooltipW / 2 - 2));

        return (
          <G key={i}>
            {/* Tooltip on highest bar */}
            {isHi && (
              <G>
                <Rect
                  x={tipX - tooltipW / 2}
                  y={y - 24}
                  width={tooltipW}
                  height={18}
                  rx={5} ry={5}
                  fill={PRIMARY}
                />
                <SvgText
                  x={tipX}
                  y={y - 11}
                  textAnchor="middle"
                  fontSize={9}
                  fill="white">
                  {shortMoney(v)}
                </SvgText>
              </G>
            )}

            {/* Bar */}
            <Rect
              x={x} y={y}
              width={barW} height={barH}
              rx={Math.min(barW / 2, 6)} ry={Math.min(barW / 2, 6)}
              fill={isHi ? PRIMARY : '#ebebeb'}
            />

            {/* Day label */}
            <SvgText
              x={x + barW / 2}
              y={CHART_H + 15}
              textAnchor="middle"
              fontSize={9}
              fill={isHi ? PRIMARY_DARK : '#bbb'}>
              {labels[i]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
interface Props { navigation: any; }

const ExpenseStats = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [activePeriod, setActivePeriod] = useState(1); // 0=week 1=month 2=year

  const periodFilters = [t.expense.weekFilter, t.expense.monthFilter, t.expense.yearFilter];
  const chartData     = CHART_DATA[PERIOD_KEYS[activePeriod]];
  const total         = chartData.values.reduce((s, v) => s + v, 0);

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header cam ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.expense.statsTitle}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="settings-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card: total spending ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t.expense.totalSpending}</Text>
          <Text style={styles.heroAmount}>{money(total)}</Text>
          <View style={styles.trendBadge}>
            <Icon type="ionicon" name="trending-down" size={13} color={COLOR_SUCCESS} />
            <Text style={styles.trendText}>12% {t.expense.vsLastMonth}</Text>
          </View>
        </View>

        {/* ── Bar chart card ── */}
        <View style={styles.card}>
          {/* Period filter tabs */}
          <View style={styles.periodRow}>
            {periodFilters.map((pf, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.periodTab, activePeriod === i && styles.periodTabActive]}
                onPress={() => setActivePeriod(i)}>
                <Text style={[styles.periodText, activePeriod === i && styles.periodTextActive]}>
                  {pf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <View style={styles.chartWrap}>
            <BarChart data={chartData.values} labels={chartData.labels} />
          </View>
        </View>

        {/* ── Category breakdown ── */}
        <Text style={styles.sectionLabel}>{t.expense.topCategories}</Text>
        <View style={styles.card}>
          {CAT_STATS.map((cat, i) => (
            <View key={cat.id} style={[styles.catRow, i < CAT_STATS.length - 1 && { marginBottom: 16 }]}>
              <View style={[styles.catIconWrap, { backgroundColor: cat.iconBg }]}>
                <Icon type="ionicon" name={cat.icon} size={17} color={cat.iconColor} />
              </View>
              <View style={styles.catInfo}>
                <View style={styles.catLabelRow}>
                  <Text style={styles.catName}>{getCatName(cat.id, t)}</Text>
                  <Text style={styles.catAmount}>{shortMoney(cat.total)}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${cat.percent * 100}%` as any, backgroundColor: cat.barColor },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.catPercent}>{Math.round(cat.percent * 100)}%</Text>
            </View>
          ))}
        </View>

        {/* ── Top transactions ── */}
        <Text style={styles.sectionLabel}>{t.expense.recentTop}</Text>
        <View style={styles.card}>
          {TOP_TX.map((tx, i) => (
            <View key={tx.id}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                  <Icon type="ionicon" name={tx.icon} size={18} color={tx.iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txCat}>{getCatName(tx.categoryId, t)}</Text>
                </View>
                <Text style={styles.txAmount}>{money(tx.amount)}</Text>
              </View>
              {i < TOP_TX.length - 1 && <View style={styles.txDivider} />}
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpenseStats;

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontWeight: '600', color: '#fff',
  },

  scroll: { paddingBottom: 16 },

  // Hero card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  heroLabel: { fontSize: 10, color: '#aaa', letterSpacing: 0.6, fontWeight: '500' },
  heroAmount: {
    fontSize: 28, fontWeight: '700', color: COLOR_DANGER,
    letterSpacing: -0.5, marginTop: 6,
  },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e8f8f0', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginTop: 8,
  },
  trendText: { fontSize: 11, color: COLOR_SUCCESS, fontWeight: '500' },

  // Section label
  sectionLabel: {
    fontSize: 11, color: '#aaa',
    letterSpacing: 0.6, fontWeight: '500',
    marginHorizontal: 20, marginTop: 20, marginBottom: 8,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
  },

  // Period tabs
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3 },
  periodText: { fontSize: 12, color: '#aaa', fontWeight: '500' },
  periodTextActive: { color: PRIMARY_DARK, fontWeight: '600' },

  // Chart
  chartWrap: { alignItems: 'flex-start' },

  // Category rows
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
  },
  catIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  catInfo: { flex: 1, gap: 6 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: 12, fontWeight: '500', color: '#1a1a1a' },
  catAmount: { fontSize: 12, color: '#888' },
  progressBg: {
    height: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  catPercent: { fontSize: 12, color: '#aaa', fontWeight: '500', width: 32, textAlign: 'right' },

  // Top transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  txCat: { fontSize: 11, color: '#aaa', marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: '600', color: COLOR_DANGER },
  txDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginLeft: 52 },
});
