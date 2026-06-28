// ─── Imports ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../../context/LanguageContext';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PRIMARY        = '#E89951';
const PRIMARY_DARK   = '#b36a1a';
const PRIMARY_LIGHT  = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';
const COLOR_DANGER   = '#c0392b';
const COLOR_SUCCESS  = '#1a7a40';

// ─── Types ────────────────────────────────────────────────────────────────────
type TxItem = {
  id: number;
  name: string;
  category: string;
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

// ─── Sub-component: Detail row ────────────────────────────────────────────────
const DetailRow = ({
  label,
  value,
  isLast = false,
  valueColor,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  valueColor?: string;
}) => (
  <>
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
interface Props { navigation: any; route: any; }

const ExpenseDetail = ({ navigation, route }: Props) => {
  const { t } = useLanguage();
  const item = (route.params as any)?.item as TxItem | undefined;
  const [note, setNote] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.expense.detailTitle}</Text>
          <View style={styles.headerBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header cam ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.expense.detailTitle}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="share-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── Icon + Amount hero ── */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIconWrap, { backgroundColor: item.iconBg }]}>
            <Icon type="ionicon" name={item.icon} size={32} color={item.iconColor} />
          </View>
          <Text style={styles.heroName}>{item.name}</Text>
          <Text style={styles.heroAmount}>{money(item.amount)}</Text>
          {/* Status badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{t.expense.statusDone}</Text>
          </View>
        </View>

        {/* ── Info card ── */}
        <View style={styles.card}>
          <DetailRow
            label={t.expense.categoryLabel}
            value={getCatName(item.categoryId, t)}
          />
          <DetailRow
            label={t.expense.payment}
            value="Visa *4242"
          />
          <DetailRow
            label={t.expense.amountLabel}
            value={money(item.amount)}
            valueColor={COLOR_DANGER}
          />
          <DetailRow
            label={t.expense.dateLabel}
            value={item.date}
          />
          <DetailRow
            label={t.expense.timeLabel}
            value={item.time}
            isLast
          />
        </View>

        {/* ── Note section ── */}
        <Text style={styles.sectionLabel}>{t.expense.noteLabel}</Text>
        <View style={[styles.card, { padding: 14 }]}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t.expense.notePlaceholder}
            placeholderTextColor="#ccc"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── Receipt row ── */}
        <Text style={styles.sectionLabel}>{t.expense.receipt}</Text>
        <TouchableOpacity style={styles.receiptCard} activeOpacity={0.7}>
          <View style={styles.receiptIcon}>
            <Icon type="ionicon" name="cloud-upload-outline" size={24} color={PRIMARY_DARK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.receiptTitle}>{t.expense.uploadReceipt}</Text>
            <Text style={styles.receiptSub}>JPG, PNG, PDF · tối đa 5MB</Text>
          </View>
          <Icon type="ionicon" name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.sslRow}>
          <Icon type="ionicon" name="lock-closed-outline" size={11} color="#ccc" />
          <Text style={styles.sslText}>{t.expense.ssl}</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
          <Icon type="ionicon" name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{t.expense.saveNote}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default ExpenseDetail;

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

  // Hero section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  heroIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  heroName: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  heroAmount: { fontSize: 28, fontWeight: '700', color: COLOR_DANGER, letterSpacing: -0.5 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLOR_SUCCESS },
  statusText: { fontSize: 12, color: COLOR_SUCCESS, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 13, color: '#888' },
  detailValue: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  rowDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginHorizontal: 16 },

  // Section label
  sectionLabel: {
    fontSize: 11, color: '#aaa',
    letterSpacing: 0.6, fontWeight: '500',
    marginHorizontal: 20, marginTop: 20, marginBottom: 8,
  },

  // Note input
  noteInput: {
    fontSize: 13, color: '#1a1a1a',
    minHeight: 60,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },

  // Receipt card
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    gap: 12,
  },
  receiptIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  receiptTitle: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  receiptSub: { fontSize: 11, color: '#aaa', marginTop: 2 },

  // Bottom bar
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
  },
  sslRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  sslText: { fontSize: 10, color: '#ccc' },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
