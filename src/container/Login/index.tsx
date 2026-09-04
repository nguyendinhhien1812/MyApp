// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@rneui/themed';
import { FormTextInput, FormCheckbox } from '../../components/Form';
import { AppButton, AppDialog } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import type { Translations } from '../../i18n/translations';

// ─── 3. Validation schema ──────────────────────────────────────────────────
const makeSchema = (t: Translations) =>
  z.object({
    phone: z
      .string()
      .min(1, t.login.errPhoneRequired)
      .regex(/^(0|\+84)\d{9}$/, t.login.errPhoneInvalid),
    password: z
      .string()
      .min(1, t.login.errPasswordRequired)
      .min(6, t.login.errPasswordMin),
    remember: z.boolean(),
  });

type LoginForm = z.infer<ReturnType<typeof makeSchema>>;

// ─── 4. Main screen component ──────────────────────────────────────────────
interface Props {
  navigation: any;
}

const LoginScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [submitting, setSubmitting] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);

  const schema = useMemo(() => makeSchema(t), [t]);
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '', remember: true },
    mode: 'onTouched',
  });

  const onSubmit = (_data: LoginForm) => {
    setSubmitting(true);
    // Giả lập gọi API — thay bằng auth service thật khi có.
    // KHÔNG log `data`: object này chứa password.
    setTimeout(() => {
      setSubmitting(false);
      navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {/* Logo + welcome */}
          <View style={styles.logoWrap}>
            <Icon type="ionicon" name="wallet-outline" size={34} color={colors.accent700} />
          </View>
          <Text style={styles.title}>{t.login.welcome}</Text>
          <Text style={styles.subtitle}>{t.login.subtitle}</Text>

          {/* Form */}
          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="phone"
              label={t.login.phone}
              placeholder={t.login.phonePlaceholder}
              icon="call-outline"
              keyboardType="phone-pad"
            />
            <FormTextInput
              control={control}
              name="password"
              label={t.login.password}
              placeholder={t.login.passwordPlaceholder}
              icon="lock-closed-outline"
              secure
            />

            <View style={styles.optionsRow}>
              <FormCheckbox control={control} name="remember" label={t.login.remember} />
              <TouchableOpacity activeOpacity={0.7} onPress={() => setForgotVisible(true)}>
                <Text style={styles.forgotText}>{t.login.forgot}</Text>
              </TouchableOpacity>
            </View>

            <AppButton
              title={submitting ? t.login.submitting : t.login.submit}
              loading={submitting}
              variant="dark"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />

            <View style={styles.securityRow}>
              <Icon type="ionicon" name="lock-closed-outline" size={11} color={colors.muted} />
              <Text style={styles.securityText}>{t.login.ssl}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppDialog
        visible={forgotVisible}
        onDismiss={() => setForgotVisible(false)}
        icon="help-circle-outline"
        tone="info"
        title={t.login.forgotTitle}
        description={t.login.forgotDesc}
        confirmText={t.login.forgotOk}
        onConfirm={() => setForgotVisible(false)}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;

// ─── 5. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  // 1. Container chính
  safe: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },

  // 2. Scroll / main content
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // 3. Logo + heading
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: RADII.card,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.s5,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: c.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.subtext,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },

  // 4. Form
  form: {
    gap: SPACING.s4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    fontFamily: FONT.medium,
    fontSize: TYPE.body,
    color: c.accent700,
  },

  // 5. Bottom CTA
  submitBtn: {
    marginTop: 4,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  securityText: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    color: c.muted,
  },
});
