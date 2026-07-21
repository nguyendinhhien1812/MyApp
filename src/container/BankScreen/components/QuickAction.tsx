import { Icon } from '@rneui/themed';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/paperTheme';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress}>
      <View style={styles.quickIconWrap}>
        <Icon type="ionicon" name={icon} size={20} color={colors.primaryDark} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickAction;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  quickItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconWrap: {
    backgroundColor: c.primaryLight,
    padding: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
  },
  quickLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: c.subtext,
  },
});
