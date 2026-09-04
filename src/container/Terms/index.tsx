// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import SubHeader from '../../components/UI/SubHeader';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { useThemeColors } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// ─── 2. Main screen component ──────────────────────────────────────────────
interface Props {
  navigation: any;
}

const TermsScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const sections = [
    { title: t.terms.s1Title, body: t.terms.s1Body },
    { title: t.terms.s2Title, body: t.terms.s2Body },
    { title: t.terms.s3Title, body: t.terms.s3Body },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader title={t.terms.title} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {sections.map((s, i) => (
            <View key={i} style={[styles.section, i > 0 && styles.sectionBorder]}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.updated}>{t.terms.updated}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsScreen;

// ─── 3. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { padding: SPACING.screenX, paddingBottom: 32 },

  card: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
  section: { padding: SPACING.s4 },
  sectionBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },
  sectionTitle: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.text, marginBottom: 6 },
  sectionBody: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, lineHeight: 20 },

  updated: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    color: c.muted,
    textAlign: 'center',
    marginTop: SPACING.s4,
  },
});
