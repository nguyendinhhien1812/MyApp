import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Text, Icon, Avatar } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import Chatbot from '../../components/Chatbot';
import { useLanguage } from '../../context/LanguageContext';
import { SKILLS, LEVEL_BADGE } from '../Skills/data';

const PRIMARY = '#E89951';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';
const PRIMARY_DARK = '#b36a1a';

const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

const listContact = [
  {
    id: 1,
    name: 'Facebook',
    imgIcon: 'https://i.pinimg.com/736x/07/f9/70/07f970236edf44d5b8021a1dbb241982.jpg',
    bgColor: '#e8f4fd',
    url: 'https://www.facebook.com/hien.nguyen.433703/',
  },
  {
    id: 2,
    name: 'GitHub',
    imgIcon: 'https://i.pinimg.com/736x/cf/5f/7d/cf5f7dca8d30d52a39f4043f3796d7f0.jpg',
    bgColor: '#f0eeff',
    url: 'https://github.com/nguyendinhhien1812',
  },
  {
    id: 3,
    name: 'Gmail',
    imgIcon: 'https://i.pinimg.com/736x/71/0b/a5/710ba5f8773d6e2487301210099f4ee6.jpg',
    bgColor: '#fff4e8',
    url: 'https://mail.google.com/mail/u/0/#inbox',
  },
  {
    id: 4,
    name: 'LinkedIn',
    imgIcon: 'https://i.pinimg.com/736x/a9/a6/fe/a9a6fe76b8a2ac0aae7617b729c7d975.jpg',
    bgColor: '#e8f8f1',
    url: 'https://www.linkedin.com/in/hi%E1%BA%BFn-nguy%E1%BB%85n-271b8a2ab/',
  },
];

// Top 4 kỹ năng nổi bật từ CV — full list ở mini-app Kỹ năng (SkillsScreen)
const topSkills = SKILLS.slice(0, 4);

// quickActions labels are built inside component using t

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const quickActions = [
    { id: 1, label: t.home.bank,    icon: 'business',    screen: 'BankScreen' },
    { id: 2, label: t.home.invest,  icon: 'trending-up', screen: 'InvestmentScreen' },
    { id: 3, label: t.home.expense, icon: 'calculator',  screen: 'ExpenseScreen' },
  ];

  const levelLabels = {
    expert: t.skills.levelExpert,
    proficient: t.skills.levelProficient,
    good: t.skills.levelGood,
    learning: t.skills.levelLearning,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Avatar
              source={{ uri: AVATAR_URL }}
              containerStyle={styles.avatar}
              avatarStyle={styles.avatarImg}
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{t.home.greeting} 👋</Text>
              <Text style={styles.username}>Nguyễn Đình Hiến</Text>
            </View>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate('Notification' as never)}>
              <Icon name="notifications-outline" type="ionicon" size={20} color="#2a1500" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t.home.overview}</Text>
          <Text style={styles.heroDesc}>{t.home.desc}</Text>
          <View style={styles.quickActions}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.qaBtn}
                onPress={() => navigation.navigate(action.screen as never)}
              >
                <Icon name={action.icon} type="ionicon" size={22} color={PRIMARY_DARK} />
                <Text style={styles.qaLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Thông tin liên lạc */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title={t.home.contact} />
            <TouchableOpacity
              onPress={() =>
                (navigation as any).navigate('BankScreen', { screen: 'AllContacts' })
              }>
              <Text style={styles.seeAll}>{t.home.viewAll}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.iconGrid}>
              {listContact.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.iconItem}
                  onPress={() =>
                    navigation.navigate('WebViewScreen' as never, {
                      url: item.url,
                      title: item.name,
                    } as never)
                  }
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                    <Image source={{ uri: item.imgIcon }} style={styles.iconImg} />
                  </View>
                  <Text style={styles.iconLabel}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Kỹ năng cá nhân */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title={t.home.skills} />
            <TouchableOpacity onPress={() => navigation.navigate('SkillsScreen' as never)}>
              <Text style={styles.seeAll}>{t.home.viewAll}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {topSkills.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.skillRow,
                  index < topSkills.length - 1 && styles.skillRowBorder,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  (navigation as any).navigate('SkillsScreen', {
                    screen: 'SkillDetail',
                    params: { skillId: item.id },
                  })
                }
              >
                <View style={[styles.skillIconWrap, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} type="ionicon" size={20} color={item.iconColor} />
                </View>
                <View style={styles.skillInfo}>
                  <View style={styles.skillTopRow}>
                    <Text style={styles.skillName}>{item.name}</Text>
                    <View style={[styles.skillBadge, { backgroundColor: LEVEL_BADGE[item.level].bg }]}>
                      <Text style={[styles.skillBadgeText, { color: LEVEL_BADGE[item.level].color }]}>
                        {levelLabels[item.level]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.skillSub}>{item.keywords}</Text>
                  <ProgressBar
                    progress={item.percent / 100}
                    color={PRIMARY}
                    style={styles.skillProgress}
                  />
                </View>
                <Icon name="chevron-forward" type="ionicon" size={16} color="#bbb" />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 52,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarImg: {
    borderRadius: 22,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 11,
    color: '#7a4a10',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2a1500',
    marginTop: 2,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: -36,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroLabel: {
    fontSize: 11,
    color: '#999',
  },
  heroDesc: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  qaBtn: {
    flex: 1,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
  },
  qaLabel: {
    fontSize: 10,
    color: PRIMARY_DARK,
    fontWeight: '500',
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
  },

  // Icon grid (liên lạc)
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  iconImg: {
    width: '100%',
    height: '100%',
  },
  iconLabel: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
  },

  // Skill list
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  skillRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  skillIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  skillName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
    flexShrink: 1,
  },
  skillBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  skillBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  skillSub: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  skillProgress: {
    height: 4,
    borderRadius: 2,
    marginTop: 5,
  },
});
