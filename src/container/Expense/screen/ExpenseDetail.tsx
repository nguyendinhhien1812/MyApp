// ─── Imports ─────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
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
import { AppSnackbar } from '../../../components/UI';
import SubHeader from '../../../components/UI/SubHeader';
import AppIcon from '../../../components/Icon';
import { ICON_TYPE } from '../../../components/Icon/style';
import { useLanguage } from '../../../context/LanguageContext';
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../../theme/tokens';
import { CategoryId, getCatName } from '../categories';
import { moneyAbs } from '../../../utils/money';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const COLOR_DANGER   = '#c0392b';
const COLOR_SUCCESS  = '#1a7a40';

// ─── Types ────────────────────────────────────────────────────────────────────
type TxItem = {
  id: number;
  name: string;
  categoryId: CategoryId;
  icon: string;
  iconBg: string;
  iconColor: string;
  amount: number;
  date: string;
  time: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Screen ───────────────────────────────────────────────────────────────────
interface Props { navigation: any; route: any; }

const ExpenseDetail = ({ navigation, route }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const item = (route.params as any)?.item as TxItem | undefined;
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  // ─── Sub-component: Detail row (dùng styles theo theme) ───────────────────

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <SubHeader title={t.expense.detailTitle} onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      <SubHeader
        title={t.expense.detailTitle}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setToast(t.common.demoFeature)} hitSlop={8}>
            <AppIcon type={ICON_TYPE.Iconoir} name="share-ios" size={20} color={colors.accent700} />
          </TouchableOpacity>
        }
      />

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
          <Text style={styles.heroAmount}>{moneyAbs(item.amount)}</Text>
          {/* Status badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{t.expense.statusDone}</Text>
          </View>
        </View>

        {/* ── Info card ── */}
        <View style={styles.card}>
          <DetailRow styles={styles}
            label={t.expense.categoryLabel}
            value={getCatName(item.categoryId, t)}
          />
          <DetailRow styles={styles}
            label={t.expense.payment}
            value="Visa *4242"
          />
          <DetailRow styles={styles}
            label={t.expense.amountLabel}
            value={moneyAbs(item.amount)}
            valueColor={COLOR_DANGER}
          />
          <DetailRow styles={styles}
            label={t.expense.dateLabel}
            value={item.date}
          />
          <DetailRow styles={styles}
            label={t.expense.timeLabel}
            value={item.time}
            isLast
          />
        </View>

        {/* ── Note section ── */}
        <Text style={styles.sectionLabel}>{t.expense.noteLabel}</Text>
        <View style={[styles.card, styles.cardTight]}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t.expense.notePlaceholder}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── Receipt row ── */}
        <Text style={styles.sectionLabel}>{t.expense.receipt}</Text>
        <TouchableOpacity
          style={styles.receiptCard}
          activeOpacity={0.7}
          onPress={() => setToast(t.common.demoFeature)}>
          <View style={styles.receiptIcon}>
            <Icon type="ionicon" name="cloud-upload-outline" size={24} color={colors.accent700} />
          </View>
          <View style={styles.fill}>
            <Text style={styles.receiptTitle}>{t.expense.uploadReceipt}</Text>
            <Text style={styles.receiptSub}>{t.expense.receiptHint}</Text>
          </View>
          <Icon type="ionicon" name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>

        <View style={styles.spacer16} />
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.sslRow}>
          <Icon type="ionicon" name="lock-closed-outline" size={11} color={colors.muted} />
          <Text style={styles.sslText}>{t.expense.ssl}</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => setToast(t.expense.noteSaved)}>
          <Icon type="ionicon" name="checkmark-circle-outline" size={18} color={colors.offWhite} />
          <Text style={styles.primaryBtnText}>{t.expense.saveNote}</Text>
        </TouchableOpacity>
      </View>

      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone={toast === t.expense.noteSaved ? 'success' : 'default'}
        duration={1800}
      />
    </SafeAreaView>
  );
};

export default ExpenseDetail;

// ─── Styles ───────────────────────────────────────────────────────────────────
/** Kiểu bảng style, để component tách ra ngoài vẫn đúng kiểu. */
type Styles = ReturnType<typeof makeStyles>;

// Đặt NGOÀI component cha: định nghĩa bên trong thì mỗi lần cha vẽ lại sẽ
// tạo một hàm mới, React coi là loại component khác và huỷ cả cây con.
const DetailRow = ({
  label,
  value,
  isLast = false,
  valueColor,
  styles,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  valueColor?: string;
  styles: Styles;
}) => (
  <>
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  cardTight: { padding: 14 },
  fill: { flex: 1 },
  spacer16: { height: 16 },

  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { paddingBottom: 16 },

  // Hero section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: SPACING.screenX,
  },
  heroIconWrap: {
    width: 72, height: 72, borderRadius: RADII.card,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  heroName: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text, marginBottom: 6 },
  heroAmount: { fontFamily: FONT.bold, fontSize: 28, color: COLOR_DANGER },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f8f0',
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLOR_SUCCESS },
  statusText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: COLOR_SUCCESS },

  // Card
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    overflow: 'hidden',
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
  },
  detailLabel: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  detailValue: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginHorizontal: SPACING.s4 },

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

  // Note input
  noteInput: {
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.text,
    minHeight: 60,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },

  // Receipt card
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
    gap: SPACING.s3,
  },
  receiptIcon: {
    width: 44, height: 44, borderRadius: RADII.item,
    backgroundColor: c.accent100,
    alignItems: 'center', justifyContent: 'center',
  },
  receiptTitle: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  receiptSub: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 2 },

  // Bottom bar
  bottomBar: {
    backgroundColor: c.white,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
  },
  sslRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  sslText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
  primaryBtn: {
    backgroundColor: c.btnSolid,
    borderRadius: RADII.item,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
