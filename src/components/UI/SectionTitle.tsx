import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../../theme/paperTheme';

interface SectionTitleProps {
  title: string;
  actionText?: string;   // ví dụ "Xem tất cả"
  onAction?: () => void;
}

const SectionTitle = ({ title, actionText, onAction }: SectionTitleProps) => (
  <View style={styles.row}>
    <View style={styles.bar} />
    <Text style={styles.title}>{title}</Text>
    {actionText ? (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.action}>{actionText}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SectionTitle;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 4,
    height: 18,
    backgroundColor: BRAND.primary,
    borderRadius: 2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: BRAND.text,
  },
  action: {
    fontSize: 12,
    fontWeight: '500',
    color: BRAND.primaryDark,
  },
});
