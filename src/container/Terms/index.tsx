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
import { BRAND } from '../../theme/paperTheme';
import { useLanguage } from '../../context/LanguageContext';

// ─── 2. Main screen component ──────────────────────────────────────────────
interface Props {
  navigation: any;
}

const TermsScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();

  const sections = [
    { title: t.terms.s1Title, body: t.terms.s1Body },
    { title: t.terms.s2Title, body: t.terms.s2Body },
    { title: t.terms.s3Title, body: t.terms.s3Body },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header cam */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.terms.title}</Text>
        <View style={styles.headerBtn} />
      </View>

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
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND.bg },

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

  scroll: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: BRAND.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  section: { padding: 16 },
  sectionBorder: { borderTopWidth: 0.5, borderTopColor: BRAND.divider },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: BRAND.text, marginBottom: 6 },
  sectionBody: { fontSize: 13, color: BRAND.subtext, lineHeight: 20 },

  updated: {
    fontSize: 11,
    color: BRAND.hint,
    textAlign: 'center',
    marginTop: 14,
  },
});
