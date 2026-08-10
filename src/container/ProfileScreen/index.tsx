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
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { AppDialog } from '../../components/UI';

// Tên riêng — không dịch
const USER_NAME = 'Nguyễn Đình Hiến';

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
          <View style={[styles.rowIconWrap, { backgroundColor: danger ? 'rgba(192,57,43,0.12)' : colors.accent100 }]}>
            <Icon
              type="ionicon"
              name={icon}
              size={17}
              color={danger ? colors.danger : colors.accent700}
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

      {/* Hero tối */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.nameText}>{USER_NAME}</Text>
            <Text style={styles.roleText}>{t.profile.role}</Text>
            <Text style={styles.emailText}>Kyonguyen00775@gmail.com</Text>
          </View>
        </View>
        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={styles.heroBtnPrimary}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('EditProfileScreen')}>
            <Icon type="ionicon" name="create-outline" size={16} color={colors.heroDark} />
            <Text style={styles.heroBtnPrimaryText}>{t.profile.editProfile}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnGhost}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('SecurityScreen')}>
            <Icon type="ionicon" name="shield-checkmark-outline" size={16} color={colors.offWhite} />
            <Text style={styles.heroBtnGhostText}>{t.profile.security}</Text>
          </TouchableOpacity>
        </View>
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
          iconColor={colors.accent700}
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
            <Icon type="ionicon" name="layers-outline" size={20} color={colors.accent700} />
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

  header: { paddingHorizontal: SPACING.screenX, paddingTop: SPACING.s4, paddingBottom: SPACING.s2 },
  headerTitle: { fontFamily: FONT.bold, fontSize: 26, color: c.text },

  // Hero tối
  heroCard: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s2,
    padding: SPACING.s4,
    gap: SPACING.s4,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: c.accent,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: c.heroDark,
  },
  nameBlock: { flex: 1 },
  nameText: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.offWhite },
  roleText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent300, marginTop: 3 },
  emailText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: 'rgba(253,252,251,0.6)', marginTop: 3 },

  heroBtnRow: { flexDirection: 'row', gap: SPACING.s2 },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: c.offWhite,
    borderRadius: RADII.item,
    paddingVertical: 11,
  },
  heroBtnPrimaryText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.heroDark },
  heroBtnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADII.item,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(253,252,251,0.45)',
  },
  heroBtnGhostText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.offWhite },

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
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s3 },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADII.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.text },
  rowLabelDanger: { fontFamily: FONT.medium, color: c.danger },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginLeft: 60 },

  scrollContent: { paddingBottom: 120 },

  // About card
  aboutCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s4,
    padding: SPACING.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s3, flex: 1 },
  aboutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADII.item,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutInfo: { flex: 1 },
  aboutTitle: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  aboutTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  aboutTag: {
    backgroundColor: c.accent100,
    borderRadius: RADII.chip,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aboutTagText: { fontFamily: FONT.medium, fontSize: 9, color: c.accent700 },
});
