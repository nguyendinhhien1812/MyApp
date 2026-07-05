// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Controller, Control, FieldValues, FieldPath } from 'react-hook-form';
import { Icon } from '@rneui/themed';

// ─── 2. Constants ──────────────────────────────────────────────────────────
const PRIMARY      = '#E89951';
const COLOR_DANGER = '#c0392b';

// ─── 3. Types ──────────────────────────────────────────────────────────────
interface FormTextInputProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  icon?: string;    // tên ionicon hiển thị bên trái
  secure?: boolean; // input mật khẩu, có nút ẩn/hiện
}

// ─── 4. Component ──────────────────────────────────────────────────────────
const FormTextInput = <T extends FieldValues>({
  control,
  name,
  label,
  icon,
  secure = false,
  ...inputProps
}: FormTextInputProps<T>) => {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={styles.field}>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <View
            style={[
              styles.inputWrap,
              focused && styles.inputWrapFocused,
              error && styles.inputWrapError,
            ]}>
            {icon ? (
              <Icon
                type="ionicon"
                name={icon}
                size={18}
                color={error ? COLOR_DANGER : focused ? PRIMARY : '#aaa'}
              />
            ) : null}

            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                onBlur();
              }}
              placeholderTextColor="#aaa"
              secureTextEntry={hidden}
              autoCapitalize="none"
              {...inputProps}
            />

            {secure ? (
              <TouchableOpacity
                onPress={() => setHidden(h => !h)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon
                  type="ionicon"
                  name={hidden ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#aaa"
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
};

export default FormTextInput;

// ─── 5. Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapFocused: {
    borderColor: PRIMARY,
  },
  inputWrapError: {
    borderColor: COLOR_DANGER,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 11,
    color: COLOR_DANGER,
  },
});
