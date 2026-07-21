import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { AppDialog } from '../../components/UI';

const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

// ─── Screen ──────────────────────────────────────────────────────────────────

const TECH_TAGS = ['React Native', 'TypeScript', 'i18n', 'SVG', 'Real API'];

const ProfileScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [logoutModal, setLogoutModal] = useState(false);

  // ─── Row component (inner: đóng trên styles + colors) ──────────────────────
  const ProfileRow = ({
    icon,
    label,
    value,
    iconBg,
    iconColor,
    isLast = false,
    danger = false,
    onPress,
  }: {
    icon: string;
    label: string;
    value?: string;
    iconBg?: string;
    iconColor?: string;
    isLast?: boolean;
    danger?: boolean;
    onPress?: () => void;
  }) => (
    <>
      <TouchableOpacity style={styles.profileRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowLeft}>
          <View style={[styles.rowIconWrap, { backgroundColor: iconBg ?? colors.primaryLight }]}>
            <Icon
              type="ionicon"
              name={icon}
              size={17}
              color={danger ? '#ef4444' : (iconColor ?? colors.primaryDark)}
            />
          </View>
          <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        </View>
        {!danger && (
          <View style={styles.rowRight}>
            {value ? <Text style={styles.rowValue}>{value}</Text> : null}
            <Icon type="ionicon" name="chevron-forward" size={15} color={colors.muted} />
          </View>
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

      {/* Avatar + Name card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.nameText}>Nguyễn Đình Hiến</Text>
          <Text style={styles.roleText}>{t.profile.role}</Text>
          <Text style={styles.emailText}>Kyonguyen00775@gmail.com</Text>
          <View style={styles.levelBadge}>
            <Icon type="ionicon" name="star" size={11} color={colors.primaryDark} />
            <Text style={styles.levelText}>{t.profile.level}: {t.profile.levelValue}</Text>
          </View>
          <Text style={styles.memberText}>{t.profile.member} 02/2021</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => (navigation as any).navigate('EditProfileScreen')}>
          <Icon type="ionicon" name="create-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.editText}>{t.profile.editProfile}</Text>
        </TouchableOpacity>
      </View>

      {/* ── HOẠT ĐỘNG ── */}
      <Text style={styles.sectionLabel}>{t.profile.sectionActivity}</Text>
      <View style={styles.card}>
        <ProfileRow
          icon="time-outline"
          label={t.profile.history}
          iconBg="#e8f0f8"
          iconColor="#1a4a7a"
          onPress={() => navigation.navigate('Notification' as never)}
        />
        <ProfileRow
          icon="card-outline"
          label={t.profile.personalAccount}
          iconBg="#e8f8f0"
          iconColor="#1a7a40"
          onPress={() => navigation.navigate('BankScreen' as never)}
          isLast
        />
      </View>

      {/* ── TÀI KHOẢN ── */}
      <Text style={styles.sectionLabel}>{t.profile.sectionAccount}</Text>
      <View style={styles.card}>
        <ProfileRow
          icon="shield-checkmark-outline"
          label={t.profile.security}
          iconBg="#fff4e8"
          iconColor={colors.primaryDark}
          onPress={() => (navigation as any).navigate('SecurityScreen')}
        />
        <ProfileRow
          icon="document-text-outline"
          label={t.profile.terms}
          iconBg="#f5f0ff"
          iconColor="#6c3fc4"
          onPress={() => (navigation as any).navigate('TermsScreen')}
          isLast
        />
      </View>

      {/* ── VỀ ỨNG DỤNG ── */}
      <TouchableOpacity
        style={styles.aboutCard}
        activeOpacity={0.85}
        onPress={() => (navigation as any).navigate('AboutScreen')}>
        <View style={styles.aboutLeft}>
          <View style={styles.aboutIconWrap}>
            <Icon type="ionicon" name="layers-outline" size={20} color={colors.primaryDark} />
          </View>
          <View style={styles.aboutInfo}>
            <Text style={styles.aboutTitle}>{t.profile.aboutApp}</Text>
            <View style={styles.aboutTagRow}>
              {TECH_TAGS.map(tag => (
                <View key={tag} style={styles.aboutTag}>
                  <Text style={styles.aboutTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Icon type="ionicon" name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>

      {/* ── Đăng xuất ── */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <ProfileRow
          icon="exit-outline"
          label={t.profile.logout}
          danger
          isLast
          onPress={() => setLogoutModal(true)}
        />
      </View>

      </ScrollView>

      {/* Logout confirm dialog */}
      <AppDialog
        visible={logoutModal}
        onDismiss={() => setLogoutModal(false)}
        icon="exit-outline"
        tone="danger"
        title={t.profile.logout}
        description={t.profile.logoutConfirm}
        cancelText={t.setting.cancel}
        confirmText={t.profile.logout}
        onConfirm={() => {
          setLogoutModal(false);
          navigation.navigate('LoginScreen' as never);
        }}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: c.text },

  // Avatar card
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 16,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    gap: 14,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: c.primaryBorder,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a7a40',
    borderWidth: 2,
    borderColor: c.white,
  },
  nameBlock: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '600', color: c.text },
  roleText: { fontSize: 11, color: c.primaryDark, fontWeight: '500', marginTop: 2 },
  emailText: { fontSize: 12, color: c.hint, marginTop: 2 },
  memberText: { fontSize: 10, color: c.muted, marginTop: 5 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  levelText: { fontSize: 10, color: c.primaryDark, fontWeight: '500' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
  },
  editText: { fontSize: 11, color: c.primaryDark, fontWeight: '500' },

  sectionLabel: {
    fontSize: 11,
    color: c.hint,
    letterSpacing: 0.6,
    fontWeight: '500',
    marginHorizontal: 20,
    marginTop: 18,
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
  profileRow: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, color: c.text },
  rowLabelDanger: { color: '#ef4444', fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, color: c.hint },
  rowDivider: { height: 0.5, backgroundColor: c.divider, marginLeft: 60 },

  scrollContent: { paddingBottom: 32 },

  // About card
  aboutCard: {
    backgroundColor: c.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
  },
  aboutLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aboutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: c.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutInfo: { flex: 1 },
  aboutTitle: { fontSize: 14, fontWeight: '500', color: c.text },
  aboutTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  aboutTag: {
    backgroundColor: c.divider,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aboutTagText: { fontSize: 9, color: c.subtext, fontWeight: '500' },
});
