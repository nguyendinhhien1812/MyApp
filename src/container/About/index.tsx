import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';

const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

// ─── Screen ──────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

const AboutScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ─── Tech chip data ─────────────────────────────────────────────────────────
  const TECH_CHIPS = [
    { label: 'React Native', bg: '#e3f2fd', fg: '#1565c0' },
    { label: 'TypeScript',   bg: '#e8eaf6', fg: '#283593' },
    { label: 'React Nav',    bg: '#f3e5f5', fg: '#6a1b9a' },
    { label: 'i18n Context', bg: colors.primaryLight, fg: colors.primaryDark },
    { label: 'SVG Charts',   bg: '#e8f5e9', fg: '#1b5e20' },
    { label: 'Real API',     bg: '#e0f2f1', fg: '#00695c' },
    { label: 'Animated',     bg: '#fff3e0', fg: '#e65100' },
    { label: 'Context API',  bg: '#fce4ec', fg: '#880e4f' },
  ];

  // ─── Contact button ─────────────────────────────────────────────────────────
  const ContactBtn = ({
    icon, label, url, color, bg,
  }: {
    icon: string; label: string; url: string; color: string; bg: string;
  }) => (
    <TouchableOpacity
      style={[styles.contactBtn, { backgroundColor: bg }]}
      onPress={() => Linking.openURL(url).catch(() => {})}
      activeOpacity={0.8}>
      <Icon type="ionicon" name={icon} size={18} color={color} />
      <Text style={[styles.contactBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  // ─── Feature row ────────────────────────────────────────────────────────────
  const FeatureRow = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
      <View style={styles.featureCheck}>
        <Icon type="ionicon" name="checkmark" size={11} color="#fff" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.about.title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          {/* App icon */}
          <View style={styles.appIconWrap}>
            <Icon type="ionicon" name="layers" size={32} color={colors.primaryDark} />
          </View>
          <Text style={styles.appName}>{t.about.appName}</Text>
          <Text style={styles.appSub}>{t.about.appSub}</Text>
          <View style={styles.portfolioTag}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>{t.about.portfolioTag}</Text>
          </View>
        </View>

        {/* ── Developer card ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>{t.about.devSection}</Text>
        </View>

        <View style={styles.devCard}>
          <View style={styles.devTop}>
            <Image source={{ uri: AVATAR_URL }} style={styles.devAvatar} />
            <View style={styles.devInfo}>
              <Text style={styles.devName}>{t.about.devName}</Text>
              <Text style={styles.devRole}>{t.about.devRole}</Text>
              <View style={styles.devTagRow}>
                <View style={styles.devTag}>
                  <Icon type="ionicon" name="phone-portrait-outline" size={10} color={colors.primaryDark} />
                  <Text style={styles.devTagText}>React Native</Text>
                </View>
                <View style={[styles.devTag, { backgroundColor: '#e8f0f8' }]}>
                  <Icon type="ionicon" name="code-slash-outline" size={10} color="#1a4a7a" />
                  <Text style={[styles.devTagText, { color: '#1a4a7a' }]}>TypeScript</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact buttons */}
          <View style={styles.contactRow}>
            <ContactBtn
              icon="mail-outline"
              label="Gmail"
              url="https://mail.google.com/mail/u/0/#inbox"
              color="#1a4a7a"
              bg="#e8f0f8"
            />
            <ContactBtn
              icon="logo-github"
              label="GitHub"
              url="https://github.com/nguyendinhhien1812"
              color="#1a1a1a"
              bg="#f0f0f5"
            />
            <ContactBtn
              icon="logo-linkedin"
              label="LinkedIn"
              url="https://www.linkedin.com/in/hi%E1%BA%BFn-nguy%E1%BB%85n-271b8a2ab/"
              color="#0077b5"
              bg="#e8f4fb"
            />
          </View>
        </View>

        {/* ── Tech stack ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>{t.about.techSection}</Text>
        </View>

        <View style={styles.techCard}>
          <View style={styles.chipWrap}>
            {TECH_CHIPS.map(chip => (
              <View key={chip.label} style={[styles.chip, { backgroundColor: chip.bg }]}>
                <Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Features ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>{t.about.featureSection}</Text>
        </View>

        <View style={styles.featureCard}>
          <FeatureRow text={t.about.feat1} />
          <FeatureRow text={t.about.feat2} />
          <FeatureRow text={t.about.feat3} />
          <FeatureRow text={t.about.feat4} />
          <FeatureRow text={t.about.feat5} />
          <FeatureRow text={t.about.feat6} />
          <FeatureRow text={t.about.feat7} />
        </View>

        {/* ── Source code CTA ── */}
        <TouchableOpacity
          style={styles.sourceCta}
          onPress={() => Linking.openURL('https://github.com/nguyendinhhien1812').catch(() => {})}
          activeOpacity={0.85}>
          <Icon type="ionicon" name="logo-github" size={18} color="#fff" />
          <Text style={styles.sourceCtaText}>{t.about.viewSource}</Text>
          <Icon type="ionicon" name="open-outline" size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>
            {t.about.versionLabel} 1.0.0
          </Text>
          <Text style={styles.footerMade}>{t.about.madeWith}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  // Header
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

  scroll: { paddingBottom: 40 },

  // Hero card
  heroCard: {
    backgroundColor: c.white,
    borderRadius: 20,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  appIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: c.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.primaryBorder,
    marginBottom: 14,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.3,
  },
  appSub: {
    fontSize: 13,
    color: c.subtext,
    marginTop: 4,
    textAlign: 'center',
  },
  portfolioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 12,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1a7a40',
  },
  tagText: { fontSize: 12, fontWeight: '600', color: '#1a7a40' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  accentBar: { width: 4, height: 18, backgroundColor: c.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '500', color: c.text },

  // Dev card
  devCard: {
    backgroundColor: c.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: c.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  devTop: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  devAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: c.primaryBorder,
  },
  devInfo: { flex: 1, justifyContent: 'center' },
  devName: { fontSize: 16, fontWeight: '600', color: c.text },
  devRole: { fontSize: 12, color: c.subtext, marginTop: 2 },
  devTagRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  devTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  devTagText: { fontSize: 10, fontWeight: '500', color: c.primaryDark },

  // Contact buttons
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: c.divider,
    paddingTop: 14,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  contactBtnText: { fontSize: 11, fontWeight: '500' },

  // Tech chips
  techCard: {
    backgroundColor: c.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: c.border,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { fontSize: 12, fontWeight: '500' },

  // Features
  featureCard: {
    backgroundColor: c.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: c.border,
    gap: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a7a40',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  featureText: { flex: 1, fontSize: 13, color: c.text, lineHeight: 20 },

  // Source CTA
  sourceCta: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  sourceCtaText: { fontSize: 14, fontWeight: '600', color: '#fff', flex: 1, textAlign: 'center', marginLeft: -28 },

  // Footer
  footer: { alignItems: 'center', gap: 6 },
  footerVersion: { fontSize: 12, color: c.hint, fontWeight: '500' },
  footerMade: {
    fontSize: 11,
    color: c.muted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 17,
  },
});
