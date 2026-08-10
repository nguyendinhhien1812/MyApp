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
      borderRadius: 100,
      backgroundColor: c.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    chipActive: {
      backgroundColor: c.accent100,
      borderColor: c.accent100,
    },
    text: {
      fontSize: 13,
      color: c.subtext,
    },
    textActive: {
      color: c.accent700,
      fontWeight: '600',
    },
  });
