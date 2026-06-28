import { Icon } from '@rneui/themed';
import React, { useState } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';

interface BankScreenProps extends StackScreenProps<{}> {}

const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.abs(n));

const quickSendList = [
  { id: 1, name: 'John',   avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: 2, name: 'Kevin',  avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, name: 'Lyda',   avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 4, name: 'Marry',  avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 5, name: 'Evelyn', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
];

type Transaction = {
  id: number;
  name: string;
  time: string;
  dateGroup: string;
  amount: number;
  type: 'income' | 'expense';
  icon: string;
  iconBg: string;
  iconColor: string;
};

const transactions: Transaction[] = [
  { id: 1,  name: 'Transfer from Elly',  time: '02:45 CH', dateGroup: 'Hôm nay',      amount: 450000,   type: 'income',  icon: 'arrow-down-outline',    iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  { id: 2,  name: 'Spotify Premium',     time: '01:10 CH', dateGroup: 'Hôm nay',      amount: -8000,    type: 'expense', icon: 'musical-notes-outline', iconBg: '#f5f0ff', iconColor: '#6c3fc4' },
  { id: 3,  name: 'Coffee at Highland',  time: '11:32 SA', dateGroup: 'Hôm nay',      amount: -35000,   type: 'expense', icon: 'cafe-outline',          iconBg: '#fff4e8', iconColor: PRIMARY_DARK },
  { id: 4,  name: 'Lương tháng 11',      time: '09:00 SA', dateGroup: 'Hôm nay',      amount: 12000000, type: 'income',  icon: 'briefcase-outline',     iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  { id: 5,  name: 'Tiền điện',           time: '08:00 SA', dateGroup: 'Hôm qua',      amount: -350000,  type: 'expense', icon: 'flash-outline',         iconBg: '#fff8e8', iconColor: '#c07800' },
  { id: 6,  name: 'Chuyển tiền cho mẹ', time: '07:30 SA', dateGroup: 'Hôm qua',      amount: -1000000, type: 'expense', icon: 'heart-outline',         iconBg: '#fff0f0', iconColor: '#c0392b' },
  { id: 7,  name: 'Zalopay Cashback',    time: '06:00 SA', dateGroup: 'Hôm qua',      amount: 150000,   type: 'income',  icon: 'gift-outline',          iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  { id: 8,  name: 'Grab Ride',           time: '05:00 CH', dateGroup: '2 ngày trước', amount: -52000,   type: 'expense', icon: 'car-outline',           iconBg: '#e8f0f8', iconColor: '#1a4a7a' },
  { id: 9,  name: 'YouTube Premium',     time: '04:00 CH', dateGroup: '2 ngày trước', amount: -30000,   type: 'expense', icon: 'play-circle-outline',   iconBg: '#fff0f0', iconColor: '#c0392b' },
  { id: 10, name: 'Transfer from David', time: '10:00 SA', dateGroup: '2 ngày trước', amount: 2200000,  type: 'income',  icon: 'arrow-down-outline',    iconBg: '#e8f8f0', iconColor: '#1a7a40' },
];

// FILTERS built inside component using t

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.accentBar} />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const BankScreen = ({ navigation }: BankScreenProps) => {
  const { t } = useLanguage();
  const FILTERS = [t.bank.filterAll, t.bank.filterIn, t.bank.filterOut];
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0); // 0=all, 1=in, 2=out

  const balance = 1000000000;

  const filteredTx = transactions.filter(tx => {
    if (activeFilter === 1) return tx.type === 'income';
    if (activeFilter === 2) return tx.type === 'expense';
    return true;
  });

  const groupedTx = filteredTx.reduce<{ dateGroup: string; data: Transaction[] }[]>(
    (acc, tx) => {
      const group = acc.find(g => g.dateGroup === tx.dateGroup);
      if (group) { group.data.push(tx); }
      else { acc.push({ dateGroup: tx.dateGroup, data: [tx] }); }
      return acc;
    },
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Dải cam absolute phía sau — tạo hiệu ứng card nổi trên nền cam */}
        <View style={styles.orangeBg} />

        {/* Header row */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon type="ionicon" name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.bank.title}</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon type="ionicon" name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── PHẦN CỐ ĐỊNH (không scroll) ── */}

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>{t.bank.balance}</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(v => !v)}>
              <Icon
                type="ionicon"
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#bbb"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? money(balance) : '• • • • • •'}
          </Text>
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon="swap-horizontal"
              label={t.bank.transfer}
              // @ts-ignore
              onPress={() => navigation.navigate('TransferMoney', { balance })}
            />
            <QuickAction icon="qr-code-outline" label={t.bank.qrPay}  onPress={() => navigation.navigate('QRPay' as never)} />
            <QuickAction icon="wallet-outline"  label={t.bank.topUp}  onPress={() => navigation.navigate('TopUp' as never)} />
            <QuickAction icon="card-outline"    label={t.bank.card}   onPress={() => navigation.navigate('CardManagement' as never)} />
          </View>
        </View>

        {/* Gửi nhanh */}
        <View style={styles.sectionHeader}>
          <SectionTitle title={t.bank.quickSend} />
          <TouchableOpacity onPress={() => navigation.navigate('AllContacts' as never)}>
            <Text style={styles.seeAll}>{t.bank.viewAll}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={quickSendList}
          keyExtractor={item => String(item.id)}
          style={styles.quickSendScroll}
          contentContainerStyle={styles.quickSendList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.contactItem}>
              <Image style={styles.contactAvatar} source={{ uri: item.avatar }} />
              <Text style={styles.contactName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* ── PHẦN SCROLL — transaction list (header gắn trong FlatList) ── */}
        <FlatList
          style={styles.txList}
          ListHeaderComponent={
            <View>
              <View style={styles.txListSectionHeader}>
                <SectionTitle title={t.bank.history} />
              </View>
              <View style={styles.filterRow}>
                {FILTERS.map((f, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.filterTab, activeFilter === i && styles.filterTabActive]}
                    onPress={() => setActiveFilter(i)}
                  >
                    <Text style={[styles.filterLabel, activeFilter === i && styles.filterLabelActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
          data={groupedTx}
          keyExtractor={item => item.dateGroup}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item: group, index: gi }) => (
            <View>
              <Text style={[styles.dateGroup, gi > 0 && { marginTop: 12 }]}>
                {group.dateGroup}
              </Text>
              <View style={styles.txCard}>
                {group.data.map((tx, i) => (
                  <View
                    key={tx.id}
                    style={[styles.txRow, i < group.data.length - 1 && styles.txBorder]}
                  >
                    <View style={[styles.txIconWrap, { backgroundColor: tx.iconBg }]}>
                      <Icon type="ionicon" name={tx.icon} size={18} color={tx.iconColor} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txName} numberOfLines={1}>{tx.name}</Text>
                      <Text style={styles.txTime}>{tx.time}</Text>
                    </View>
                    <Text style={tx.type === 'income' ? styles.amountPos : styles.amountNeg}>
                      {tx.type === 'income' ? '+' : '-'}{money(tx.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default BankScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
  },
  // Dải cam absolute — cao hơn header để card nổi lên trên nền cam
  orangeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: PRIMARY,
  },
  txList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  txListSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },
  quickSendScroll: {
    height: 90,   // avatar 52 + gap 6 + text 14 + padding
    flexGrow: 0,  // ngăn FlatList expand theo chiều dọc
  },
  quickSendList: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  contactItem: {
    alignItems: 'center',
    gap: 6,
  },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#f0c48a',
  },
  contactName: {
    fontSize: 11,
    color: '#555',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterLabel: {
    fontSize: 12,
    color: '#888',
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  txCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
  },
  dateGroup: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '500',
    marginBottom: 6,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  txBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  txTime: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 2,
  },
  amountPos: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a7a40',
  },
  amountNeg: {
    fontSize: 13,
    fontWeight: '500',
    color: '#c0392b',
  },

});
