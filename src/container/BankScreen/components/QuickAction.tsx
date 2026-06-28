import { Icon, useTheme } from '@rneui/themed';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => {
  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress}>
      <View style={styles.quickIconWrap}>
        <Icon type="ionicon" name={icon} size={20} color="#b36a1a" />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickAction;

const styles = StyleSheet.create({
  quickItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconWrap: {
    backgroundColor: '#fdf3e7',
    padding: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#f0c48a',
  },
  quickLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#555',
  },
});
