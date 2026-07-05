// ─── 1. Imports ────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Controller, Control, FieldValues, FieldPath } from 'react-hook-form';
import { Icon } from '@rneui/themed';

// ─── 2. Constants ──────────────────────────────────────────────────────────
const PRIMARY      = '#E89951';
const COLOR_DANGER = '#c0392b';

// ─── 3. Types ──────────────────────────────────────────────────────────────
interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

// ─── 4. Component ──────────────────────────────────────────────────────────
const FormCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
}: FormCheckboxProps<T>) => (
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

export default FormCheckbox;

// ─── 5. Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  label: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  errorText: {
    fontSize: 11,
    color: COLOR_DANGER,
  },
});
