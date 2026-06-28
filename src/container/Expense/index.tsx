// ─── Imports ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PRIMARY        = '#E89951';
const PRIMARY_DARK   = '#b36a1a';
const PRIMARY_LIGHT  = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';
const COLOR_DANGER   = '#c0392b';
const COLOR_SUCCESS  = '#1a7a40';

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
const FILTER_IDS = ['', 'food', 'shopping', 'fun'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props { navigation: any; }

const ExpenseScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(0);
  const [addModal, setAddModal]         = useState(false);
  const [addAmount, setAddAmount]       = useState('');
  const [addNote, setAddNote]           = useState('');
  const [addCatIdx, setAddCatIdx]       = useState(0);

  const filters = [
    t.expense.filterAll,
    t.expense.filterFood,
    t.expense.filterShop,
    t.expense.filterFun,
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

      {/* ── Header cam ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.expense.title}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="options-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t.expense.totalMonth}</Text>
          <Text style={styles.heroAmount}>{money(totalMonth)}</Text>

          {/* Trend badge */}
          <View style={styles.trendBadge}>
            <Icon type="ionicon" name="trending-down" size={13} color={COLOR_SUCCESS} />
            <Text style={styles.trendText}>12% {t.expense.vsLastMonth}</Text>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => setAddModal(true)}>
              <View style={styles.quickIconWrap}>
                <Icon type="ionicon" name="add" size={20} color={PRIMARY_DARK} />
              </View>
              <Text style={styles.quickLabel}>{t.expense.addExpense}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('ExpenseStats' as never)}>
              <View style={styles.quickIconWrap}>
                <Icon type="ionicon" name="bar-chart-outline" size={20} color={PRIMARY_DARK} />
              </View>
              <Text style={styles.quickLabel}>{t.expense.stats}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn}>
              <View style={styles.quickIconWrap}>
                <Icon type="ionicon" name="time-outline" size={20} color={PRIMARY_DARK} />
              </View>
              <Text style={styles.quickLabel}>{t.expense.history}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Category section ── */}
        <Text style={styles.sectionLabel}>{t.expense.categoryTitle}</Text>
        <View style={styles.card}>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.catItem} activeOpacity={0.7}>
                <View style={[styles.catIconWrap, { backgroundColor: cat.iconBg }]}>
                  <Icon type="ionicon" name={cat.icon} size={22} color={cat.iconColor} />
                </View>
                <Text style={styles.catName} numberOfLines={1}>{getCatName(cat.id, t)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent transactions ── */}
        <View style={styles.sectionHeader}>
          <SectionTitle title={t.expense.recentTx} />
          <TouchableOpacity>
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
                placeholderTextColor="#ccc"
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
                  <View style={[styles.catPickerIcon, { backgroundColor: addCatIdx === i ? PRIMARY : cat.iconBg }]}>
                    <Icon type="ionicon" name={cat.icon} size={18} color={addCatIdx === i ? '#fff' : cat.iconColor} />
                  </View>
                  <Text style={[styles.catPickerLabel, addCatIdx === i && { color: PRIMARY_DARK, fontWeight: '600' }]}>
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
              placeholderTextColor="#ccc"
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

  // Scroll
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
  heroLabel: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLOR_DANGER,
    letterSpacing: -0.5,
    marginTop: 6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trendText: { fontSize: 11, color: COLOR_SUCCESS, fontWeight: '500' },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
  },
  quickIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: PRIMARY_BORDER,
  },
  quickLabel: { fontSize: 10, color: PRIMARY_DARK, fontWeight: '500' },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar: { width: 4, height: 18, backgroundColor: PRIMARY, borderRadius: 2 },
  sectionTitleText: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  viewAll: { fontSize: 12, color: PRIMARY, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },

  // Category grid (3 columns × 2 rows)
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  catItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  catIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  catName: { fontSize: 10, color: '#555', fontWeight: '500', textAlign: 'center' },

  // Filter chips
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { fontSize: 12, color: '#888' },
  filterTextActive: { color: '#fff', fontWeight: '500' },

  // Transaction list
  txCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  txIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  txMeta: { fontSize: 11, color: '#aaa', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: { fontSize: 13, fontWeight: '600', color: COLOR_DANGER },
  txTime: { fontSize: 10, color: '#bbb' },
  txDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginLeft: 72 },

  // Add Expense Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17, fontWeight: '600', color: '#1a1a1a',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11, color: '#aaa',
    letterSpacing: 0.5, fontWeight: '500',
    marginBottom: 8, marginTop: 12,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: PRIMARY_LIGHT,
    height: 52,
    gap: 8,
  },
  currencySign: { fontSize: 18, color: PRIMARY_DARK, fontWeight: '600' },
  amountInput: {
    flex: 1, fontSize: 22, fontWeight: '700',
    color: '#1a1a1a', paddingVertical: 0,
  },
  catPickerRow: { gap: 10, paddingVertical: 4 },
  catPickerItem: { alignItems: 'center', gap: 4, width: 64 },
  catPickerIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  catPickerItemActive: {},
  catPickerLabel: { fontSize: 10, color: '#888', textAlign: 'center' },
  noteInput: {
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1a1a1a',
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '500', color: '#888' },
  modalBtnSave: {
    flex: 2,
    backgroundColor: PRIMARY,
    borderRadius: 12, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnSaveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
