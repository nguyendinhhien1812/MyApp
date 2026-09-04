// ─── Imports ─────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
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
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../../theme/tokens';
import SubHeader from '../../../components/UI/SubHeader';
import { getCatName, CATEGORY_VISUALS } from '../categories';
import { money, shortMoney } from '../../../utils/money';
import {
  spendingByCategory,
  topExpenses,
  getChart,
  Period,
} from '../../../services/expenseService';

// Xanh lãi dùng trên khối hero luôn tối — không đổi theo theme.
const COLOR_SUCCESS = '#1a7a40';

const PERIOD_KEYS: Period[] = ['week', 'month', 'year'];

// ─── Helpers ──────────────────────────────────────────────────────────────────


// ─── Bar chart component ───────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 64;  // card: mh:16 + ph:16 each side
const CHART_H = 100;

interface BarChartProps {
  data: number[];
  labels: string[];
}

const BarChart = ({ data, labels }: BarChartProps) => {
  const colors = useThemeColors();
  const max = Math.max(...data, 1);
  const n = data.length;
  const slotW = CHART_W / n;
  const barW = Math.max(slotW * 0.52, 8);
  const hiIdx = data.indexOf(max);
  const tooltipW = 44;

  return (
    <Svg width={CHART_W} height={CHART_H + 22}>
      {data.map((v, i) => {
        const barH = Math.max((v / max) * CHART_H, 4);
        const x = i * slotW + (slotW - barW) / 2;
        const y = CHART_H - barH;
        const isHi = i === hiIdx;
        const tipX = Math.max(tooltipW / 2 + 2, Math.min(x + barW / 2, CHART_W - tooltipW / 2 - 2));

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
                  fill={colors.accent}
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
              fill={isHi ? colors.accent : colors.border}
            />

            {/* Day label */}
            <SvgText
              x={x + barW / 2}
              y={CHART_H + 15}
              textAnchor="middle"
              fontSize={9}
              fill={isHi ? colors.accent700 : colors.muted}>
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
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activePeriod, setActivePeriod] = useState(1); // 0=week 1=month 2=year

  const periodFilters = [t.expense.weekFilter, t.expense.monthFilter, t.expense.yearFilter];
  const chartData = getChart(PERIOD_KEYS[activePeriod]);
  const total = chartData.values.reduce((s, v) => s + v, 0);
  const catStats = spendingByCategory();
  const topTx = topExpenses(3);

  return (
    <SafeAreaView style={styles.safe}>

      <SubHeader title={t.expense.statsTitle} onBack={() => navigation.goBack()} />

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
          {catStats.map((cat, i) => (
            <View key={cat.id} style={[styles.catRow, i < catStats.length - 1 && { marginBottom: 16 }]}>
              <View style={[styles.catIconWrap, { backgroundColor: CATEGORY_VISUALS[cat.id].iconBg }]}>
                <Icon type="ionicon" name={CATEGORY_VISUALS[cat.id].icon} size={17} color={CATEGORY_VISUALS[cat.id].iconColor} />
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
                      { width: `${cat.percent * 100}%` as any, backgroundColor: CATEGORY_VISUALS[cat.id].barColor },
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
          {topTx.map((tx, i) => (
            <View key={tx.id}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: CATEGORY_VISUALS[tx.categoryId].iconBg }]}>
                  <Icon type="ionicon" name={tx.icon} size={18} color={CATEGORY_VISUALS[tx.categoryId].iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txCat}>{getCatName(tx.categoryId, t)}</Text>
                </View>
                <Text style={styles.txAmount}>{money(tx.amount)}</Text>
              </View>
              {i < topTx.length - 1 && <View style={styles.txDivider} />}
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
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { paddingBottom: 16 },

  // Hero card — tối
  heroCard: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s4,
    padding: SPACING.s4,
  },
  heroLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.accent300,
  },
  heroAmount: {
    fontFamily: FONT.semibold, fontSize: 28, color: c.offWhite, marginTop: 6,
  },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(74,222,128,0.16)', borderRadius: RADII.chip,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginTop: 8,
  },
  trendText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: '#4ade80' },

  // Section label
  sectionLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s5,
    marginBottom: SPACING.s2,
  },

  // Card
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    padding: SPACING.s4,
  },

  // Period tabs
  periodRow: {
    flexDirection: 'row',
    backgroundColor: c.divider,
    borderRadius: RADII.item,
    padding: 3,
    marginBottom: SPACING.s4,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: RADII.chip,
  },
  periodTabActive: { backgroundColor: c.white },
  periodText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.subtext },
  periodTextActive: { fontFamily: FONT.semibold, color: c.accent700 },

  // Chart
  chartWrap: { alignItems: 'flex-start' },

  // Category rows
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s3,
    paddingTop: SPACING.s4,
  },
  catIconWrap: {
    width: 34, height: 34, borderRadius: RADII.item,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  catInfo: { flex: 1, gap: 6 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  catAmount: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  progressBg: {
    height: 4,
    backgroundColor: c.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  catPercent: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700, width: 32, textAlign: 'right' },

  // Top transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.s3,
    paddingVertical: SPACING.s3,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: RADII.item,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  txCat: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 2 },
  txAmount: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.danger },
  txDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginLeft: 52 },
});
