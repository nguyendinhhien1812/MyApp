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
import { CategoryId, getCatName, CATEGORY_VISUALS } from './categories';
import { moneyAbs } from '../../utils/money';
import {
  listCategories,
  listExpenses,
  totalSpent,
} from '../../services/expenseService';

// Xanh sáng cho nhãn trên khối hero luôn tối — không đổi theo theme.
const UP_ON_DARK = '#4ade80';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Chip lọc theo index; '' = tất cả
const FILTER_IDS: Array<'' | CategoryId> = ['', 'food', 'shopping', 'fun', 'transport', 'utility', 'other'];

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
  const filtered = listExpenses(
    activeFilter === 0 ? undefined : { categoryId: FILTER_IDS[activeFilter] as CategoryId },
  );

  const totalMonth = totalSpent();

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
          <Text style={styles.heroAmount}>{moneyAbs(totalMonth)}</Text>

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
          {listCategories().filter(cat => cat.total > 0).map(cat => {
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
                <View style={[styles.bdIcon, { backgroundColor: CATEGORY_VISUALS[cat.id].iconBg }]}>
                  <Icon type="ionicon" name={CATEGORY_VISUALS[cat.id].icon} size={18} color={CATEGORY_VISUALS[cat.id].iconColor} />
                </View>
                <View style={styles.bdInfo}>
                  <View style={styles.bdTopRow}>
                    <Text style={styles.bdName}>{getCatName(cat.id, t)}</Text>
                    <Text style={styles.bdAmount}>{moneyAbs(cat.total)}</Text>
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
          <SectionTitle styles={styles} title={t.expense.recentTx} />
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
                <View style={[styles.txIconWrap, { backgroundColor: CATEGORY_VISUALS[item.categoryId].iconBg }]}>
                  <Icon type="ionicon" name={item.icon} size={20} color={CATEGORY_VISUALS[item.categoryId].iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{item.name}</Text>
                  <Text style={styles.txMeta}>{getCatName(item.categoryId, t)} · {item.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{moneyAbs(item.amount)}</Text>
                  <Text style={styles.txTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
              {index < filtered.length - 1 && <View style={styles.txDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.spacer32} />
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
              {listCategories().filter(c => c.id !== 'other').map((cat, i) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPickerItem, addCatIdx === i && styles.catPickerItemActive]}
                  onPress={() => setAddCatIdx(i)}>
                  <View style={[styles.catPickerIcon, { backgroundColor: addCatIdx === i ? colors.accent : CATEGORY_VISUALS[cat.id].iconBg }]}>
                    <Icon type="ionicon" name={CATEGORY_VISUALS[cat.id].icon} size={18} color={addCatIdx === i ? colors.offWhite : CATEGORY_VISUALS[cat.id].iconColor} />
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
/** Kiểu bảng style, để component tách ra ngoài vẫn đúng kiểu. */
type Styles = ReturnType<typeof makeStyles>;

// Đặt NGOÀI component cha: định nghĩa bên trong thì mỗi lần cha vẽ lại sẽ tạo
// một hàm mới, React coi là loại component khác và huỷ cả cây con.
const SectionTitle = ({ title, styles }: { title: string; styles: Styles }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  spacer32: { height: 32 },

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
    borderWidth: 1,
    borderColor: c.borderStrong,
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
    backgroundColor: c.btnSolid,
    borderRadius: RADII.item, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnSaveText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
