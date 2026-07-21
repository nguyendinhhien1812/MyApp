import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { AppSnackbar } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme, ThemeMode } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { Lang } from '../../i18n/translations';

const LANG_OPTIONS: { code: Lang; label: string; flag: string; sublabel: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', sublabel: 'Vietnamese' },
  { code: 'en', label: 'English', flag: '🇬🇧', sublabel: 'Tiếng Anh' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

const SettingScreen = () => {
  const { lang, t, setLang } = useLanguage();
  const { mode, setMode, colors } = useAppTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notification, setNotification] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [toast, setToast] = useState('');

  const currentLangLabel = LANG_OPTIONS.find(o => o.code === lang)?.label ?? '';

  const THEME_OPTIONS: { code: ThemeMode; label: string; sub?: string; icon: string }[] = [
    { code: 'light', label: t.setting.themeLight, icon: 'sunny-outline' },
    { code: 'dark', label: t.setting.themeDark, icon: 'moon-outline' },
    {
      code: 'system',
      label: t.setting.themeSystem,
      sub: t.setting.themeSystemSub,
      icon: 'phone-portrait-outline',
    },
  ];
  const currentThemeLabel =
    THEME_OPTIONS.find(o => o.code === mode)?.label ?? '';

  // Row menu (đóng trong component để dùng styles/colors động)
  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    isLast = false,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <>
      <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowLeft}>
          <View style={styles.rowIconWrap}>
            <Icon type="ionicon" name={icon} size={17} color={colors.primaryDark} />
          </View>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
          <Icon type="ionicon" name="chevron-forward" size={15} color={colors.muted} />
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );

  const ToggleRow = ({
    icon,
    label,
    value,
    onToggle,
    isLast = false,
  }: {
    icon: string;
    label: string;
    value: boolean;
    onToggle: () => void;
    isLast?: boolean;
  }) => (
    <>
      <View style={styles.settingRow}>
        <View style={styles.rowLeft}>
          <View style={styles.rowIconWrap}>
            <Icon type="ionicon" name={icon} size={17} color={colors.primaryDark} />
          </View>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryBorder }}
          thumbColor={value ? colors.primary : '#fff'}
          ios_backgroundColor={colors.border}
        />
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.setting.title}</Text>
      </View>

      {/* ── CHUNG ── */}
      <Text style={styles.sectionLabel}>{t.setting.sectionGeneral}</Text>
      <View style={styles.card}>
        <SettingRow
          icon="language-outline"
          label={t.setting.language}
          value={currentLangLabel}
          onPress={() => setLangModal(true)}
        />
        <SettingRow
          icon="color-palette-outline"
          label={t.setting.appearance}
          value={currentThemeLabel}
          onPress={() => setThemeModal(true)}
        />
        <ToggleRow
          icon="notifications-outline"
          label={t.setting.notification}
          value={notification}
          onToggle={() => setNotification(v => !v)}
          isLast
        />
      </View>

      {/* ── TÀI KHOẢN ── */}
      <Text style={styles.sectionLabel}>{t.setting.sectionAccount}</Text>
      <View style={styles.card}>
        <SettingRow
          icon="person-outline"
          label={t.setting.profileInfo}
          onPress={() => (navigation as any).navigate('EditProfileScreen')}
        />
        <SettingRow
          icon="lock-closed-outline"
          label={t.setting.security}
          onPress={() => (navigation as any).navigate('SecurityScreen')}
        />
        <SettingRow
          icon="shield-checkmark-outline"
          label={t.setting.twoFactor}
          onPress={() => setToast(t.common.demoFeature)}
          isLast
        />
      </View>

      {/* ── KHÁC ── */}
      <Text style={styles.sectionLabel}>{t.setting.sectionOther}</Text>
      <View style={styles.card}>
        <SettingRow
          icon="document-text-outline"
          label={t.setting.terms}
          onPress={() => (navigation as any).navigate('TermsScreen')}
        />
        <SettingRow
          icon="help-circle-outline"
          label={t.setting.support}
          onPress={() =>
            // Simulator/máy không có app Mail → fallback hiện email
            Linking.openURL('mailto:Kyonguyen00775@gmail.com').catch(() =>
              setToast('Email: Kyonguyen00775@gmail.com'),
            )
          }
        />
        <SettingRow
          icon="information-circle-outline"
          label={t.setting.about}
          onPress={() => (navigation as any).navigate('AboutScreen')}
          isLast
        />
      </View>

      <Text style={styles.version}>{t.setting.version}</Text>

      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone="default"
        duration={1800}
      />

      {/* ── Language bottom sheet ── */}
      <Modal
        visible={langModal}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLangModal(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{t.setting.chooseLanguage}</Text>
            <Text style={styles.sheetSub}>{t.setting.langDesc}</Text>

            <View style={styles.optionList}>
              {LANG_OPTIONS.map(opt => {
                const selected = lang === opt.code;
                return (
                  <TouchableOpacity
                    key={opt.code}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    activeOpacity={0.75}
                    onPress={() => {
                      setLang(opt.code);
                      setLangModal(false);
                    }}>
                    <Text style={styles.langFlag}>{opt.flag}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionSub}>{opt.sublabel}</Text>
                    </View>
                    {selected ? (
                      <View style={styles.checkCircle}>
                        <Icon type="ionicon" name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.uncheckCircle} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLangModal(false)}
              activeOpacity={0.8}>
              <Text style={styles.cancelText}>{t.setting.cancel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Theme bottom sheet ── */}
      <Modal
        visible={themeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setThemeModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setThemeModal(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{t.setting.chooseTheme}</Text>
            <Text style={styles.sheetSub}>{t.setting.themeDesc}</Text>

            <View style={styles.optionList}>
              {THEME_OPTIONS.map(opt => {
                const selected = mode === opt.code;
                return (
                  <TouchableOpacity
                    key={opt.code}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    activeOpacity={0.75}
                    onPress={() => {
                      setMode(opt.code);
                      setThemeModal(false);
                    }}>
                    <View style={styles.themeIconWrap}>
                      <Icon
                        type="ionicon"
                        name={opt.icon}
                        size={18}
                        color={selected ? colors.primaryDark : colors.subtext}
                      />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                      {opt.sub ? <Text style={styles.optionSub}>{opt.sub}</Text> : null}
                    </View>
                    {selected ? (
                      <View style={styles.checkCircle}>
                        <Icon type="ionicon" name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.uncheckCircle} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setThemeModal(false)}
              activeOpacity={0.8}>
              <Text style={styles.cancelText}>{t.setting.cancel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: c.text },

    sectionLabel: {
      fontSize: 11,
      color: c.hint,
      letterSpacing: 0.6,
      fontWeight: '500',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 8,
    },
    card: {
      backgroundColor: c.white,
      borderRadius: 14,
      marginHorizontal: 16,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: c.border,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { fontSize: 14, color: c.text },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rowValue: { fontSize: 13, color: c.hint },
    rowDivider: { height: 0.5, backgroundColor: c.divider, marginLeft: 60 },

    version: { textAlign: 'center', fontSize: 12, color: c.muted, marginTop: 32 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    bottomSheet: {
      backgroundColor: c.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 36,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: c.text, textAlign: 'center' },
    sheetSub: { fontSize: 12, color: c.hint, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    optionList: { gap: 10, marginBottom: 16 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.border,
      gap: 12,
      backgroundColor: c.bg,
    },
    optionRowSelected: { borderColor: c.primary, backgroundColor: c.primaryLight },
    langFlag: { fontSize: 28 },
    themeIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionInfo: { flex: 1 },
    optionLabel: { fontSize: 15, fontWeight: '500', color: c.text },
    optionLabelSelected: { color: c.primaryDark },
    optionSub: { fontSize: 12, color: c.hint, marginTop: 2 },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uncheckCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    cancelBtn: {
      backgroundColor: c.bg,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    cancelText: { fontSize: 15, fontWeight: '500', color: c.subtext },
  });
