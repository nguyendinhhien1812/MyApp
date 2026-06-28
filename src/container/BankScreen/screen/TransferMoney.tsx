import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Icon, useTheme } from '@rneui/themed';

interface TransferMoneyProps extends StackScreenProps<{}> {}

const TransferMoney = ({ navigation, route }: TransferMoneyProps) => {
  const styles = createStyles();
  const { colors } = useTheme().theme;

  // @ts-ignore
  const balance = route.params?.balance;

  const money = (n: any) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);

  const [transferAmount, setTransferAmount] = useState('');

  const detail = () => {
    return (
      <View style={styles.vwDetail}>
        <View style={styles.cardHeader}>
          <Text style={{ color: colors.black }}>Tài khoản</Text>
          <Icon
            type="ionicon"
            name="eye-outline"
            size={18}
            color={colors.black}
          />
        </View>
        <Text style={styles.balance}>{money(balance)}</Text>
      </View>
    );
  };

  const transferMoney = () => {
    return (
      <View style={styles.vwDetail}>
        <View style={styles.cardTransfer}>
          <Text style={{ color: colors.black }}>Chuyển tiền</Text>
          <TextInput
            placeholder="Nhập số tiền"
            value={transferAmount}
            onChangeText={setTransferAmount}
            keyboardType="numeric"
            autoCapitalize="none"
            clearTextOnFocus={true}
            style={{
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 12,
              borderColor: colors.greyOutline,
              borderRadius: 8,
            }}
          />
        </View>
        <Text style={{ color: colors.black }}>Chọn người nhận</Text>
        <View>
            
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {detail()}
      {transferMoney()}
    </SafeAreaView>
  );
};

export default TransferMoney;

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    vwDetail: {
      margin: 16,
      padding: 16,
      justifyContent: 'flex-start',
      backgroundColor: '#fff',
      borderRadius: 16,
      gap: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    balance: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 12,
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    cardTransfer: {
      justifyContent: 'center',
      gap: 12,
    },
  });
