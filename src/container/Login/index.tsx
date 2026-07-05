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
import type { Translations } from '../../i18n/translations';

// ─── 2. Constants ──────────────────────────────────────────────────────────
const PRIMARY_DARK   = '#b36a1a';
const PRIMARY_LIGHT  = '#fdf3e7';

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
  const [submitting, setSubmitting] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);

  const schema = useMemo(() => makeSchema(t), [t]);
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '', remember: true },
    mode: 'onTouched',
  });

  const onSubmit = (data: LoginForm) => {
    setSubmitting(true);
    // Giả lập gọi API — thay bằng auth service thật khi có
    setTimeout(() => {
      setSubmitting(false);
      console.log('Login payload:', data);
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
            <Icon type="ionicon" name="wallet-outline" size={34} color={PRIMARY_DARK} />
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
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />

            <View style={styles.securityRow}>
              <Icon type="ionicon" name="lock-closed-outline" size={11} color="#ccc" />
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
const styles = StyleSheet.create({
  // 1. Container chính
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
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
    borderRadius: 20,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },

  // 4. Form
  form: {
    gap: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY_DARK,
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
    fontSize: 11,
    color: '#ccc',
  },
});
