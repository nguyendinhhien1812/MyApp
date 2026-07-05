import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { BRAND } from '../../theme/paperTheme';

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
}: AppCardProps) => (
  <Card
    mode="contained"
    onPress={onPress}
    style={[styles.card, inset && styles.inset, style]}>
    <View style={padded ? styles.padded : undefined}>{children}</View>
  </Card>
);

export default AppCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  inset: {
    marginHorizontal: 16,
  },
  padded: {
    padding: 16,
  },
});
