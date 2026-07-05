import React from 'react';
import { Switch } from 'react-native-paper';
import { BRAND } from '../../theme/paperTheme';

interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const AppSwitch = ({ value, onValueChange, disabled = false }: AppSwitchProps) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    color={BRAND.primary}
  />
);

export default AppSwitch;
