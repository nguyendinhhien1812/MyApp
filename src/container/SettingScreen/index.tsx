import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../context/LanguageContext';
import { Lang } from '../../i18n/translations';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

const LANG_OPTIONS: { code: Lang; label: string; flag: string; sublabel: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', sublabel: 'Vietnamese' },
  { code: 'en', label: 'English',    flag: '🇬🇧', sublabel: 'Tiếng Anh' },
];

// ─── Reusable rows ────────────────────────────────────────────────────────────

const SettingRow = ({
  icon, label, value, onPress, isLast = false,
}: {
  icon: string; label: string; value?: string; onPress?: () => void; isLast?: boolean;
}) => (
  <>
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Icon type="ionicon" name={icon} size={17} color={PRIMARY_DARK} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Icon type="ionicon" name="chevron-forward" size={15} color="#ccc" />
      </View>
    </TouchableOpacity>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

const ToggleRow = ({
  icon, label, value, onToggle, isLast = false,
}: {
  icon: string; label: string; value: boolean; onToggle: () => void; isLast?: boolean;
}) => (
  <>
    <View style={styles.settingRow}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Icon type="ionicon" name={icon} size={17} color={PRIMARY_DARK} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e0e0e0', true: PRIMARY_BORDER }}
        thumbColor={value ? PRIMARY : '#fff'}
        ios_backgroundColor="#e0e0e0"
      />
    </View>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

const SettingScreen = () => {
  const { lang, t, setLang } = useLanguage();
  const [notification, setNotification] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [langModal, setLangModal] = useState(false);

  const currentLangLabel = LANG_OPTIONS.find(o => o.code === lang)?.label ?? '';

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
        <ToggleRow
          icon="notifications-outline"
          label={t.setting.notification}
          value={notification}
          onToggle={() => setNotification(v => !v)}
        />
        <ToggleRow
          icon="moon-outline"
          label={t.setting.darkMode}
          value={darkMode}
          onToggle={() => setDarkMode(v => !v)}
          isLast
        />
      </View>

      {/* ── TÀI KHOẢN ── */}
      <Text style={styles.sectionLabel}>{t.setting.sectionAccount}</Text>
      <View style={styles.card}>
        <SettingRow icon="person-outline"          label={t.setting.profileInfo} />
        <SettingRow icon="lock-closed-outline"     label={t.setting.security} />
        <SettingRow icon="shield-checkmark-outline" label={t.setting.twoFactor} isLast />
      </View>

      {/* ── KHÁC ── */}
      <Text style={styles.sectionLabel}>{t.setting.sectionOther}</Text>
      <View style={styles.card}>
        <SettingRow icon="document-text-outline" label={t.setting.terms} />
        <SettingRow icon="help-circle-outline"   label={t.setting.support} isLast />
      </View>

      <Text style={styles.version}>{t.setting.version}</Text>

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

            <View style={styles.langList}>
              {LANG_OPTIONS.map(opt => {
                const selected = lang === opt.code;
                return (
                  <TouchableOpacity
                    key={opt.code}
                    style={[styles.langRow, selected && styles.langRowSelected]}
                    activeOpacity={0.75}
                    onPress={() => {
                      setLang(opt.code);   // ← thay đổi ngôn ngữ toàn app
                      setLangModal(false);
                    }}>
                    <Text style={styles.langFlag}>{opt.flag}</Text>
                    <View style={styles.langInfo}>
                      <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.langSub}>{opt.sublabel}</Text>
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
    </SafeAreaView>
  );
};

export default SettingScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },

  sectionLabel: {
    fontSize: 11, color: '#aaa', letterSpacing: 0.6, fontWeight: '500',
    marginHorizontal: 20, marginTop: 20, marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16,
    overflow: 'hidden', borderWidth: 0.5, borderColor: '#e8e8e8',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, color: '#1a1a1a' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, color: '#aaa' },
  rowDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginLeft: 60 },

  version: { textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 32 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 36, paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0',
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },
  sheetSub: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  langList: { gap: 10, marginBottom: 16 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#f0f0f0', gap: 12, backgroundColor: '#fafafa',
  },
  langRowSelected: { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  langFlag: { fontSize: 28 },
  langInfo: { flex: 1 },
  langLabel: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  langLabelSelected: { color: PRIMARY_DARK },
  langSub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  uncheckCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#ddd' },
  cancelBtn: {
    backgroundColor: '#F2F2F7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  cancelText: { fontSize: 15, fontWeight: '500', color: '#888' },
});
