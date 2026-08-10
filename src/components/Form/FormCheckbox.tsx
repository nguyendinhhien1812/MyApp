// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Controller, Control, FieldValues, FieldPath } from 'react-hook-form';
import { Icon } from '@rneui/themed';
import { ThemeColors } from '../../theme/paperTheme';
import { useThemeColors } from '../../context/ThemeContext';

// ─── 2. Types ──────────────────────────────────────────────────────────────
interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

// ─── 3. Component ──────────────────────────────────────────────────────────
const FormCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
}: FormCheckboxProps<T>) => {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.field}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => onChange(!value)}>
            <View style={[styles.box, value && styles.boxChecked]}>
              {value ? (
                <Icon type="ionicon" name="checkmark" size={13} color="#fff" />
              ) : null}
            </View>
            <Text style={styles.label}>{label}</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
};

export default FormCheckbox;

// ─── 4. Styles ─────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    field: {
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    box: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: c.muted,
      backgroundColor: c.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxChecked: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    label: {
      fontSize: 13,
      color: c.text,
    },
    errorText: {
      fontSize: 11,
      color: c.danger,
    },
  });
