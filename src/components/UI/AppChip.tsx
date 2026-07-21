import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';

interface AppChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string; // tên MaterialCommunityIcons
}

const AppChip = ({ label, selected = false, onPress, icon }: AppChipProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Chip
      mode="outlined"
      compact
      icon={icon}
      onPress={onPress}
      selected={selected}
      showSelectedCheck={false}
      style={[styles.chip, selected && styles.chipActive]}
      textStyle={[styles.text, selected && styles.textActive]}>
      {label}
    </Chip>
  );
};

export default AppChip;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chip: {
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 0.5,
      borderColor: c.border,
    },
    chipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    text: {
      fontSize: 12,
      color: c.subtext,
    },
    textActive: {
      color: '#fff', // text trên nền cam — luôn trắng
      fontWeight: '500',
    },
  });
