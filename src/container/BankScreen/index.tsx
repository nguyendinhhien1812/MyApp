import { Icon, useTheme } from '@rneui/themed';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { QuickAction } from './components';
import { StackScreenProps } from '@react-navigation/stack';

interface BankScreenProps extends StackScreenProps<{}> {}

const BankScreen = ({ navigation }: BankScreenProps) => {
  const { colors } = useTheme().theme;

  const balance = 1000000000;

  const money = (n: any) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);

  const quickSendList = [
    {
      id: 1,
      name: 'John',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      id: 2,
      name: 'Kevin',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 3,
      name: 'Lyda',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 4,
      name: 'Marry',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      id: 5,
      name: 'Evelyn',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
  ];

  const transactions = [
    {
      id: 1,
      name: 'Transfer from Elly',
      time: '02:45pm',
      amount: 450,
      type: 'income',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 2,
      name: 'Spotify Premium Subscription',
      time: '01:10pm',
      amount: -8,
      type: 'expense',
      avatar:
        'https://seeklogo.com/images/S/spotify-logo-1785F7E8F9-seeklogo.com.png',
    },
    {
      id: 3,
      name: 'Coffee at Highland',
      time: '11:32am',
      amount: -3.5,
      type: 'expense',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
    {
      id: 4,
      name: 'Salary for November',
      time: '09:00am',
      amount: 1200,
      type: 'income',
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
    {
      id: 5,
      name: 'Electricity Bill',
      time: 'Yesterday',
      amount: -35,
      type: 'expense',
      avatar: 'https://cdn-icons-png.flaticon.com/512/1048/1048949.png',
    },
    {
      id: 6,
      name: 'Transfer to Mom',
      time: 'Yesterday',
      amount: -100,
      type: 'expense',
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    },
    {
      id: 7,
      name: 'Zalopay Cashback',
      time: 'Yesterday',
      amount: 15,
      type: 'income',
      avatar: 'https://cdn-icons-png.flaticon.com/512/5968/5968875.png',
    },
    {
      id: 8,
      name: 'Grab Ride',
      time: '2 days ago',
      amount: -5.2,
      type: 'expense',
      avatar: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
    },
    {
      id: 9,
      name: 'YouTube Premium',
      time: '2 days ago',
      amount: -3,
      type: 'expense',
      avatar: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    },
    {
      id: 10,
      name: 'Transfer from David',
      time: '3 days ago',
      amount: 220,
      type: 'income',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
  ];

  const info = () => {
    return (
      <View style={styles.cardPrimary}>
        <View style={styles.cardHeader}>
          <Text style={{ color: colors.black }}>Tài khoản thanh toán</Text>
          <Icon
            type="ionicon"
            name="eye-outline"
            size={18}
            color={colors.black}
          />
        </View>
        <Text style={styles.balance}>{money(balance)}</Text>
        <View style={styles.quickRow}>
          <QuickAction
            icon="swap-horizontal"
            label="Chuyển tiền"
            // @ts-ignore
            onPress={() => navigation.navigate('TransferMoney', { balance })}
          />
          <QuickAction
            icon="qr-code-outline"
            label="QR Pay"
            onPress={() => {}}
          />
          <QuickAction
            icon="wallet-outline"
            label="Nạp tiền"
            onPress={() => {}}
          />
          <QuickAction icon="card-outline" label="Thẻ" onPress={() => {}} />
        </View>
      </View>
    );
  };

  const renderItem = (item: any) => {
    return (
      <View style={styles.quickItem}>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            marginHorizontal: 8,
            padding: 16,
          }}
        >
          <Image
            style={{ width: 60, height: 60, borderRadius: 50 }}
            source={{ uri: item.avatar }}
          />
          <Text>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransaction = (item: any) => {
    const getAmountColor = (isIncome: boolean) => {
      return isIncome ? 'green' : 'red';
    };
    return (
      <View style={styles.txnRow}>
        <Image
          style={{ width: 40, height: 40, borderRadius: 50 }}
          source={{ uri: item.avatar }}
        />
        <View style={styles.txnContent}>
          <Text style={styles.txnTitle}>{item.name}</Text>
          <Text style={styles.txnTime}>{item.time}</Text>
        </View>
        <Text
          style={[
            styles.txnAmount,
            { color: getAmountColor(item.type === 'income') },
          ]}
        >
          {money(item.amount)}
        </Text>
      </View>
    );
  };

  const quickSend = () => {
    return (
      <View style={styles.vwQuickSend}>
        <Text style={styles.quickSendTitle}>QuickSend</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={quickSendList}
          renderItem={({ item }) => renderItem(item)}
        />
        <Text style={styles.quickSendTitle}>Lịch sử giao dịch</Text>
        <FlatList
          style={{ marginTop: 16 }}
          showsVerticalScrollIndicator={false}
          data={transactions}
          renderItem={({ item }) => renderTransaction(item)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {info()}
      {quickSend()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardPrimary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
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
  quickItem: {
    alignItems: 'center',
    flexDirection: 'row',
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  pillLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  pillValue: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 12,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  txnIcon: {
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  txnTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  txnTime: {
    fontSize: 12,
    color: '#888',
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  vwQuickSend: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  quickSendTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  txnContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'column',
  },
});

export default BankScreen;
