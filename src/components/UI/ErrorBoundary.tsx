// Lưới an toàn cho toàn app.
//
// React không có cách nào bắt lỗi render bằng hook — bắt buộc phải là class
// component. Không có boundary thì một lỗi render ở BẤT KỲ màn nào cũng gỡ
// sạch cây component và để lại màn trắng, người dùng chỉ còn cách tắt mở app.
//
// MiniAppHost có boundary riêng và vẫn giữ: nó bắt sớm hơn nên mini-app hỏng
// chỉ mất mini-app, không kéo cả app về màn báo lỗi này.

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { logger } from '../../utils/logger';

const CrashScreen = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useLanguage();
  const c = useThemeColors();
  const styles = React.useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t.crash.title}</Text>
      <Text style={styles.hint}>{t.crash.hint}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t.crash.retry}>
        <Text style={styles.btnText}>{t.crash.retry}</Text>
      </TouchableOpacity>
    </View>
  );
};

interface Props {
  children: ReactNode;
  /** Tên vùng được bọc, chỉ dùng cho log. */
  scope?: string;
}

interface State {
  failed: boolean;
  /** Đổi giá trị này để React vứt cây cũ và dựng lại từ đầu. */
  attempt: number;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // componentStack cho biết màn nào ném lỗi — thứ duy nhất giúp lần ra chỗ
    // hỏng, vì stack của error đã qua bundler nên gần như vô nghĩa.
    logger.error('app', `lỗi render ở ${this.props.scope ?? 'app'}`, {
      error,
      componentStack: info.componentStack,
    });
  }

  // Lỗi tất định (vd dữ liệu sai) sẽ ném lại ngay khi dựng xong — người dùng
  // thấy y màn này. Vẫn đáng có: phần lớn lỗi render là nhất thời.
  retry = () => this.setState(s => ({ failed: false, attempt: s.attempt + 1 }));

  render() {
    if (this.state.failed) {
      return <CrashScreen onRetry={this.retry} />;
    }
    return (
      <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>
    );
  }
}

export default ErrorBoundary;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
      paddingHorizontal: SPACING.s6,
      gap: SPACING.s2,
    },
    title: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
    hint: {
      fontFamily: FONT.regular,
      fontSize: TYPE.body,
      color: c.subtext,
      textAlign: 'center',
    },
    btn: {
      marginTop: SPACING.s4,
      backgroundColor: c.btnSolid,
      borderRadius: RADII.chip,
      paddingHorizontal: SPACING.s6,
      paddingVertical: SPACING.s3,
    },
    btnText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.offWhite },
  });
