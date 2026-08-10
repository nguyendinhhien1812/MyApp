// ─── Imports ─────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Icon } from '@rneui/themed';
import AppIcon from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import SubHeader from '../../components/UI/SubHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

// ─── Brand colors ─────────────────────────────────────────────────────────────
// Giữ lại để dùng cho dữ liệu tĩnh (CATEGORIES/TRANSACTIONS) — không đổi theo theme.
const PRIMARY        = '#E89951';
const PRIMARY_DARK   = '#b36a1a';
const COLOR_DANGER   = '#c0392b';
const COLOR_SUCCESS  = '#1a7a40';
const UP_ON_DARK     = '#4ade80'; // xanh sáng trên nền tối (hero)

// ─── Types ────────────────────────────────────────────────────────────────────
type CategoryItem = {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  total: number;
  percent: number;
};

type TxItem = {
  id: number;
  name: string;
  category: string;
  categoryId: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  amount: number;
  date: string;
  time: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.abs(n));

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

// ─── Static data ──────────────────────────────────────────────────────────────
const CATEGORIES: CategoryItem[] = [
  { id: 'food',      name: 'Ăn uống',    icon: 'restaurant-outline',      iconBg: '#fff4e8', iconColor: PRIMARY_DARK, total: 3_200_000, percent: 0.38 },
  { id: 'shopping',  name: 'Mua sắm',    icon: 'bag-handle-outline',      iconBg: '#f5f0ff', iconColor: '#6c3fc4',   total: 2_100_000, percent: 0.25 },
  { id: 'fun',       name: 'Giải trí',   icon: 'game-controller-outline', iconBg: '#e8f0f8', iconColor: '#1a4a7a',  total: 890_000,   percent: 0.11 },
  { id: 'transport', name: 'Di chuyển',  icon: 'car-outline',             iconBg: '#e8f8f0', iconColor: COLOR_SUCCESS, total: 650_000, percent: 0.08 },
  { id: 'utility',   name: 'Tiện ích',   icon: 'flash-outline',           iconBg: '#ffeaea', iconColor: COLOR_DANGER, total: 1_485_110, percent: 0.18 },
  { id: 'other',     name: 'Khác',       icon: 'ellipsis-horizontal',     iconBg: '#f0f0f0', iconColor: '#888',     total: 0,         percent: 0 },
];

const TRANSACTIONS: TxItem[] = [
  { id: 1,  name: 'Starbucks Coffee',    category: 'Ăn uống',   categoryId: 'food',      icon: 'cafe-outline',           iconBg: '#fff4e8', iconColor: PRIMARY_DARK,   amount: -163_980,  date: '10/09/2024', time: '17:13' },
  { id: 2,  name: 'Netflix',             category: 'Giải trí',  categoryId: 'fun',       icon: 'play-circle-outline',    iconBg: '#ffeaea', iconColor: COLOR_DANGER,   amount: -60_230,   date: '09/09/2024', time: '12:00' },
  { id: 3,  name: 'Spotify Premium',     category: 'Giải trí',  categoryId: 'fun',       icon: 'musical-notes-outline',  iconBg: '#e8f8f0', iconColor: COLOR_SUCCESS,  amount: -29_900,   date: '08/09/2024', time: '09:00' },
  { id: 4,  name: 'Bữa trưa văn phòng', category: 'Ăn uống',   categoryId: 'food',      icon: 'restaurant-outline',     iconBg: '#fff4e8', iconColor: PRIMARY_DARK,   amount: -85_000,   date: '08/09/2024', time: '12:30' },
  { id: 5,  name: 'Shopee',             category: 'Mua sắm',   categoryId: 'shopping',  icon: 'bag-handle-outline',     iconBg: '#f5f0ff', iconColor: '#6c3fc4',      amount: -250_000,  date: '07/09/2024', time: '20:45' },
  { id: 6,  name: 'Grab',              category: 'Di chuyển', categoryId: 'transport', icon: 'car-outline',            iconBg: '#e8f8f0', iconColor: COLOR_SUCCESS,  amount: -35_000,   date: '07/09/2024', time: '08:10' },
  { id: 7,  name: 'Pay H&M',           category: 'Mua sắm',   categoryId: 'shopping',  icon: 'shirt-outline',          iconBg: '#f5f0ff', iconColor: '#6c3fc4',      amount: -199_000,  date: '06/09/2024', time: '14:22' },
  { id: 8,  name: 'Điện EVN',          category: 'Tiện ích',  categoryId: 'utility',   icon: 'flash-outline',          iconBg: '#ffeaea', iconColor: COLOR_DANGER,   amount: -320_000,  date: '05/09/2024', time: '10:00' },
];

// Filter id → categoryId mapping (index-based, i18n-safe)
const FILTER_IDS = ['', 'food', 'shopping', 'fun', 'transport', 'utility', 'other'];

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props { navigation: any; }

const ExpenseScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scrollRef = React.useRef<ScrollView>(null);
  const [activeFilter, setActiveFilter] = useState(0);
  const [addModal, setAddModal]         = useState(false);
  const [addAmount, setAddAmount]       = useState('');
  const [addNote, setAddNote]           = useState('');
  const [addCatIdx, setAddCatIdx]       = useState(0);

  // ─── Sub-component: Section title (dùng styles theo theme) ───────────────
  const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitleRow}>
      <View style={styles.accentBar} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );

  const filters = [
    t.expense.filterAll,
    t.expense.filterFood,
    t.expense.filterShop,
    t.expense.filterFun,
    t.expense.catTransport,
    t.expense.catUtility,
    t.expense.catOther,
  ];

  // Index-based filter — never compare to label string
  const filtered = TRANSACTIONS.filter(item =>
    activeFilter === 0 ? true : item.categoryId === FILTER_IDS[activeFilter],
  );

  const totalMonth = TRANSACTIONS.reduce((s, i) => s + Math.abs(i.amount), 0);

  const handleSaveExpense = () => {
    setAddModal(false);
    setAddAmount('');
    setAddNote('');
    setAddCatIdx(0);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Sub-header ── */}
      <SubHeader
        title={t.expense.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('ExpenseStats' as never)} hitSlop={8}>
            <AppIcon type={ICON_TYPE.Iconoir} name="graph-up" size={20} color={colors.accent700} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t.expense.totalMonth}</Text>
          <Text style={styles.heroAmount}>{money(totalMonth)}</Text>

          {/* Trend badge */}
          <View style={styles.trendBadge}>
            <Icon type="ionicon" name="trending-down" size={13} color={UP_ON_DARK} />
            <Text style={styles.trendText}>12% {t.expense.vsLastMonth}</Text>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => setAddModal(true)}>
              <AppIcon type={ICON_TYPE.Iconoir} name="plus" size={20} color={colors.accent300} />
              <Text style={styles.quickLabel}>{t.expense.addExpense}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('ExpenseStats' as never)}>
              <AppIcon type={ICON_TYPE.Iconoir} name="stats-report" size={20} color={colors.accent300} />
              <Text style={styles.quickLabel}>{t.expense.stats}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => {
                setActiveFilter(0);
                scrollRef.current?.scrollToEnd({ animated: true });
              }}>
              <AppIcon type={ICON_TYPE.Iconoir} name="clock" size={20} color={colors.accent300} />
              <Text style={styles.quickLabel}>{t.expense.history}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Breakdown theo danh mục ── */}
        <Text style={styles.sectionLabel}>{t.expense.categoryTitle}</Text>
        <View style={styles.breakdownList}>
          {CATEGORIES.filter(cat => cat.total > 0).map(cat => {
            const pct = Math.round(cat.percent * 100);
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.bdRow}
                activeOpacity={0.7}
                onPress={() => {
                  // Lọc giao dịch theo danh mục — danh mục chưa có filter riêng thì về Tất cả
                  const idx = FILTER_IDS.indexOf(cat.id);
                  setActiveFilter(idx > 0 ? idx : 0);
                  scrollRef.current?.scrollToEnd({ animated: true });
                }}>
                <View style={[styles.bdIcon, { backgroundColor: cat.iconBg }]}>
                  <Icon type="ionicon" name={cat.icon} size={18} color={cat.iconColor} />
                </View>
                <View style={styles.bdInfo}>
                  <View style={styles.bdTopRow}>
                    <Text style={styles.bdName}>{getCatName(cat.id, t)}</Text>
                    <Text style={styles.bdAmount}>{money(cat.total)}</Text>
                  </View>
                  <View style={styles.bdBarBg}>
                    <View style={[styles.bdBarFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <Text style={styles.bdPercent}>{pct}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Recent transactions ── */}
        <View style={styles.sectionHeader}>
          <SectionTitle title={t.expense.recentTx} />
          <TouchableOpacity
            onPress={() => {
              setActiveFilter(0);
              scrollRef.current?.scrollToEnd({ animated: true });
            }}>
            <Text style={styles.viewAll}>{t.expense.viewAll}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filters.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
              onPress={() => setActiveFilter(i)}>
              <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction list */}
        <View style={styles.txCard}>
          {filtered.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.txRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExpenseDetail' as never, { item } as never)}>
                <View style={[styles.txIconWrap, { backgroundColor: item.iconBg }]}>
                  <Icon type="ionicon" name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{item.name}</Text>
                  <Text style={styles.txMeta}>{getCatName(item.categoryId, t)} · {item.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{money(item.amount)}</Text>
                  <Text style={styles.txTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
              {index < filtered.length - 1 && <View style={styles.txDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Add Expense Modal ── */}
      <Modal
        visible={addModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAddModal(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.handle} />

            <Text style={styles.modalTitle}>{t.expense.addTitle}</Text>

            {/* Amount input */}
            <Text style={styles.inputLabel}>{t.expense.addAmount}</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.currencySign}>₫</Text>
              <TextInput
                style={styles.amountInput}
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Category picker */}
            <Text style={styles.inputLabel}>{t.expense.addCategory}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catPickerRow}>
              {CATEGORIES.filter(c => c.id !== 'other').map((cat, i) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPickerItem, addCatIdx === i && styles.catPickerItemActive]}
                  onPress={() => setAddCatIdx(i)}>
                  <View style={[styles.catPickerIcon, { backgroundColor: addCatIdx === i ? colors.accent : cat.iconBg }]}>
                    <Icon type="ionicon" name={cat.icon} size={18} color={addCatIdx === i ? colors.offWhite : cat.iconColor} />
                  </View>
                  <Text style={[styles.catPickerLabel, addCatIdx === i && { color: colors.accent700, fontFamily: FONT.semibold }]}>
                    {getCatName(cat.id, t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Note input */}
            <Text style={styles.inputLabel}>{t.expense.addNote}</Text>
            <TextInput
              style={styles.noteInput}
              value={addNote}
              onChangeText={setAddNote}
              placeholder={t.expense.notePlaceholder}
              placeholderTextColor={colors.muted}
              multiline
            />

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setAddModal(false)}>
                <Text style={styles.modalBtnCancelText}>{t.expense.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveExpense}>
                <Text style={styles.modalBtnSaveText}>{t.expense.save}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ExpenseScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  // Scroll
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
    fontFamily: FONT.semibold,
    fontSize: 28,
    color: c.offWhite,
    marginTop: 6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74,222,128,0.16)',
    borderRadius: RADII.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trendText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: UP_ON_DARK },

  // Quick actions — ô mờ trên nền tối
  quickRow: {
    flexDirection: 'row',
    gap: SPACING.s2,
    marginTop: SPACING.s4,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(253,252,251,0.12)',
    borderRadius: RADII.item,
    paddingVertical: 12,
  },
  quickLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    color: 'rgba(253,252,251,0.85)',
  },

  // Section labels
  sectionLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s5,
    marginBottom: SPACING.s3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s5,
    marginBottom: SPACING.s3,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar: { width: 0, height: 0 },
  sectionTitleText: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  viewAll: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.accent700 },

  // Breakdown theo danh mục
  breakdownList: {
    marginHorizontal: SPACING.screenX,
    backgroundColor: c.white,
    borderRadius: RADII.card,
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s2,
  },
  bdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s3,
    paddingVertical: SPACING.s3,
  },
  bdIcon: {
    width: 36, height: 36, borderRadius: RADII.item,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bdInfo: { flex: 1, gap: 6 },
  bdTopRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bdName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  bdAmount: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  bdBarBg: { height: 4, borderRadius: 2, backgroundColor: c.divider, overflow: 'hidden' },
  bdBarFill: { height: 4, borderRadius: 2, backgroundColor: c.accent },
  bdPercent: {
    fontFamily: FONT.medium,
    fontSize: TYPE.caption,
    color: c.accent700,
    width: 36,
    textAlign: 'right',
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: SPACING.screenX,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: c.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: c.accent100, borderColor: c.accent100 },
  filterText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  filterTextActive: { fontFamily: FONT.medium, color: c.accent700 },

  // Transaction list
  txCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    paddingHorizontal: SPACING.s4,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: SPACING.s3,
  },
  txIconWrap: {
    width: 40, height: 40, borderRadius: RADII.item,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  txMeta: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.danger },
  txTime: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
  txDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginLeft: 52 },

  // Add Expense Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: c.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: c.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: FONT.regular, fontSize: TYPE.caption,
    letterSpacing: 0.5, color: c.muted,
    marginBottom: 8, marginTop: 12,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.accent100,
    borderRadius: RADII.item,
    paddingHorizontal: 14,
    backgroundColor: c.accent100,
    height: 52,
    gap: 8,
  },
  currencySign: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.accent700 },
  amountInput: {
    flex: 1, fontFamily: FONT.semibold, fontSize: 22,
    color: c.text, paddingVertical: 0,
  },
  catPickerRow: { gap: 10, paddingVertical: 4 },
  catPickerItem: { alignItems: 'center', gap: 4, width: 64 },
  catPickerIcon: {
    width: 44, height: 44, borderRadius: RADII.item,
    alignItems: 'center', justifyContent: 'center',
  },
  catPickerItemActive: {},
  catPickerLabel: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, textAlign: 'center' },
  noteInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    borderRadius: RADII.item,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.text,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: c.white,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: c.bg,
    borderRadius: RADII.item, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnCancelText: { fontFamily: FONT.medium, fontSize: TYPE.itemTitle, color: c.subtext },
  modalBtnSave: {
    flex: 2,
    backgroundColor: c.heroDark,
    borderRadius: RADII.item, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnSaveText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
