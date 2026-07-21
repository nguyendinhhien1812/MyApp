import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';

interface SectionTitleProps {
  title: string;
  actionText?: string;   // ví dụ "Xem tất cả"
  onAction?: () => void;
}

const SectionTitle = ({ title, actionText, onAction }: SectionTitleProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
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
};

export default SectionTitle;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bar: {
      width: 4,
      height: 18,
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: c.text,
    },
    action: {
      fontSize: 12,
      fontWeight: '500',
      color: c.primaryDark,
    },
  });
