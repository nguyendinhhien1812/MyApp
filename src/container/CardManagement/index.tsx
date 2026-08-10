import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AppIcon from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import SubHeader from '../../components/UI/SubHeader';
import { AppDialog, AppSnackbar } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
}

interface Props {
  navigation: any;
}

const CardManagementScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [onlinePayment, setOnlinePayment] = useState(true);
  const [intlPayment, setIntlPayment] = useState(false);
  const [notification, setNotification] = useState(true);
  const [locked, setLocked] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [lockDialog, setLockDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [toast, setToast] = useState('');

  const Toggle = ({ value, onToggle }: ToggleProps) => (
    <TouchableOpacity
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
      onPress={onToggle}
      activeOpacity={0.8}>
      <View style={[styles.toggleThumb, value ? styles.thumbOn : styles.thumbOff]} />
    </TouchableOpacity>
  );

  const toggleData: { label: string; sub: string; value: boolean; onToggle: () => void }[] = [
    { label: t.card.onlinePayment, sub: t.card.onlinePaymentSub, value: onlinePayment, onToggle: () => setOnlinePayment(v => !v) },
    { label: t.card.intlPayment, sub: t.card.intlPaymentSub, value: intlPayment, onToggle: () => setIntlPayment(v => !v) },
    { label: t.card.txNotification, sub: t.card.txNotificationSub, value: notification, onToggle: () => setNotification(v => !v) },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader
        title={t.card.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setToast(t.common.demoFeature)} hitSlop={8}>
            <AppIcon type={ICON_TYPE.Iconoir} name="plus" size={22} color={c.accent700} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Card visual — thẻ Visa tối */}
        <View style={styles.cardVisual}>
          <View style={styles.chip} />
          <Text style={styles.cardNumber}>
            {showNumber ? '4532  8721  9034  8842' : '••••  ••••  ••••  8842'}
          </Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardFieldLabel}>CHỦ THẺ</Text>
              <Text style={styles.cardFieldValue}>N. DINH HIEN</Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>HẾT HẠN</Text>
              <Text style={styles.cardFieldValue}>12/28</Text>
            </View>
            <Text style={styles.visaText}>VISA</Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, locked && styles.statusDotLocked]} />
          <Text style={styles.statusText}>
            {locked ? t.card.lockedStatus : t.card.activeStatus}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Visa Debit</Text>
          </View>
        </View>

        {/* 3 secondary buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.secBtn}
            onPress={() => {
              if (locked) { setLocked(false); setToast(t.card.unlockedToast); }
              else { setLockDialog(true); }
            }}>
            <Text style={styles.secBtnText}>{locked ? t.card.unlockAction : t.card.lockAction}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secBtn} onPress={() => setShowNumber(v => !v)}>
            <Text style={styles.secBtnText}>{t.card.cardNumber}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secBtn} onPress={() => setToast(t.common.demoFeature)}>
            <Text style={styles.secBtnText}>{t.card.statement}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Hạn mức */}
        <View style={styles.limitBlock}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitTitle}>{t.card.limitTitle}</Text>
            <Text style={styles.limitPercent}>25% {t.card.limitUsed}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitUsed}>12.500.000 ₫</Text>
            <Text style={styles.limitTotal}>/ 50.000.000 ₫</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Toggle list */}
        <View style={styles.toggleList}>
          {toggleData.map((r, i) => (
            <View
              key={r.label}
              style={[styles.toggleRow, i < toggleData.length - 1 && styles.toggleRowBorder]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{r.label}</Text>
                <Text style={styles.toggleSub}>{r.sub}</Text>
              </View>
              <Toggle value={r.value} onToggle={r.onToggle} />
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <TouchableOpacity style={styles.dangerBtn} onPress={() => setCancelDialog(true)}>
          <AppIcon type={ICON_TYPE.Iconoir} name="trash" size={16} color={c.danger} />
          <Text style={styles.dangerText}>{t.card.cancelCard}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Dialogs + toast */}
      <AppDialog
        visible={lockDialog}
        onDismiss={() => setLockDialog(false)}
        icon="lock-closed-outline"
        tone="danger"
        title={t.card.lockTitle}
        description={t.card.lockDesc}
        cancelText={t.common.cancel}
        confirmText={t.card.lockAction}
        onConfirm={() => {
          setLockDialog(false);
          setLocked(true);
          setToast(t.card.lockedToast);
        }}
      />
      <AppDialog
        visible={cancelDialog}
        onDismiss={() => setCancelDialog(false)}
        icon="trash-outline"
        tone="danger"
        title={t.card.cancelTitle}
        description={t.card.cancelDesc}
        cancelText={t.common.cancel}
        confirmText={t.common.confirm}
        onConfirm={() => {
          setCancelDialog(false);
          setToast(t.common.demoFeature);
        }}
      />
      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone="default"
        duration={1800}
      />
    </SafeAreaView>
  );
};

export default CardManagementScreen;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: SPACING.screenX, gap: SPACING.s4, paddingBottom: 40 },

    // Card visual — thẻ Visa tối
    cardVisual: {
      backgroundColor: c.heroDark,
      borderRadius: RADII.card,
      padding: SPACING.s4,
      gap: SPACING.s4,
    },
    chip: {
      width: 30,
      height: 21,
      borderRadius: RADII.chip,
      backgroundColor: 'rgba(216,183,131,0.5)',
    },
    cardNumber: {
      fontFamily: FONT.medium,
      fontSize: TYPE.itemTitle,
      letterSpacing: 3,
      color: 'rgba(253,252,251,0.92)',
    },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardFieldLabel: {
      fontFamily: FONT.regular,
      fontSize: 8.5,
      letterSpacing: 1.4,
      color: 'rgba(253,252,251,0.5)',
      marginBottom: 3,
    },
    cardFieldValue: {
      fontFamily: FONT.medium,
      fontSize: TYPE.caption,
      letterSpacing: 0.6,
      color: c.offWhite,
    },
    visaText: {
      fontFamily: FONT.semibold,
      fontSize: TYPE.title,
      fontStyle: 'italic',
      color: c.accent300,
    },

    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider },

    // Status
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s2 },
    statusDot: { width: 7, height: 7, borderRadius: RADII.pill, backgroundColor: c.success },
    statusDotLocked: { backgroundColor: c.danger },
    statusText: { flex: 1, fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
    statusBadge: {
      backgroundColor: c.white,
      borderRadius: RADII.pill,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusBadgeText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },

    // Secondary buttons
    btnRow: { flexDirection: 'row', gap: SPACING.s2 },
    secBtn: {
      flex: 1,
      backgroundColor: c.white,
      borderRadius: RADII.item,
      paddingVertical: 11,
      alignItems: 'center',
    },
    secBtnText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.text },

    // Limit
    limitBlock: { gap: SPACING.s2 },
    limitHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    limitTitle: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: c.muted,
    },
    limitPercent: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },
    progressBg: { height: 4, borderRadius: 2, backgroundColor: c.divider, overflow: 'hidden' },
    progressFill: { width: '25%', height: 4, borderRadius: 2, backgroundColor: c.accent },
    limitRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    limitUsed: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
    limitTotal: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },

    // Toggles
    toggleList: {},
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s3,
      paddingVertical: SPACING.s3,
    },
    toggleRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider },
    toggleInfo: { flex: 1, gap: 2 },
    toggleLabel: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
    toggleSub: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },
    toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center', borderWidth: 1 },
    toggleOn: { backgroundColor: c.accent, borderColor: c.accent },
    toggleOff: { backgroundColor: 'transparent', borderColor: c.border },
    toggleThumb: { width: 16, height: 16, borderRadius: 8, position: 'absolute' },
    thumbOn: { right: 2, backgroundColor: c.offWhite },
    thumbOff: { left: 2, backgroundColor: c.muted },

    // Danger
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.s2,
      backgroundColor: c.white,
      borderRadius: RADII.item,
      paddingVertical: 14,
      marginTop: SPACING.s2,
    },
    dangerText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.danger },
  });
