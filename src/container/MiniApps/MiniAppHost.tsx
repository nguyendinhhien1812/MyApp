// Khung chứa mini-app đã nạp.
//
// Mini-app là code build riêng, tải lúc chạy — nó lỗi thì KHÔNG được kéo cả app
// chết theo. Error boundary ở đây là bắt buộc chứ không phải cho đẹp.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme, useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { logger } from '../../utils/logger';
import SubHeader from '../../components/UI/SubHeader';
import { getLoaded } from './loaders';

type BoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
  miniAppId: string;
};

class MiniAppBoundary extends React.Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    logger.error('miniapp', `mini-app "${this.props.miniAppId}" ném lỗi khi render`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface Props {
  navigation: any;
  route: { params?: { id?: string } };
}

const MiniAppHost = ({ navigation, route }: Props) => {
  const id = route.params?.id ?? '';
  const { t } = useLanguage();
  const { scheme } = useAppTheme();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const Component = getLoaded(id);

  const Failure = (
    <SafeAreaView style={styles.safe}>
      <SubHeader title={t.miniApp.title} onBack={() => navigation.goBack()} />
      <View style={styles.center}>
        <Text style={styles.failTitle}>{t.miniApp.loadFailed}</Text>
        <Text style={styles.failHint}>{t.miniApp.loadFailedHint}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>{t.common.cancel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Vào thẳng route này mà chưa nạp (vd deep link) thì không có gì để render
  if (!Component) { return Failure; }

  return (
    // Vùng an toàn do HOST lo. Mini-app không import được gì từ host nên nó
    // không biết tai thỏ cao bao nhiêu — để nó tự lo thì header đè lên đồng hồ.
    <SafeAreaView style={styles.safe}>
      <MiniAppBoundary miniAppId={id} fallback={Failure}>
        {/* scheme truyền xuống từ theme của host — mini-app không tự đoán,
            nếu không người dùng ép chế độ Sáng trong app mà mini-app vẫn Tối. */}
        <Component scheme={scheme} onBack={() => navigation.goBack()} />
      </MiniAppBoundary>
    </SafeAreaView>
  );
};

export default MiniAppHost;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.s2,
      paddingHorizontal: SPACING.s5,
    },
    failTitle: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.text },
    failHint: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      color: c.muted,
      textAlign: 'center',
      lineHeight: 18,
    },
    btn: {
      marginTop: SPACING.s3,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: RADII.chip,
      paddingHorizontal: SPACING.s4,
      paddingVertical: 7,
    },
    btnText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },
  });
