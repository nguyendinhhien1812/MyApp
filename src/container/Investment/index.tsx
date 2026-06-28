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
import Svg, { Polyline } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Helpers ────────────────────────────────────────────────────────────────

const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const shortMoney = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  return `${(n / 1_000).toFixed(0)}k`;
};

// ─── Sparkline component ────────────────────────────────────────────────────

interface SparkProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const SparkLine = ({ data, color, width = 52, height = 28 }: SparkProps) => {
  const n = data.length;
  if (n < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = ((i / (n - 1)) * width).toFixed(1);
      const y = (height - ((v - min) / range) * (height - 4) - 2).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Portfolio-sized sparkline
const PortfolioSparkLine = ({ data }: { data: number[] }) => {
  const w = SCREEN_WIDTH - 32 - 32; // screen - margin - padding
  const h = 52;
  const n = data.length;
  if (n < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = ((i / (n - 1)) * w).toFixed(1);
      const y = (h - ((v - min) / range) * (h - 6) - 3).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <Svg width={w} height={h}>
      <Polyline
        points={pts}
        fill="none"
        stroke={PRIMARY}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// ─── Data ───────────────────────────────────────────────────────────────────

const MARKET_TABS = ['HOSE', 'HNX', 'Vàng', 'Quỹ'] as const;
type MarketTab = typeof MARKET_TABS[number];

type StockItem = {
  id: string;
  ticker: string;
  name: string;
  vol: string;
  price: number;
  change: number;
  trend: 'up' | 'down';
  sparkData: number[];
  iconBg: string;
  iconColor: string;
};

const STOCKS: Record<MarketTab, StockItem[]> = {
  HOSE: [
    {
      id: 'VCB', ticker: 'VCB', name: 'Vietcombank', vol: '4.2M',
      price: 89500, change: 1.24, trend: 'up',
      sparkData: [20, 26, 30, 36, 32, 40, 44],
      iconBg: '#e8f0f8', iconColor: '#1a4a7a',
    },
    {
      id: 'FPT', ticker: 'FPT', name: 'FPT Corp', vol: '2.8M',
      price: 125200, change: -0.87, trend: 'down',
      sparkData: [44, 40, 34, 36, 28, 32, 26],
      iconBg: '#fff4e8', iconColor: PRIMARY_DARK,
    },
    {
      id: 'HPG', ticker: 'HPG', name: 'Hoà Phát', vol: '9.1M',
      price: 27800, change: 2.58, trend: 'up',
      sparkData: [18, 22, 26, 30, 28, 36, 40],
      iconBg: '#e8f8f0', iconColor: '#1a7a40',
    },
    {
      id: 'VIC', ticker: 'VIC', name: 'Vingroup', vol: '3.5M',
      price: 45600, change: -0.44, trend: 'down',
      sparkData: [38, 34, 36, 30, 28, 30, 26],
      iconBg: '#f5f0ff', iconColor: '#6c3fc4',
    },
    {
      id: 'MWG', ticker: 'MWG', name: 'Thế Giới Di Động', vol: '1.9M',
      price: 62300, change: 1.77, trend: 'up',
      sparkData: [20, 24, 28, 26, 32, 36, 40],
      iconBg: PRIMARY_LIGHT, iconColor: PRIMARY,
    },
  ],
  HNX: [
    {
      id: 'SHB', ticker: 'SHB', name: 'Saigon Hanoi Bank', vol: '8.4M',
      price: 14200, change: 0.71, trend: 'up',
      sparkData: [22, 26, 28, 32, 30, 34, 38],
      iconBg: '#e8f0f8', iconColor: '#1a4a7a',
    },
    {
      id: 'PVS', ticker: 'PVS', name: 'PTSC', vol: '5.2M',
      price: 35100, change: -1.12, trend: 'down',
      sparkData: [40, 36, 32, 34, 28, 30, 26],
      iconBg: '#e8f8f0', iconColor: '#1a7a40',
    },
    {
      id: 'VCS', ticker: 'VCS', name: 'Vicostone', vol: '0.8M',
      price: 78900, change: 0.38, trend: 'up',
      sparkData: [24, 28, 26, 30, 28, 32, 36],
      iconBg: '#fff4e8', iconColor: PRIMARY_DARK,
    },
  ],
  Vàng: [
    {
      id: 'SJC', ticker: 'SJC', name: 'Vàng SJC', vol: '',
      price: 108500000, change: 0.46, trend: 'up',
      sparkData: [20, 24, 28, 32, 30, 36, 40],
      iconBg: PRIMARY_LIGHT, iconColor: PRIMARY,
    },
    {
      id: '999', ticker: '24K', name: 'Vàng 24K nhẫn', vol: '',
      price: 105200000, change: -0.22, trend: 'down',
      sparkData: [38, 34, 36, 30, 32, 28, 26],
      iconBg: '#fff4e8', iconColor: PRIMARY_DARK,
    },
  ],
  Quỹ: [
    {
      id: 'FUEVFVND', ticker: 'VN Diamond', name: 'ETF VN Diamond', vol: '12.5M',
      price: 18700, change: 1.08, trend: 'up',
      sparkData: [22, 26, 30, 28, 34, 36, 40],
      iconBg: '#e8f8f0', iconColor: '#1a7a40',
    },
    {
      id: 'E1VFVN30', ticker: 'VN30 ETF', name: 'ETF VN30', vol: '7.8M',
      price: 14200, change: 0.85, trend: 'up',
      sparkData: [18, 22, 26, 30, 28, 36, 38],
      iconBg: '#e8f0f8', iconColor: '#1a4a7a',
    },
  ],
};

const PORTFOLIO_DATA = [18, 22, 28, 32, 30, 38, 42, 46, 44, 50, 52, 56];

// ─── Screen ─────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

const InvestmentScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MarketTab>('HOSE');

  const stocks = STOCKS[activeTab];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.investment.title}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="notifications-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* ── Portfolio Card ── */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portLabel}>{t.investment.portfolio}</Text>
          <Text style={styles.portValue}>{money(42_680_000)}</Text>

          <View style={styles.portPnlRow}>
            <View style={styles.pnlBadgeUp}>
              <Icon type="ionicon" name="trending-up" size={11} color="#1a7a40" />
              <Text style={styles.pnlTextUp}>+5.2% {t.investment.todayPnl}</Text>
            </View>
            <Text style={styles.pnlAmount}>+{money(2_100_000)}</Text>
          </View>

          {/* Sparkline */}
          <View style={styles.sparklineWrap}>
            <PortfolioSparkLine data={PORTFOLIO_DATA} />
          </View>

          {/* Allocation stats */}
          <View style={styles.allocRow}>
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: '#1a7a40' }]}>3 CP</Text>
              <Text style={styles.allocLabel}>{t.investment.profit}</Text>
            </View>
            <View style={styles.allocDivider} />
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: '#c0392b' }]}>1 CP</Text>
              <Text style={styles.allocLabel}>{t.investment.loss}</Text>
            </View>
            <View style={styles.allocDivider} />
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: PRIMARY }]}>
                {shortMoney(8_500_000)}
              </Text>
              <Text style={styles.allocLabel}>{t.investment.cash}</Text>
            </View>
          </View>
        </View>

        {/* ── Market Section ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitleText}>{t.investment.market}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{t.investment.viewMore}</Text>
          </TouchableOpacity>
        </View>

        {/* Market Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mktTabsWrap}>
          {MARKET_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.mktTab, activeTab === tab && styles.mktTabActive]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.mktTabText,
                  activeTab === tab && styles.mktTabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stock List */}
        <View style={styles.stockList}>
          {stocks.map((stock, index) => (
            <TouchableOpacity
              key={stock.id}
              activeOpacity={0.75}
              style={[
                styles.stockRow,
                index === 0 && styles.stockRowFirst,
                index === stocks.length - 1 && styles.stockRowLast,
                index > 0 && styles.stockRowBorder,
              ]}>
              {/* Icon */}
              <View style={[styles.stockIcon, { backgroundColor: stock.iconBg }]}>
                <Text style={[styles.stockTickerIcon, { color: stock.iconColor }]}>
                  {stock.ticker.slice(0, 3)}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.stockInfo}>
                <Text style={styles.stockTicker}>{stock.ticker}</Text>
                <Text style={styles.stockName} numberOfLines={1}>
                  {stock.name}
                </Text>
                {stock.vol ? (
                  <Text style={styles.stockVol}>{t.investment.volume}: {stock.vol}</Text>
                ) : null}
              </View>

              {/* Mini sparkline */}
              <View style={styles.sparkWrap}>
                <SparkLine
                  data={stock.sparkData}
                  color={stock.trend === 'up' ? '#1a7a40' : '#c0392b'}
                />
              </View>

              {/* Price + change */}
              <View style={styles.stockPriceCol}>
                <Text
                  style={[
                    styles.priceVal,
                    { color: stock.trend === 'up' ? '#1a7a40' : '#c0392b' },
                  ]}>
                  {money(stock.price)}
                </Text>
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor:
                        stock.trend === 'up' ? '#e8f8f0' : '#ffeaea',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.changeText,
                      { color: stock.trend === 'up' ? '#1a7a40' : '#c0392b' },
                    ]}>
                    {stock.change > 0 ? '+' : ''}
                    {stock.change.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacer for the fixed CTA bar */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <View style={styles.securityRow}>
          <Icon type="ionicon" name="lock-closed-outline" size={11} color="#ccc" />
          <Text style={styles.securityText}>{t.investment.ssl}</Text>
        </View>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.btnBuy} activeOpacity={0.85}>
            <Icon type="ionicon" name="trending-up" size={16} color="#fff" />
            <Text style={styles.btnBuyText}>{t.investment.buyNow}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSell} activeOpacity={0.85}>
            <Icon type="ionicon" name="trending-down" size={16} color="#c0392b" />
            <Text style={styles.btnSellText}>{t.investment.sell}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InvestmentScreen;

// ─── Styles ─────────────────────────────────────────────────────────────────

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

  scroll: { paddingBottom: 8 },

  // ── Portfolio Card ──
  portfolioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  portLabel: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  portValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  portPnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  pnlBadgeUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f8f0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pnlTextUp: { fontSize: 11, color: '#1a7a40', fontWeight: '500' },
  pnlAmount: { fontSize: 12, color: '#1a7a40', fontWeight: '500' },
  sparklineWrap: {
    marginTop: 12,
    marginBottom: 4,
  },
  allocRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  allocItem: { flex: 1, alignItems: 'center' },
  allocDivider: { width: 0.5, backgroundColor: '#F0F0F0' },
  allocNum: { fontSize: 13, fontWeight: '600' },
  allocLabel: { fontSize: 10, color: '#aaa', marginTop: 3 },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  seeAll: { fontSize: 12, color: PRIMARY, fontWeight: '500' },

  // ── Market tabs ──
  mktTabsWrap: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  mktTab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  mktTabActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  mktTabText: { fontSize: 12, color: '#888' },
  mktTabTextActive: { color: '#fff', fontWeight: '500' },

  // ── Stock list ──
  stockList: {
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  stockRowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  stockRowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  stockRowBorder: { borderTopWidth: 0.5, borderTopColor: '#F5F5F5' },
  stockIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stockTickerIcon: { fontSize: 10, fontWeight: '700' },
  stockInfo: { flex: 1, minWidth: 0 },
  stockTicker: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  stockName: { fontSize: 10, color: '#aaa', marginTop: 1 },
  stockVol: { fontSize: 10, color: '#ccc', marginTop: 1 },
  sparkWrap: { width: 56, alignItems: 'center' },
  stockPriceCol: { alignItems: 'flex-end', minWidth: 78 },
  priceVal: { fontSize: 12, fontWeight: '600' },
  changeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  changeText: { fontSize: 10, fontWeight: '500' },

  // ── Bottom bar ──
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  securityText: { fontSize: 10, color: '#ccc' },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnBuy: {
    flex: 2,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnBuyText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  btnSell: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#c0392b',
  },
  btnSellText: { fontSize: 14, fontWeight: '600', color: '#c0392b' },
});
