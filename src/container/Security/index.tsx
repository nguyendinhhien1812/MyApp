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
import { FormTextInput } from '../../components/Form';
import { AppButton, AppSnackbar } from '../../components/UI';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Translations } from '../../i18n/translations';

// ─── 2. Validation schema ──────────────────────────────────────────────────
const makeSchema = (t: Translations) =>
  z
    .object({
      current: z.string().min(1, t.security.errCurrentRequired),
      newPass: z.string().min(6, t.security.errMin),
      confirm: z.string(),
    })
    .refine(data => data.confirm === data.newPass, {
      message: t.security.errMatch,
      path: ['confirm'],
    });

type SecurityForm = z.infer<ReturnType<typeof makeSchema>>;

// ─── 3. Main screen component ──────────────────────────────────────────────
interface Props {
  navigation: any;
}

const SecurityScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const schema = useMemo(() => makeSchema(t), [t]);
  const { control, handleSubmit } = useForm<SecurityForm>({
    resolver: zodResolver(schema),
    defaultValues: { current: '', newPass: '', confirm: '' },
    mode: 'onTouched',
  });

  const onSubmit = (_data: SecurityForm) => setSaved(true);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header cam */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.security.title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.iconWrap}>
            <Icon type="ionicon" name="shield-checkmark-outline" size={30} color={colors.primaryDark} />
          </View>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="current"
              label={t.security.current}
              icon="lock-closed-outline"
              secure
            />
            <FormTextInput
              control={control}
              name="newPass"
              label={t.security.newPass}
              icon="key-outline"
              secure
            />
            <FormTextInput
              control={control}
              name="confirm"
              label={t.security.confirm}
              icon="key-outline"
              secure
            />
            <AppButton
              title={t.security.save}
              onPress={handleSubmit(onSubmit)}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppSnackbar
        visible={saved}
        onDismiss={() => {
          setSaved(false);
          navigation.goBack();
        }}
        message={t.security.saved}
        tone="success"
        duration={1500}
      />
    </SafeAreaView>
  );
};

export default SecurityScreen;

// ─── 4. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },

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

  scroll: { padding: 20, paddingBottom: 32 },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: c.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },

  form: { gap: 16 },
  saveBtn: { marginTop: 8 },
});
