// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@rneui/themed';
import { FormTextInput } from '../../components/Form';
import { AppButton, AppSnackbar } from '../../components/UI';
import SubHeader from '../../components/UI/SubHeader';
import { ThemeColors } from '../../theme/paperTheme';
import { SPACING } from '../../theme/tokens';
import { useThemeColors } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Translations } from '../../i18n/translations';

// ─── 2. Constants ──────────────────────────────────────────────────────────
const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

// ─── 3. Validation schema ──────────────────────────────────────────────────
const makeSchema = (t: Translations) =>
  z.object({
    fullName: z.string().min(2, t.editProfile.errNameRequired),
    email: z.string().email(t.editProfile.errEmailInvalid),
    phone: z.string().regex(/^(0|\+84)\d{9}$/, t.editProfile.errPhoneInvalid),
  });

type ProfileForm = z.infer<ReturnType<typeof makeSchema>>;

// ─── 4. Main screen component ──────────────────────────────────────────────
interface Props {
  navigation: any;
}

const EditProfileScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const schema = useMemo(() => makeSchema(t), [t]);
  const { control, handleSubmit } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: 'Nguyễn Đình Hiến',
      email: 'Kyonguyen00775@gmail.com',
      phone: '0857957622',
    },
    mode: 'onTouched',
  });

  const onSubmit = (_data: ProfileForm) => setSaved(true);

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader title={t.editProfile.title} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
            <View style={styles.avatarEditBadge}>
              <Icon type="ionicon" name="camera-outline" size={13} color="#fff" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="fullName"
              label={t.editProfile.fullName}
              icon="person-outline"
            />
            <FormTextInput
              control={control}
              name="email"
              label={t.editProfile.email}
              icon="mail-outline"
              keyboardType="email-address"
            />
            <FormTextInput
              control={control}
              name="phone"
              label={t.editProfile.phone}
              icon="call-outline"
              keyboardType="phone-pad"
            />
            <AppButton
              title={t.editProfile.save}
              variant="dark"
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
        message={t.editProfile.saved}
        tone="success"
        duration={1500}
      />
    </SafeAreaView>
  );
};

export default EditProfileScreen;

// ─── 5. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
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

    avatarWrap: { alignSelf: 'center', marginBottom: SPACING.s6 },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
      borderColor: c.accent,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.accent700,
      borderWidth: 2,
      borderColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },

    form: { gap: 16 },
    saveBtn: { marginTop: 8 },
  });
