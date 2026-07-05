// ─── 1. Imports ────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { ProgressBar } from 'react-native-paper';
import { AppButton } from '../../../components/UI';
import { BRAND } from '../../../theme/paperTheme';
import { useLanguage } from '../../../context/LanguageContext';
import { getSkillById, LEVEL_BADGE, GITHUB_URL } from '../data';

// ─── 2. Types ──────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
  route: any;
}

// ─── 3. Sub-components ─────────────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

// ─── 4. Main screen component ──────────────────────────────────────────────
const SkillDetail = ({ navigation, route }: Props) => {
  const { t, lang } = useLanguage();
  const skillId = (route.params as any)?.skillId ?? '';
  const skill = getSkillById(skillId);

  if (!skill) {
    navigation.goBack();
    return null;
  }

  const levelLabel = {
    expert: t.skills.levelExpert,
    proficient: t.skills.levelProficient,
    good: t.skills.levelGood,
    learning: t.skills.levelLearning,
  }[skill.level];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header cam */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{skill.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { backgroundColor: skill.iconBg }]}>
            <Icon type="ionicon" name={skill.icon} size={30} color={skill.iconColor} />
          </View>
          <Text style={styles.heroName}>{skill.name}</Text>
          <View style={[styles.levelBadge, { backgroundColor: LEVEL_BADGE[skill.level].bg }]}>
            <Text style={[styles.levelText, { color: LEVEL_BADGE[skill.level].color }]}>
              {levelLabel} · {skill.percent}%
            </Text>
          </View>
          <ProgressBar
            progress={skill.percent / 100}
            color={BRAND.primary}
            style={styles.heroProgress}
          />
          <Text style={styles.heroSub}>
            {skill.years} {t.skills.yearsExp} · {skill.keywords}
          </Text>
        </View>

        {/* Kinh nghiệm nổi bật */}
        <SectionTitle title={t.skills.sectionHighlights} />
        <View style={styles.card}>
          {skill.highlights[lang].map((hl, i) => (
            <View
              key={i}
              style={[styles.hlRow, i < skill.highlights[lang].length - 1 && styles.rowBorder]}>
              <View style={styles.hlDot}>
                <Icon type="ionicon" name="checkmark" size={12} color={BRAND.success} />
              </View>
              <Text style={styles.hlText}>{hl}</Text>
            </View>
          ))}
        </View>

        {/* Dự án đã dùng */}
        <SectionTitle title={t.skills.sectionProjects} />
        <View style={styles.card}>
          {skill.projects.map((prj, i) => (
            <View
              key={prj.name}
              style={[styles.prjRow, i < skill.projects.length - 1 && styles.rowBorder]}>
              <View style={[styles.prjIconWrap, { backgroundColor: prj.iconBg }]}>
                <Icon type="ionicon" name={prj.icon} size={16} color={prj.iconColor} />
              </View>
              <View style={styles.prjInfo}>
                <Text style={styles.prjName}>{prj.name}</Text>
                <Text style={styles.prjTech}>{prj.tech}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* GitHub */}
        <AppButton
          title={t.skills.viewGithub}
          icon="github"
          onPress={() =>
            navigation.navigate('WebViewScreen', { url: GITHUB_URL, title: 'GitHub' })
          }
          style={styles.githubBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SkillDetail;

// ─── 5. Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // 1. Container chính
  safe: { flex: 1, backgroundColor: BRAND.bg },

  // 2. Header
  header: {
    backgroundColor: BRAND.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // 3. Scroll
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },

  // 4. Hero card
  heroCard: {
    backgroundColor: BRAND.white,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: BRAND.primaryBorder,
    padding: 20,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: { fontSize: 17, fontWeight: '600', color: BRAND.text, marginTop: 10 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  levelText: { fontSize: 11, fontWeight: '500' },
  heroProgress: {
    height: 6,
    borderRadius: 3,
    alignSelf: 'stretch',
    marginTop: 14,
  },
  heroSub: { fontSize: 11, color: BRAND.subtext, marginTop: 8, textAlign: 'center' },

  // 5. Section title
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  accentBar: { width: 4, height: 18, backgroundColor: BRAND.primary, borderRadius: 2 },
  sectionTitleText: { fontSize: 15, fontWeight: '500', color: BRAND.text },

  // 6. Cards & rows
  card: {
    backgroundColor: BRAND.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: BRAND.divider },
  hlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  hlDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e8f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  hlText: { flex: 1, fontSize: 13, color: BRAND.text, lineHeight: 19 },
  prjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  prjIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prjInfo: { flex: 1 },
  prjName: { fontSize: 13, color: BRAND.text },
  prjTech: { fontSize: 10, color: BRAND.hint, marginTop: 1 },

  // 7. Bottom CTA
  githubBtn: { marginTop: 4 },
});
