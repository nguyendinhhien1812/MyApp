// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { AppButton } from '../../../components/UI';
import SubHeader from '../../../components/UI/SubHeader';
import { ThemeColors } from '../../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../../theme/tokens';
import { useThemeColors } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getSkillById, LEVEL_BADGE, GITHUB_URL } from '../data';

// ─── 2. Types ──────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
  route: any;
}

// ─── 3. Sub-components ─────────────────────────────────────────────────────
const SectionTitle = ({
  title,
  styles,
}: {
  title: string;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

// ─── 4. Main screen component ──────────────────────────────────────────────
const SkillDetail = ({ navigation, route }: Props) => {
  const { t, lang } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
      <SubHeader title={skill.name} onBack={() => navigation.goBack()} />

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
          <View style={styles.heroProgress}>
            <View style={[styles.heroProgressFill, { width: `${skill.percent}%` }]} />
          </View>
          <Text style={styles.heroSub}>
            {skill.years} {t.skills.yearsExp} · {skill.keywords}
          </Text>
        </View>

        {/* Kinh nghiệm nổi bật */}
        <SectionTitle title={t.skills.sectionHighlights} styles={styles} />
        <View style={styles.card}>
          {skill.highlights[lang].map((hl, i) => (
            <View
              key={i}
              style={[styles.hlRow, i < skill.highlights[lang].length - 1 && styles.rowBorder]}>
              <View style={styles.hlDot}>
                <Icon type="ionicon" name="checkmark" size={12} color={colors.success} />
              </View>
              <Text style={styles.hlText}>{hl}</Text>
            </View>
          ))}
        </View>

        {/* Dự án đã dùng */}
        <SectionTitle title={t.skills.sectionProjects} styles={styles} />
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
          variant="dark"
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
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  // 1. Container chính
  safe: { flex: 1, backgroundColor: c.bg },

  // 3. Scroll
  scroll: { padding: SPACING.screenX, gap: SPACING.s3, paddingBottom: 32 },

  // 4. Hero card
  heroCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    padding: SPACING.s5,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADII.item,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text, marginTop: 10 },
  levelBadge: { borderRadius: RADII.chip, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  levelText: { fontFamily: FONT.medium, fontSize: TYPE.caption },
  heroProgress: {
    height: 5,
    borderRadius: 3,
    alignSelf: 'stretch',
    marginTop: 14,
    backgroundColor: c.divider,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: c.accent,
  },
  heroSub: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, marginTop: 8, textAlign: 'center' },

  // 5. Section title
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: SPACING.s2 },
  accentBar: { width: 3, height: 16, backgroundColor: c.accent, borderRadius: 2 },
  sectionTitleText: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },

  // 6. Cards & rows
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider },
  hlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
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
  hlText: { flex: 1, fontFamily: FONT.regular, fontSize: TYPE.body, color: c.text, lineHeight: 19 },
  prjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
  },
  prjIconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADII.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prjInfo: { flex: 1 },
  prjName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  prjTech: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 1 },

  // 7. Bottom CTA
  githubBtn: { marginTop: 4 },
});
