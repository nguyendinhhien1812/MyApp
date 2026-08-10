import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { QuickAction } from './components';
import { StackScreenProps } from '@react-navigation/stack';
import SubHeader from '../../components/UI/SubHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

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
};

const transactions: Transaction[] = [
  { id: 1,  name: 'Transfer from Elly',  time: '02:45', dateGroup: 'Hôm nay',      amount: 450000,   type: 'income' },
  { id: 2,  name: 'Spotify Premium',     time: '01:10', dateGroup: 'Hôm nay',      amount: -8000,    type: 'expense' },
  { id: 3,  name: 'Coffee at Highland',  time: '11:32', dateGroup: 'Hôm nay',      amount: -35000,   type: 'expense' },
  { id: 4,  name: 'Lương tháng 11',      time: '09:00', dateGroup: 'Hôm nay',      amount: 12000000, type: 'income' },
  { id: 5,  name: 'Tiền điện',           time: '08:00', dateGroup: 'Hôm qua',      amount: -350000,  type: 'expense' },
  { id: 6,  name: 'Chuyển tiền cho mẹ', time: '07:30', dateGroup: 'Hôm qua',      amount: -1000000, type: 'expense' },
  { id: 7,  name: 'Zalopay Cashback',    time: '06:00', dateGroup: 'Hôm qua',      amount: 150000,   type: 'income' },
  { id: 8,  name: 'Grab Ride',           time: '05:00', dateGroup: '2 ngày trước', amount: -52000,   type: 'expense' },
  { id: 9,  name: 'YouTube Premium',     time: '04:00', dateGroup: '2 ngày trước', amount: -30000,   type: 'expense' },
  { id: 10, name: 'Transfer from David', time: '10:00', dateGroup: '2 ngày trước', amount: 2200000,  type: 'income' },
];

const BankScreen = ({ navigation }: BankScreenProps) => {
  const { t } = useLanguage();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
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

  const ListHeader = (
    <View>
      {/* Khối số dư nền tối */}
      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>{t.bank.balance}</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? money(balance) : '• • • • • •'}
          </Text>
          <TouchableOpacity onPress={() => setBalanceVisible(v => !v)} hitSlop={8}>
            <Text style={styles.balanceToggle}>
              {balanceVisible ? t.bank.hide : t.bank.show}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <QuickAction
            icon="data-transfer-both"
            label={t.bank.transfer}
            // @ts-ignore route params
            onPress={() => navigation.navigate('TransferMoney', { balance })}
          />
          <QuickAction icon="qr-code"     label={t.bank.qrPay} onPress={() => navigation.navigate('QRPay' as never)} />
          <QuickAction icon="wallet"      label={t.bank.topUp} onPress={() => navigation.navigate('TopUp' as never)} />
          <QuickAction icon="credit-card" label={t.bank.card}  onPress={() => navigation.navigate('CardManagement' as never)} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Gửi nhanh */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.bank.quickSend}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllContacts' as never)}>
            <Text style={styles.seeAll}>{t.bank.viewAll}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSendRow}
        >
          {quickSendList.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.contactItem}
              onPress={() =>
                // @ts-ignore route params
                navigation.navigate('TransferMoney', {
                  balance,
                  contact: { name: item.name, avatar: item.avatar },
                })
              }
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>{item.name.charAt(0)}</Text>
              </View>
              <Text style={styles.contactName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* Lịch sử giao dịch + filter */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.bank.history}</Text>
          <View style={styles.filterRow}>
            {FILTERS.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
                onPress={() => setActiveFilter(i)}
              >
                <Text style={[styles.filterLabel, activeFilter === i && styles.filterLabelActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubHeader title={t.bank.title} onBack={() => navigation.goBack()} />
      <FlatList
        data={groupedTx}
        keyExtractor={item => item.dateGroup}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: group, index: gi }) => (
          <View style={[styles.txGroup, gi > 0 && { marginTop: SPACING.s4 }]}>
            <Text style={styles.dateGroup}>{group.dateGroup}</Text>
            {group.data.map(tx => {
              const pos = tx.type === 'income';
              const color = pos ? c.success : c.danger;
              return (
                <View key={tx.id} style={styles.txRow}>
                  <View
                    style={[
                      styles.txSign,
                      { backgroundColor: pos ? 'rgba(26,122,64,0.12)' : 'rgba(192,57,43,0.12)' },
                    ]}
                  >
                    <Text style={[styles.txSignText, { color }]}>{pos ? '+' : '–'}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txName} numberOfLines={1}>{tx.name}</Text>
                    <Text style={styles.txTime}>{tx.time}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color }]}>
                    {pos ? '+' : '-'}{money(tx.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default BankScreen;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.bg },
    listContent: { paddingBottom: 100 },

    // Khối số dư nền tối
    balanceBlock: {
      backgroundColor: c.heroDark,
      paddingHorizontal: SPACING.screenX,
      paddingVertical: SPACING.s4,
      gap: SPACING.s2,
    },
    balanceLabel: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: c.accent300,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: SPACING.s3,
    },
    balanceAmount: {
      fontFamily: FONT.medium,
      fontSize: 30,
      lineHeight: 34,
      color: c.offWhite,
    },
    balanceToggle: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      color: c.accent300,
      textDecorationLine: 'underline',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: SPACING.s2,
      marginTop: SPACING.s2,
    },

    // Body
    body: {
      paddingHorizontal: SPACING.screenX,
      paddingTop: SPACING.s4,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.s3,
    },
    sectionTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
    seeAll: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.accent700 },

    quickSendRow: { gap: SPACING.s4, paddingRight: SPACING.screenX },
    contactItem: { alignItems: 'center', gap: 6 },
    contactAvatar: {
      width: 44,
      height: 44,
      borderRadius: RADII.pill,
      borderWidth: 1,
      borderColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactInitial: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.accent700 },
    contactName: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.divider,
      marginVertical: SPACING.s4,
    },

    filterRow: { flexDirection: 'row', gap: 6 },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: RADII.chip,
      backgroundColor: c.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    filterChipActive: { backgroundColor: c.accent100, borderColor: c.accent100 },
    filterLabel: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext },
    filterLabelActive: { fontFamily: FONT.medium, color: c.accent700 },

    // Transaction list
    txGroup: { paddingHorizontal: SPACING.screenX, gap: SPACING.s2 },
    dateGroup: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: c.muted,
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s3,
      paddingBottom: SPACING.s2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.divider,
    },
    txSign: {
      width: 34,
      height: 34,
      borderRadius: RADII.item,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    txSignText: { fontFamily: FONT.semibold, fontSize: TYPE.body },
    txInfo: { flex: 1, minWidth: 0 },
    txName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
    txTime: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 1 },
    txAmount: { fontFamily: FONT.medium, fontSize: TYPE.body, flexShrink: 0 },
  });
