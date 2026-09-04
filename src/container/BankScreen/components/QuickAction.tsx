import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from '../../../components/Icon';
import { ICON_TYPE } from '../../../components/Icon/style';
import { useThemeColors } from '../../../context/ThemeContext';
import { RADII, TYPE, FONT } from '../../../theme/tokens';

interface QuickActionProps {
  icon: string; // tên Iconoir dạng kebab, vd "qr-code"
  label: string;
  onPress: () => void;
}

// Ô hành động trên khối số dư nền tối: nền trắng mờ, icon + nhãn màu đồng sáng.
const QuickAction = ({ icon, label, onPress }: QuickActionProps) => {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(), []);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Icon type={ICON_TYPE.Iconoir} name={icon} size={20} color={c.accent300} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickAction;

// Không nhận ThemeColors: khối này luôn nằm trên nền tối (heroDark), nên dùng
// trắng trong suốt để hợp với mọi theme — đây là chủ ý, không phải bỏ sót.
const makeStyles = () =>
  StyleSheet.create({
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 7,
      paddingVertical: 11,
      paddingHorizontal: 4,
      borderRadius: RADII.item,
      backgroundColor: 'rgba(253,252,251,0.12)',
    },
    label: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      textAlign: 'center',
      color: 'rgba(253,252,251,0.85)',
    },
  });
