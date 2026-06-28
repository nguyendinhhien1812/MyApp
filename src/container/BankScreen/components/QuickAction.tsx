import { Icon, useTheme } from '@rneui/themed';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => {
  const { colors } = useTheme().theme;
  const styles = createStyles();
  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress}>
      <View style={styles.quickIconWrap}>
        <Icon type="ionicon" name={icon} size={20} color={colors.black} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickAction;

const createStyles = () =>
  StyleSheet.create({
    quickItem: {
      alignItems: 'center',
    },
    quickIconWrap: {
      backgroundColor: '#f2f2f2',
      padding: 12,
      borderRadius: 50,
      marginBottom: 6,
    },
    quickLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
  });
