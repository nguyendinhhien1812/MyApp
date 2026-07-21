import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;  // padding 16 bên trong (mặc định có)
  inset?: boolean;   // marginHorizontal 16 (mặc định có)
  style?: StyleProp<ViewStyle>;
}

const AppCard = ({
  children,
  onPress,
  padded = true,
  inset = true,
  style,
}: AppCardProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Card
      mode="contained"
      onPress={onPress}
      style={[styles.card, inset && styles.inset, style]}>
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </Card>
  );
};

export default AppCard;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.white,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.border,
      overflow: 'hidden',
    },
    inset: {
      marginHorizontal: 16,
    },
    padded: {
      padding: 16,
    },
  });
