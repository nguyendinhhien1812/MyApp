import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { Icon } from '@rneui/themed';
import Svg, { Polyline } from 'react-native-svg';
import { AppDialog, AppSnackbar } from '../../components/UI';
import SubHeader from '../../components/UI/SubHeader';
import Icon2 from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import { useLanguage } from '../../context/LanguageContext';
import { Translations } from '../../i18n/translations';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { logger } from '../../utils/logger';
import {
  MarketTab,
  Stock,
  Rates,
  listStocks,
  getPortfolioSeries,
  fetchRates as apiFetchRates,
  fetchLiveHOSE,
} from '../../services/investmentService';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { money, shortMoney } from '../../utils/money';

// Màu lãi/lỗ dùng bản SÁNG khi đứng trên nền tối (portfolio hero)
const UP_ON_DARK = '#4ade80';
const DOWN_ON_DARK = '#f87171';

const PRIMARY      = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Helpers ─────────────────────────────────────────────────────────────────



// ─── Types ───────────────────────────────────────────────────────────────────

// HOSE/HNX là tên sàn nên giữ nguyên; gold/fund là key, nhãn lấy từ translations
const MARKET_TABS: MarketTab[] = ['HOSE', 'HNX', 'gold', 'fund'];

const stockCount = (n: number, t: Translations) =>
  `${n} ${n === 1 ? t.investment.stockUnitOne : t.investment.stockUnit}`;

const marketTabLabel = (tab: MarketTab, t: Translations) => {
  switch (tab) {
    case 'gold':
      return t.investment.tabGold;
    case 'fund':
      return t.investment.tabFund;
    default:
      return tab;
  }
};

// Màu ô icon của từng mã — phần TRÌNH BÀY, không nằm trong service.
const TICKER_VISUALS: Record<string, { bg: string; fg: string }> = {
  VCB: { bg: '#e8f0f8', fg: '#1a4a7a' },
  FPT: { bg: '#fff4e8', fg: PRIMARY_DARK },
  HPG: { bg: '#e8f8f0', fg: '#1a7a40' },
  VIC: { bg: '#f5f0ff', fg: '#6c3fc4' },
  MBB: { bg: '#e8f0f8', fg: '#1a4a7a' },
  TCB: { bg: '#ffeaea', fg: '#c0392b' },
  BID: { bg: '#e8f8f0', fg: '#1a7a40' },
  CTG: { bg: '#fff4e8', fg: PRIMARY_DARK },
  ACB: { bg: '#e8f0f8', fg: '#1a4a7a' },
  VNM: { bg: '#e8f8f0', fg: '#1a7a40' },
  MWG: { bg: PRIMARY_LIGHT, fg: PRIMARY },
  SJC: { bg: PRIMARY_LIGHT, fg: PRIMARY },
  '24K': { bg: '#fff4e8', fg: PRIMARY_DARK },
  SHB: { bg: '#e8f0f8', fg: '#1a4a7a' },
  PVS: { bg: '#e8f8f0', fg: '#1a7a40' },
  VCS: { bg: '#fff4e8', fg: PRIMARY_DARK },
  'VN Diamond': { bg: '#e8f8f0', fg: '#1a7a40' },
  'VN30 ETF': { bg: '#e8f0f8', fg: '#1a4a7a' },
};
const tickerVisual = (t: string) => TICKER_VISUALS[t] ?? { bg: '#e8f0f8', fg: '#1a4a7a' };

// ─── Styles ───────────────────────────────────────────────────────────────────
// (defined before sub-components so they can reference it)

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { paddingBottom: 8 },

  // Portfolio card — hero tối
  portfolioCard: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s4,
    padding: SPACING.s4,
  },
  portLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.accent300,
  },
  portValue: {
    fontFamily: FONT.semibold,
    fontSize: 28,
    color: c.offWhite,
    marginTop: 6,
  },
  portPnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s2,
    marginTop: 6,
  },
  pnlBadgeUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74,222,128,0.16)',
    borderRadius: RADII.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pnlTextUp: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: UP_ON_DARK },
  pnlAmount: { fontFamily: FONT.medium, fontSize: TYPE.body, color: UP_ON_DARK },
  sparklineWrap: { marginTop: 12, marginBottom: 4 },
  allocRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(253,252,251,0.14)',
  },
  allocItem: { flex: 1, alignItems: 'center' },
  allocDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(253,252,251,0.14)' },
  allocNum: { fontFamily: FONT.semibold, fontSize: TYPE.body },
  allocLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    color: 'rgba(253,252,251,0.6)',
    marginTop: 3,
  },

  // Live rate card
  rateCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s3,
    padding: SPACING.s4,
  },
  rateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rateCardTitle: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.subtext,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26,122,64,0.12)',
    borderRadius: RADII.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.success,
  },
  liveBadgeText: { fontFamily: FONT.semibold, fontSize: 9, color: c.success },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rateRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
  },
  rateCurrency: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  rateValue: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.accent700 },
  rateUpdated: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 8 },

  // Error states
  errorCard: {
    backgroundColor: c.accent100,
    borderRadius: RADII.item,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s3,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: { flex: 1, fontFamily: FONT.regular, fontSize: TYPE.body, color: c.accent700 },
  errorRetryBtn: {
    backgroundColor: c.btnSolid,
    borderRadius: RADII.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  errorRetryText: { fontFamily: FONT.semibold, fontSize: TYPE.caption, color: c.offWhite },

  // Stock error banner (shown above mock data)
  stockErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.accent100,
    borderRadius: RADII.item,
    marginHorizontal: SPACING.screenX,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stockErrorText: { flex: 1, fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.accent700 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s5,
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar: { width: 0, height: 0 },
  sectionTitleText: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  seeAll: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.accent700 },

  // Market tabs — pill đồng
  mktTabsWrap: {
    paddingHorizontal: SPACING.screenX,
    gap: 8,
    marginBottom: 10,
  },
  mktTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.borderStrong,
  },
  mktTabActive: { backgroundColor: c.accent100, borderColor: c.accent100 },
  mktTabText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  mktTabTextActive: { fontFamily: FONT.medium, color: c.accent700 },

  // Stock list
  stockList: {
    marginHorizontal: SPACING.screenX,
    backgroundColor: c.white,
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: c.white,
  },
  stockRowFirst: {},
  stockRowLast: {},
  stockRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },
  stockIcon: {
    width: 36,
    height: 36,
    borderRadius: RADII.item,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stockTickerIcon: { fontFamily: FONT.bold, fontSize: 10 },
  stockInfo: { flex: 1, minWidth: 0 },
  stockTicker: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.text },
  stockName: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 1 },
  stockVol: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 1 },
  sparkWrap: { width: 56, alignItems: 'center' },
  stockPriceCol: { alignItems: 'flex-end', minWidth: 78 },
  priceVal: { fontFamily: FONT.semibold, fontSize: TYPE.body },
  changeBadge: {
    borderRadius: RADII.chip,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  changeText: { fontFamily: FONT.medium, fontSize: 10 },

  // Live indicator next to market title
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26,122,64,0.12)',
    borderRadius: RADII.chip,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 6,
  },
  liveIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: c.success,
  },
  liveIndicatorText: { fontFamily: FONT.semibold, fontSize: 9, color: c.success },

  // Bottom bar
  bottomBar: {
    backgroundColor: c.white,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
    gap: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  securityText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
  ctaRow: { flexDirection: 'row', gap: 10 },
  btnBuy: {
    flex: 2,
    backgroundColor: c.btnSolid,
    borderRadius: RADII.item,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnBuyText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
  btnSell: {
    flex: 1,
    backgroundColor: c.white,
    borderRadius: RADII.item,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: c.danger,
  },
  btnSellText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.danger },

  // Stock detail bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: c.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetHeaderInfo: { flex: 1 },
  sheetTicker: { fontFamily: FONT.bold, fontSize: TYPE.title, color: c.text },
  sheetName: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, marginTop: 2 },
  sheetPrice: {
    fontFamily: FONT.semibold,
    fontSize: 28,
    color: c.text,
    marginTop: 14,
  },
  sheetSpark: {
    alignItems: 'center',
    backgroundColor: c.bg,
    borderRadius: RADII.card,
    paddingVertical: 14,
    marginTop: 12,
  },
  sheetVol: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, marginTop: 10, marginBottom: 4 },
});

type Styles = ReturnType<typeof makeStyles>;

// ─── Sparkline components ─────────────────────────────────────────────────────

interface SparkProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const SparkLine = ({ data, color, width = 52, height = 28 }: SparkProps) => {
  const n = data.length;
  if (n < 2) {return null;}
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

const PortfolioSparkLine = ({ data, color }: { data: number[]; color: string }) => {
  const w = SCREEN_WIDTH - 32 - 32;
  const h = 52;
  const n = data.length;
  if (n < 2) {return null;}
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
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// ─── Skeleton sub-components ──────────────────────────────────────────────────

const SkeletonBox = ({
  w, h, r = 6, shimmer, bg,
}: {
  w: number | string;
  h: number;
  r?: number;
  shimmer: Animated.Value;
  bg: string;
}) => (
  <Animated.View
    style={{ width: w as number, height: h, borderRadius: r, backgroundColor: bg, opacity: shimmer as unknown as number }}
  />
);

const SkeletonRateCard = ({
  shimmer, styles, colors,
}: {
  shimmer: Animated.Value;
  styles: Styles;
  colors: ThemeColors;
}) => (
  <View style={styles.rateCard}>
    <View style={styles.rateCardHeader}>
      <SkeletonBox w={130} h={12} shimmer={shimmer} bg={colors.border} />
      <SkeletonBox w={44} h={20} r={10} shimmer={shimmer} bg={colors.border} />
    </View>
    {[0, 1, 2].map(i => (
      <View key={i} style={[styles.rateRow, i > 0 && styles.rateRowBorder]}>
        <SkeletonBox w={60} h={12} shimmer={shimmer} bg={colors.border} />
        <SkeletonBox w={90} h={12} shimmer={shimmer} bg={colors.border} />
      </View>
    ))}
    <SkeletonBox w={100} h={10} r={5} shimmer={shimmer} bg={colors.border} />
  </View>
);

const SkeletonStockRow = ({
  shimmer,
  isFirst,
  isLast,
  styles,
  colors,
}: {
  shimmer: Animated.Value;
  isFirst?: boolean;
  isLast?: boolean;
  styles: Styles;
  colors: ThemeColors;
}) => (
  <View
    style={[
      styles.stockRow,
      isFirst && styles.stockRowFirst,
      isLast && styles.stockRowLast,
      !isFirst && styles.stockRowBorder,
    ]}>
    <Animated.View
      style={[styles.stockIcon, { backgroundColor: colors.border, opacity: shimmer }]}
    />
    <View style={[styles.stockInfo, { gap: 5 }]}>
      <SkeletonBox w={36} h={12} shimmer={shimmer} bg={colors.border} />
      <SkeletonBox w={70} h={10} shimmer={shimmer} bg={colors.border} />
    </View>
    <SkeletonBox w={52} h={28} shimmer={shimmer} bg={colors.border} />
    <View style={[styles.stockPriceCol, { gap: 4 }]}>
      <SkeletonBox w={72} h={12} shimmer={shimmer} bg={colors.border} />
      <SkeletonBox w={52} h={20} r={6} shimmer={shimmer} bg={colors.border} />
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

const InvestmentScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ── State ──
  const [activeTab, setActiveTab] = useState<MarketTab>('HOSE');

  const [rates,        setRates]        = useState<Rates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError,   setRatesError]   = useState(false);

  const [liveHOSE,     setLiveHOSE]     = useState<Stock[] | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError,   setStockError]   = useState(false);

  // Chi tiết mã + luồng đặt lệnh demo
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [orderStock,    setOrderStock]    = useState<Stock | null>(null);
  const [orderSide,     setOrderSide]     = useState<'buy' | 'sell' | null>(null);
  const [orderToast,    setOrderToast]    = useState(false);

  // Modal native luôn nằm trên Portal — phải đóng sheet trước rồi mới mở dialog
  const placeOrder = (side: 'buy' | 'sell') => {
    setOrderStock(selectedStock);
    setSelectedStock(null);
    setOrderSide(side);
  };

  // Skeleton pulse animation
  const shimmer = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // ── API calls ──

  const fetchRates = async () => {
    setRatesLoading(true);
    setRatesError(false);
    try {
      setRates(await apiFetchRates());
    } catch (err) {
      logger.error('invest', 'không tải được tỷ giá', err);
      setRatesError(true);
    } finally {
      setRatesLoading(false);
    }
  };

  const fetchStocks = async () => {
    setStockLoading(true);
    setStockError(false);
    try {
      setLiveHOSE(await fetchLiveHOSE());
    } catch (err) {
      logger.error('invest', 'không tải được dữ liệu cổ phiếu, dùng dữ liệu mẫu', err);
      setStockError(true);
    } finally {
      setStockLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRates();
    fetchStocks();
  };

  useEffect(() => {
    fetchRates();
    fetchStocks();

  }, []);

  // Which stock list to show
  const stocks: Stock[] =
    activeTab === 'HOSE' && liveHOSE ? liveHOSE : listStocks(activeTab);

  const showHOSELoading = activeTab === 'HOSE' && stockLoading && !liveHOSE;
  const showHOSEError   = activeTab === 'HOSE' && stockError && !liveHOSE;
  const showStockLive   = activeTab === 'HOSE' && !!liveHOSE;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Sub-header */}
      <SubHeader
        title={t.investment.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={handleRefresh} hitSlop={8}>
            <Icon2 type={ICON_TYPE.Iconoir} name="refresh-double" size={20} color={colors.accent700} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* ── Portfolio Card ── */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portLabel}>{t.investment.portfolio}</Text>
          <Text style={styles.portValue}>{money(42_680_000)}</Text>

          <View style={styles.portPnlRow}>
            <View style={styles.pnlBadgeUp}>
              <Icon type="ionicon" name="trending-up" size={11} color={UP_ON_DARK} />
              <Text style={styles.pnlTextUp}>+5.2% {t.investment.todayPnl}</Text>
            </View>
            <Text style={styles.pnlAmount}>+{money(2_100_000)}</Text>
          </View>

          <View style={styles.sparklineWrap}>
            <PortfolioSparkLine data={getPortfolioSeries()} color={colors.accent300} />
          </View>

          <View style={styles.allocRow}>
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: UP_ON_DARK }]}>{stockCount(3, t)}</Text>
              <Text style={styles.allocLabel}>{t.investment.profit}</Text>
            </View>
            <View style={styles.allocDivider} />
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: DOWN_ON_DARK }]}>{stockCount(1, t)}</Text>
              <Text style={styles.allocLabel}>{t.investment.loss}</Text>
            </View>
            <View style={styles.allocDivider} />
            <View style={styles.allocItem}>
              <Text style={[styles.allocNum, { color: colors.accent300 }]}>
                {shortMoney(8_500_000)}
              </Text>
              <Text style={styles.allocLabel}>{t.investment.cash}</Text>
            </View>
          </View>
        </View>

        {/* ── Live Rate Card ── */}
        {ratesLoading ? (
          <SkeletonRateCard shimmer={shimmer} styles={styles} colors={colors} />
        ) : ratesError ? (
          <View style={styles.errorCard}>
            <Icon type="ionicon" name="warning-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.errorText}>{t.investment.errorRates}</Text>
            <TouchableOpacity style={styles.errorRetryBtn} onPress={fetchRates}>
              <Text style={styles.errorRetryText}>{t.investment.retry}</Text>
            </TouchableOpacity>
          </View>
        ) : rates ? (
          <View style={styles.rateCard}>
            <View style={styles.rateCardHeader}>
              <Text style={styles.rateCardTitle}>{t.investment.rateTitle}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>{t.investment.liveTag}</Text>
              </View>
            </View>

            {/* USD */}
            <View style={styles.rateRow}>
              <Text style={styles.rateCurrency}>USD / VND</Text>
              <Text style={styles.rateValue}>
                {rates.usdVnd.toLocaleString('vi-VN')}
              </Text>
            </View>

            {/* EUR */}
            <View style={[styles.rateRow, styles.rateRowBorder]}>
              <Text style={styles.rateCurrency}>EUR / VND</Text>
              <Text style={styles.rateValue}>
                {rates.eurVnd.toLocaleString('vi-VN')}
              </Text>
            </View>

            {/* Gold */}
            <View style={[styles.rateRow, styles.rateRowBorder]}>
              <Text style={styles.rateCurrency}>{t.investment.goldGram}</Text>
              <Text style={styles.rateValue}>
                {shortMoney(rates.goldPerGram)}
              </Text>
            </View>

            <Text style={styles.rateUpdated}>
              {t.investment.updatedAt} {rates.updatedAt}
            </Text>
          </View>
        ) : null}

        {/* ── Market Section Header ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitleText}>{t.investment.market}</Text>
            {showStockLive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.liveIndicatorText}>{t.investment.liveTag}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate('WebViewScreen', {
                url: 'https://cafef.vn/thi-truong-chung-khoan.chn',
                title: t.investment.market,
              })
            }>
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
                {marketTabLabel(tab, t)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stock error banner (above mock data) */}
        {showHOSEError && (
          <TouchableOpacity style={styles.stockErrorBanner} onPress={fetchStocks}>
            <Icon type="ionicon" name="wifi-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.stockErrorText}>{t.investment.errorStock}</Text>
            <Icon type="ionicon" name="refresh-outline" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Stock List */}
        <View style={styles.stockList}>
          {showHOSELoading ? (
            // Skeleton rows while loading
            [0, 1, 2, 3].map(i => (
              <SkeletonStockRow
                key={i}
                shimmer={shimmer}
                isFirst={i === 0}
                isLast={i === 3}
                styles={styles}
                colors={colors}
              />
            ))
          ) : (
            stocks.map((stock: Stock, index: number) => (
              <TouchableOpacity
                key={stock.id}
                activeOpacity={0.75}
                onPress={() => setSelectedStock(stock)}
                style={[
                  styles.stockRow,
                  index === 0 && styles.stockRowFirst,
                  index === stocks.length - 1 && styles.stockRowLast,
                  index > 0 && styles.stockRowBorder,
                ]}>
                {/* Icon */}
                <View style={[styles.stockIcon, { backgroundColor: tickerVisual(stock.ticker).bg }]}>
                  <Text style={[styles.stockTickerIcon, { color: tickerVisual(stock.ticker).fg }]}>
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
                    <Text style={styles.stockVol}>
                      {t.investment.volume}: {stock.vol}
                    </Text>
                  ) : null}
                </View>

                {/* Sparkline */}
                <View style={styles.sparkWrap}>
                  <SparkLine
                    data={stock.sparkData}
                    color={stock.trend === 'up' ? colors.success : colors.danger}
                  />
                </View>

                {/* Price + change */}
                <View style={styles.stockPriceCol}>
                  <Text
                    style={[
                      styles.priceVal,
                      { color: stock.trend === 'up' ? colors.success : colors.danger },
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
            ))
          )}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <View style={styles.securityRow}>
          <Icon type="ionicon" name="lock-closed-outline" size={11} color="#ccc" />
          <Text style={styles.securityText}>{t.investment.ssl}</Text>
        </View>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.btnBuy}
            activeOpacity={0.85}
            onPress={() => {
              setOrderStock(null);
              setOrderSide('buy');
            }}>
            <Icon type="ionicon" name="trending-up" size={16} color="#fff" />
            <Text style={styles.btnBuyText}>{t.investment.buyNow}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSell}
            activeOpacity={0.85}
            onPress={() => {
              setOrderStock(null);
              setOrderSide('sell');
            }}>
            <Icon type="ionicon" name="trending-down" size={16} color="#c0392b" />
            <Text style={styles.btnSellText}>{t.investment.sell}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom sheet chi tiết mã cổ phiếu */}
      <Modal
        visible={!!selectedStock}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStock(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSelectedStock(null)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            {selectedStock && (
              <>
                <View style={styles.sheetHeader}>
                  <View
                    style={[styles.stockIcon, { backgroundColor: tickerVisual(selectedStock.ticker).bg }]}>
                    <Text
                      style={[styles.stockTickerIcon, { color: tickerVisual(selectedStock.ticker).fg }]}>
                      {selectedStock.ticker.slice(0, 3)}
                    </Text>
                  </View>
                  <View style={styles.sheetHeaderInfo}>
                    <Text style={styles.sheetTicker}>{selectedStock.ticker}</Text>
                    <Text style={styles.sheetName} numberOfLines={1}>
                      {selectedStock.name}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.changeBadge,
                      {
                        backgroundColor:
                          selectedStock.trend === 'up' ? '#e8f8f0' : '#ffeaea',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.changeText,
                        { color: selectedStock.trend === 'up' ? '#1a7a40' : '#c0392b' },
                      ]}>
                      {selectedStock.change > 0 ? '+' : ''}
                      {selectedStock.change.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.sheetPrice}>{money(selectedStock.price)}</Text>

                <View style={styles.sheetSpark}>
                  <SparkLine
                    data={selectedStock.sparkData}
                    color={selectedStock.trend === 'up' ? colors.success : colors.danger}
                    width={SCREEN_WIDTH - 88}
                    height={64}
                  />
                </View>

                {selectedStock.vol ? (
                  <Text style={styles.sheetVol}>
                    {t.investment.volume}: {selectedStock.vol}
                  </Text>
                ) : null}

                <View style={styles.ctaRow}>
                  <TouchableOpacity
                    style={styles.btnBuy}
                    activeOpacity={0.85}
                    onPress={() => placeOrder('buy')}>
                    <Icon type="ionicon" name="trending-up" size={16} color="#fff" />
                    <Text style={styles.btnBuyText}>{t.investment.buyNow}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnSell}
                    activeOpacity={0.85}
                    onPress={() => placeOrder('sell')}>
                    <Icon type="ionicon" name="trending-down" size={16} color="#c0392b" />
                    <Text style={styles.btnSellText}>{t.investment.sell}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Xác nhận lệnh + toast */}
      <AppDialog
        visible={!!orderSide}
        onDismiss={() => setOrderSide(null)}
        icon={orderSide === 'sell' ? 'trending-down' : 'trending-up'}
        tone={orderSide === 'sell' ? 'danger' : 'success'}
        title={orderSide === 'sell' ? t.investment.sellTitle : t.investment.buyTitle}
        description={`${orderStock ? orderStock.ticker + ' · ' : ''}${t.investment.orderDesc}`}
        cancelText={t.common.cancel}
        confirmText={t.common.confirm}
        onConfirm={() => {
          setOrderSide(null);
          setOrderStock(null);
          setOrderToast(true);
        }}
      />
      <AppSnackbar
        visible={orderToast}
        onDismiss={() => setOrderToast(false)}
        message={t.investment.orderSuccess}
        tone="success"
        duration={1800}
      />
    </SafeAreaView>
  );
};

export default InvestmentScreen;
