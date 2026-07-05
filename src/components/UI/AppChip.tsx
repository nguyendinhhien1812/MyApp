import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { BRAND } from '../../theme/paperTheme';

interface AppChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string; // tên MaterialCommunityIcons
}

const AppChip = ({ label, selected = false, onPress, icon }: AppChipProps) => (
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

export default AppChip;

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    backgroundColor: BRAND.white,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  chipActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  text: {
    fontSize: 12,
    color: BRAND.subtext,
  },
  textActive: {
    color: BRAND.white,
    fontWeight: '500',
  },
});
