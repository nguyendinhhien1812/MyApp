import React, { useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../Icon';
import { ICON_TYPE } from '../Icon/style';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { TYPE, SPACING, FONT } from '../../theme/tokens';

// Sub-header dùng chung cho mọi màn "con" theo design "Classical":
// nút back bên trái + tiêu đề, gạch chân divider. Không nền màu.
// `right` (tuỳ chọn) hiển thị 1 action ở mép phải, vd nút refresh.
interface SubHeaderProps {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}

const SubHeader = ({ title, onBack, right }: SubHeaderProps) => {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
        <Icon type={ICON_TYPE.Iconoir} name="nav-arrow-left" size={22} color={c.text} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
};

export default SubHeader;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s2,
      paddingHorizontal: SPACING.s4,
      paddingTop: SPACING.s2,
      paddingBottom: SPACING.s3,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.divider,
    },
    backBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { flex: 1, fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
    right: { flexShrink: 0 },
  });
