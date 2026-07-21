// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
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
import { AppChip } from '../../components/UI';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SKILLS, LEVEL_BADGE, TOTAL_YEARS, TOTAL_PROJECTS, SkillItem } from './data';

// ─── 2. Types ──────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
}

// ─── 3. Main screen component ──────────────────────────────────────────────
const SkillsScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState(0);

  const filters = [
    t.skills.filterAll,
    t.skills.filterFrontend,
    t.skills.filterLanguage,
    t.skills.filterArchitecture,
    t.skills.filterTools,
  ];

  // Filter bằng index — không so sánh string để i18n không phá logic (guide 9.3)
  const filtered = SKILLS.filter(s => {
    if (activeFilter === 1) {return s.category === 'frontend';}
    if (activeFilter === 2) {return s.category === 'language';}
    if (activeFilter === 3) {return s.category === 'architecture';}
    if (activeFilter === 4) {return s.category === 'tools';}
    return true;
  });

  const levelLabel = (skill: SkillItem) =>
    ({
      expert: t.skills.levelExpert,
      proficient: t.skills.levelProficient,
      good: t.skills.levelGood,
      learning: t.skills.levelLearning,
    })[skill.level];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header cam */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.skills.title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Thống kê tổng quan */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{SKILLS.length}</Text>
            <Text style={styles.summaryLabel}>{t.skills.statSkills}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{TOTAL_YEARS}+</Text>
            <Text style={styles.summaryLabel}>{t.skills.statYears}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryValueAccent]}>{TOTAL_PROJECTS}</Text>
            <Text style={styles.summaryLabel}>{t.skills.statProjects}</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filters.map((f, i) => (
            <AppChip key={i} label={f} selected={activeFilter === i} onPress={() => setActiveFilter(i)} />
          ))}
        </ScrollView>

        {/* Danh sách kỹ năng */}
        {filtered.map(skill => (
          <TouchableOpacity
            key={skill.id}
            style={styles.skillCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}>
            <View style={[styles.skillIconWrap, { backgroundColor: skill.iconBg }]}>
              <Icon type="ionicon" name={skill.icon} size={20} color={skill.iconColor} />
            </View>
            <View style={styles.skillInfo}>
              <View style={styles.skillTopRow}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={[styles.levelBadge, { backgroundColor: LEVEL_BADGE[skill.level].bg }]}>
                  <Text style={[styles.levelText, { color: LEVEL_BADGE[skill.level].color }]}>
                    {levelLabel(skill)}
                  </Text>
                </View>
              </View>
              <Text style={styles.skillSub}>
                {skill.years} {t.skills.yearsUnit} · {skill.projects.length} {t.skills.projectsUnit}
              </Text>
              <ProgressBar
                progress={skill.percent / 100}
                color={colors.primary}
                style={styles.progress}
              />
            </View>
            <Icon type="ionicon" name="chevron-forward" size={15} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SkillsScreen;

// ─── 4. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  // 1. Container chính
  safe: { flex: 1, backgroundColor: c.bg },

  // 2. Header
  header: {
    backgroundColor: c.primary,
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

  // 4. Summary card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: c.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    paddingVertical: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: c.text },
  summaryValueAccent: { color: c.success },
  summaryLabel: { fontSize: 11, color: c.subtext },
  summaryDivider: { width: 0.5, backgroundColor: c.divider },

  // 5. Filter
  filterRow: { gap: 8, paddingRight: 16 },

  // 6. Skill cards
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: c.border,
    padding: 14,
  },
  skillIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: { flex: 1, gap: 3 },
  skillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  skillName: { fontSize: 14, fontWeight: '500', color: c.text, flexShrink: 1 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: '500' },
  skillSub: { fontSize: 11, color: c.subtext },
  progress: { height: 5, borderRadius: 3, marginTop: 3 },
});
