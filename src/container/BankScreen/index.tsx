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
import { BankStackParamList } from '../../navigation/BankNavigator';
import SubHeader from '../../components/UI/SubHeader';
import { useLanguage } from '../../context/LanguageContext';
import { Translations } from '../../i18n/translations';
import {
  DateGroup,
  getBalance,
  listTransactions,
  groupTransactionsByDate,
  listQuickSend,
} from '../../services/accountService';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { moneyAbs } from '../../utils/money';

interface BankScreenProps extends StackScreenProps<BankStackParamList, 'BankScreen'> {}


const dateGroupLabel = (group: DateGroup, t: Translations) => {
  switch (group) {
    case 'today':
      return t.common.today;
    case 'yesterday':
      return t.common.yesterday;
    case 'daysAgo2':
      return `2 ${t.common.daysAgo}`;
  }
};

const BankScreen = ({ navigation }: BankScreenProps) => {
  const { t } = useLanguage();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const FILTERS = [t.bank.filterAll, t.bank.filterIn, t.bank.filterOut];
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0); // 0=all, 1=in, 2=out

  const balance = getBalance();

  const filteredTx = listTransactions(
    activeFilter === 1 ? { type: 'income' } : activeFilter === 2 ? { type: 'expense' } : undefined,
  );

  const groupedTx = groupTransactionsByDate(filteredTx);

  const ListHeader = (
    <View>
      {/* Khối số dư nền tối */}
      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>{t.bank.balance}</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? moneyAbs(balance) : '• • • • • •'}
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
            onPress={() => navigation.navigate('TransferMoney', { balance })}
          />
          <QuickAction icon="qr-code"     label={t.bank.qrPay} onPress={() => navigation.navigate('QRPay')} />
          <QuickAction icon="wallet"      label={t.bank.topUp} onPress={() => navigation.navigate('TopUp')} />
          <QuickAction icon="credit-card" label={t.bank.card}  onPress={() => navigation.navigate('CardManagement')} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Gửi nhanh */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.bank.quickSend}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllContacts')}>
            <Text style={styles.seeAll}>{t.bank.viewAll}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSendRow}
        >
          {listQuickSend().map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.contactItem}
              onPress={() =>
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
            <Text style={styles.dateGroup}>{dateGroupLabel(group.dateGroup, t)}</Text>
            {group.data.map(tx => {
              const pos = tx.type === 'income';
              const color = pos ? c.success : c.danger;
              return (
                <View key={tx.id} style={styles.txRow}>
                  <View
                    style={[styles.txSign, pos ? styles.txSignPos : styles.txSignNeg]}
                  >
                    <Text style={[styles.txSignText, { color }]}>{pos ? '+' : '–'}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txName} numberOfLines={1}>{tx.name}</Text>
                    <Text style={styles.txTime}>{tx.time}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color }]}>
                    {pos ? '+' : '-'}{moneyAbs(tx.amount)}
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
  // Xanh lãi / đỏ lỗ: màu semantic cố định, không đổi theo chế độ
  txSignPos: { backgroundColor: 'rgba(26,122,64,0.12)' },
  txSignNeg: { backgroundColor: 'rgba(192,57,43,0.12)' },

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
      borderWidth: 1,
      borderColor: c.borderStrong,
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
