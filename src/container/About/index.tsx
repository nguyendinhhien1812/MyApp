import React, { useMemo, useState } from 'react';
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
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import SubHeader from '../../components/UI/SubHeader';
import { AppSnackbar } from '../../components/UI';
import { logger } from '../../utils/logger';

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
  const [toast, setToast] = useState('');

  // ─── Tech chip data ─────────────────────────────────────────────────────────
  const TECH_CHIPS = [
    { label: 'React Native', bg: '#e3f2fd', fg: '#1565c0' },
    { label: 'TypeScript',   bg: '#e8eaf6', fg: '#283593' },
    { label: 'React Nav',    bg: '#f3e5f5', fg: '#6a1b9a' },
    { label: 'i18n Context', bg: colors.accent100, fg: colors.accent700 },
    { label: 'SVG Charts',   bg: '#e8f5e9', fg: '#1b5e20' },
    { label: 'Real API',     bg: '#e0f2f1', fg: '#00695c' },
    { label: 'Animated',     bg: '#fff3e0', fg: '#e65100' },
    { label: 'Context API',  bg: '#fce4ec', fg: '#880e4f' },
  ];

  // Mở link ngoài: lỗi thì log cho dev và báo user, không im lặng
  const openLink = (url: string) =>
    Linking.openURL(url).catch(err => {
      logger.warn('about', `không mở được link: ${url}`, err);
      setToast(t.common.linkOpenFailed);
    });

  // ─── Contact button ─────────────────────────────────────────────────────────
  const ContactBtn = ({
    icon, label, url, color, bg,
  }: {
    icon: string; label: string; url: string; color: string; bg: string;
  }) => (
    <TouchableOpacity
      style={[styles.contactBtn, { backgroundColor: bg }]}
      onPress={() => openLink(url)}
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
      <SubHeader title={t.about.title} onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          {/* App icon */}
          <View style={styles.appIconWrap}>
            <Icon type="ionicon" name="layers" size={32} color={colors.accent700} />
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
                  <Icon type="ionicon" name="phone-portrait-outline" size={10} color={colors.accent700} />
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
          onPress={() => openLink('https://github.com/nguyendinhhien1812')}
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

      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone="default"
        duration={2200}
      />
    </SafeAreaView>
  );
};

export default AboutScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  scroll: { paddingBottom: 40 },

  // Hero card
  heroCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    margin: SPACING.screenX,
    padding: SPACING.s6,
    alignItems: 'center',
  },
  appIconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADII.card,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.s4,
  },
  appName: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: c.text,
  },
  appSub: {
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.subtext,
    marginTop: 4,
    textAlign: 'center',
  },
  portfolioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f8f0',
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: SPACING.s3,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1a7a40',
  },
  tagText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: '#1a7a40' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s2,
    marginBottom: SPACING.s3,
  },
  accentBar: { width: 3, height: 16, backgroundColor: c.accent, borderRadius: 2 },
  sectionTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },

  // Dev card
  devCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginBottom: SPACING.s4,
    padding: SPACING.s4,
  },
  devTop: { flexDirection: 'row', gap: 14, marginBottom: SPACING.s4 },
  devAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: c.accent,
  },
  devInfo: { flex: 1, justifyContent: 'center' },
  devName: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  devRole: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, marginTop: 2 },
  devTagRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  devTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.accent100,
    borderRadius: RADII.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  devTagText: { fontFamily: FONT.medium, fontSize: 10, color: c.accent700 },

  // Contact buttons
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
    paddingTop: SPACING.s4,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: RADII.item,
    paddingVertical: 10,
  },
  contactBtnText: { fontFamily: FONT.medium, fontSize: TYPE.caption },

  // Tech chips
  techCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginBottom: SPACING.s4,
    padding: SPACING.s4,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { fontFamily: FONT.medium, fontSize: TYPE.body },

  // Features
  featureCard: {
    backgroundColor: c.white,
    borderRadius: RADII.card,
    marginHorizontal: SPACING.screenX,
    marginBottom: SPACING.s4,
    padding: SPACING.s4,
    gap: SPACING.s3,
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
  featureText: { flex: 1, fontFamily: FONT.regular, fontSize: TYPE.body, color: c.text, lineHeight: 20 },

  // Source CTA
  sourceCta: {
    backgroundColor: c.heroDark,
    borderRadius: RADII.item,
    marginHorizontal: SPACING.screenX,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: SPACING.s6,
  },
  sourceCtaText: {
    fontFamily: FONT.semibold,
    fontSize: TYPE.itemTitle,
    color: c.offWhite,
    flex: 1,
    textAlign: 'center',
    marginLeft: -28,
  },

  // Footer
  footer: { alignItems: 'center', gap: 6 },
  footerVersion: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.muted },
  footerMade: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    color: c.muted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 17,
  },
});
