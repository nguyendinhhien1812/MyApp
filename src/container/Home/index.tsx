import React, { useMemo } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import Chatbot from '../../components/Chatbot';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { SKILLS, GITHUB_URL } from '../Skills/data';

const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

// Tên riêng — không dịch
const USER_NAME = 'Nguyễn Đình Hiến';

const LINKEDIN_URL =
  'https://www.linkedin.com/in/hi%E1%BA%BFn-nguy%E1%BB%85n-271b8a2ab/';
const GMAIL_URL = 'https://mail.google.com/mail/u/0/#inbox';

const topSkills = SKILLS.slice(0, 4);

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ─── Dữ liệu màn — build trong component để lấy được `t` (guide mục 7.2) ──
  const STATS = [
    { id: 'exp', value: '5', label: t.home.statYears },
    { id: 'prj', value: '6', label: t.home.statProjects },
    { id: 'app', value: '10+', label: t.home.statMiniApps },
  ];

  // Mini-app trong hồ sơ. AI là Chatbot nổi (screen === null → mở trợ lý nổi).
  const MINI_APPS: { id: number; name: string; tagline: string; icon: string; screen: string | null }[] = [
    { id: 1, name: t.home.bank,    tagline: t.home.bankDesc,    icon: 'bank',        screen: 'BankScreen' },
    { id: 2, name: t.home.invest,  tagline: t.home.investDesc,  icon: 'graph-up',    screen: 'InvestmentScreen' },
    { id: 3, name: t.home.expense, tagline: t.home.expenseDesc, icon: 'calculator',  screen: 'ExpenseScreen' },
    { id: 4, name: t.home.aiChat,  tagline: t.home.aiChatDesc,  icon: 'chat-bubble', screen: null },
  ];

  const CONTACTS = [
    { id: 1, name: 'Gmail', url: GMAIL_URL },
    { id: 2, name: 'GitHub', url: GITHUB_URL },
    { id: 3, name: 'LinkedIn', url: LINKEDIN_URL },
    { id: 4, name: t.home.phone, url: 'tel:+84000000000' },
  ];

  const openUrl = (url: string, title: string) =>
    navigation.navigate('WebViewScreen', { url, title });

  const SectionHeader = ({ title, onPress }: { title: string; onPress?: () => void }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>{t.home.viewAll}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{t.home.greeting} 👋</Text>
            <Text style={styles.username}>{USER_NAME}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notification')}
          >
            <Icon type={ICON_TYPE.Iconoir} name="bell" size={20} color={colors.accent700} />
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t.home.role}</Text>
          <Text style={styles.heroDesc}>{t.home.heroDesc}</Text>
          <View style={styles.heroBtnRow}>
            <TouchableOpacity
              style={styles.heroBtnPrimary}
              onPress={() => openUrl(GITHUB_URL, 'CV')}
            >
              <Icon type={ICON_TYPE.Iconoir} name="download" size={16} color={colors.heroCopper} />
              <Text style={styles.heroBtnPrimaryText}>{t.home.downloadCv}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtnGhost}
              onPress={() => openUrl(GITHUB_URL, 'GitHub')}
            >
              <Icon type={ICON_TYPE.Iconoir} name="github" size={16} color={colors.offWhite} />
              <Text style={styles.heroBtnGhostText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dải số liệu */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.id} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Kỹ năng nổi bật — carousel */}
        <View style={styles.section}>
          <SectionHeader title={t.home.topSkills} onPress={() => navigation.navigate('SkillsScreen')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {topSkills.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.skillCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('SkillsScreen', {
                    screen: 'SkillDetail',
                    params: { skillId: item.id },
                  })
                }
              >
                <View style={styles.skillPct}>
                  <Text style={styles.skillPctText}>{item.percent}%</Text>
                </View>
                <Text style={styles.skillName}>{item.name}</Text>
                <Text style={styles.skillKeywords}>{item.keywords}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mini-app trong hồ sơ */}
        <View style={styles.section}>
          <SectionHeader title={t.home.miniApps} />
          <View style={styles.miniList}>
            {MINI_APPS.map(app => (
              <TouchableOpacity
                key={app.id}
                style={styles.miniRow}
                activeOpacity={0.85}
                onPress={() => app.screen && navigation.navigate(app.screen)}
              >
                <View style={styles.miniNum}>
                  <Icon type={ICON_TYPE.Iconoir} name={app.icon} size={20} color={colors.accent700} />
                </View>
                <View style={styles.miniInfo}>
                  <Text style={styles.miniName}>{app.name}</Text>
                  <Text style={styles.miniTagline} numberOfLines={1}>{app.tagline}</Text>
                </View>
                <Icon type={ICON_TYPE.Iconoir} name="nav-arrow-right" size={18} color={colors.accent700} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Liên hệ */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={styles.sectionTitle}>{t.home.contact}</Text>
          <View style={styles.pillWrap}>
            {CONTACTS.map(c => (
              <TouchableOpacity key={c.id} style={styles.pill} onPress={() => openUrl(c.url, c.name)}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Chatbot />
    </SafeAreaView>
  );
};

export default HomeScreen;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.bg },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s3,
      paddingHorizontal: SPACING.screenX,
      paddingTop: SPACING.s4,
      paddingBottom: SPACING.s3,
    },
    avatar: { width: 50, height: 50, borderRadius: RADII.pill },
    headerText: { flex: 1 },
    greeting: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },
    username: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text, marginTop: 2 },
    bellBtn: {
      width: 38,
      height: 38,
      borderRadius: RADII.pill,
      backgroundColor: c.accent100,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Hero
    heroCard: {
      backgroundColor: c.heroCopper,
      borderRadius: RADII.card,
      marginHorizontal: SPACING.screenX,
      marginTop: SPACING.s2,
      padding: SPACING.s4,
      gap: SPACING.s3,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    heroTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, lineHeight: 24, color: c.offWhite },
    heroDesc: {
      fontFamily: FONT.regular,
      fontSize: TYPE.body,
      lineHeight: 21,
      color: 'rgba(253,252,251,0.82)',
    },
    heroBtnRow: { flexDirection: 'row', gap: SPACING.s2, marginTop: 2 },
    heroBtnPrimary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.s2,
      paddingVertical: 11,
      backgroundColor: c.offWhite,
      borderRadius: RADII.item,
    },
    heroBtnPrimaryText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.heroCopper },
    heroBtnGhost: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.s2,
      paddingVertical: 11,
      borderRadius: RADII.item,
      borderWidth: 1,
      borderColor: 'rgba(253,252,251,0.45)',
    },
    heroBtnGhostText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.offWhite },

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: SPACING.s2,
      paddingHorizontal: SPACING.screenX,
      marginTop: SPACING.s4,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: SPACING.s3,
      paddingHorizontal: SPACING.s2,
      backgroundColor: c.white,
      borderRadius: RADII.card,
    },
    statValue: { fontFamily: FONT.semibold, fontSize: TYPE.display, lineHeight: 26, color: c.accent700 },
    statLabel: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      lineHeight: 15,
      textAlign: 'center',
      color: c.subtext,
    },

    // Section chung
    section: { marginTop: SPACING.s6, paddingHorizontal: SPACING.screenX },
    sectionLast: { paddingBottom: SPACING.s6 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.s3,
    },
    sectionTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
    seeAll: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.accent700 },

    // Kỹ năng carousel
    carousel: { gap: SPACING.s3, paddingRight: SPACING.screenX },
    skillCard: {
      width: 132,
      backgroundColor: c.white,
      borderRadius: RADII.card,
      padding: SPACING.s3,
      gap: SPACING.s2,
    },
    skillPct: {
      width: 34,
      height: 34,
      borderRadius: RADII.pill,
      backgroundColor: c.accent100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skillPctText: { fontFamily: FONT.bold, fontSize: TYPE.body, color: c.accent700 },
    skillName: { fontFamily: FONT.semibold, fontSize: TYPE.body, lineHeight: 17, color: c.text },
    skillKeywords: { fontFamily: FONT.regular, fontSize: TYPE.caption, lineHeight: 16, color: c.subtext },

    // Mini-app list
    miniList: { gap: SPACING.s2 },
    miniRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s3,
      backgroundColor: c.white,
      borderRadius: RADII.card,
      padding: SPACING.s3,
    },
    miniNum: {
      width: 44,
      height: 44,
      borderRadius: RADII.item,
      backgroundColor: c.accent100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniInfo: { flex: 1, gap: 2 },
    miniName: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.text },
    miniTagline: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },

    // Liên hệ pills
    pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s2 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.white,
      borderRadius: RADII.pill,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    pillDot: { width: 5, height: 5, borderRadius: RADII.pill, backgroundColor: c.accent },
    pillText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.text },
  });
