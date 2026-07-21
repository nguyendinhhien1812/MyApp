import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { AppSnackbar } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';

const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const RECENT = [
  { id: 1, name: 'John', avatar: 'https://i.pravatar.cc/80?img=1', lastAmount: 500000 },
  { id: 2, name: 'Kevin', avatar: 'https://i.pravatar.cc/80?img=12', lastAmount: 200000 },
  { id: 3, name: 'Lyda', avatar: 'https://i.pravatar.cc/80?img=5', lastAmount: 1000000 },
  { id: 4, name: 'Marry', avatar: 'https://i.pravatar.cc/80?img=9', lastAmount: 300000 },
  { id: 5, name: 'Evelyn', avatar: 'https://i.pravatar.cc/80?img=20', lastAmount: 150000 },
];

const ALL_CONTACTS = [
  { id: 1, name: 'John Smith', bank: 'Vietcombank', daysAgo: '2 ngày trước', lastAmount: 500000, avatar: 'https://i.pravatar.cc/80?img=1' },
  { id: 2, name: 'Kevin Brown', bank: 'Techcombank', daysAgo: '4 ngày trước', lastAmount: 200000, avatar: 'https://i.pravatar.cc/80?img=12' },
  { id: 3, name: 'Lyda Hansen', bank: 'BIDV', daysAgo: '5 ngày trước', lastAmount: 1000000, avatar: 'https://i.pravatar.cc/80?img=5' },
  { id: 4, name: 'Marry White', bank: 'ACB', daysAgo: '1 tuần trước', lastAmount: 300000, avatar: 'https://i.pravatar.cc/80?img=9' },
  { id: 5, name: 'Evelyn Davis', bank: 'MB Bank', daysAgo: '2 tuần trước', lastAmount: 150000, avatar: 'https://i.pravatar.cc/80?img=20' },
  { id: 6, name: 'Michael Lee', bank: 'TPBank', daysAgo: '3 tuần trước', lastAmount: 800000, avatar: 'https://i.pravatar.cc/80?img=3' },
  { id: 7, name: 'Sarah Kim', bank: 'Sacombank', daysAgo: '1 tháng trước', lastAmount: 450000, avatar: 'https://i.pravatar.cc/80?img=47' },
];

const formatAmount = (n: number) => {
  if (n >= 1000000) return `${n / 1000000}tr`;
  return `${n / 1000}k`;
};

interface Props {
  navigation: any;
}

const AllContactsScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const filtered = ALL_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.contacts.title}</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setToast(t.common.demoFeature)}>
          <Icon type="ionicon" name="person-add-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Icon type="ionicon" name="search-outline" size={16} color={colors.subtext} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.contacts.searchPlaceholder}
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon type="ionicon" name="close-circle" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          search.length === 0 ? (
            <View>
              {/* Recent */}
              <Text style={styles.sectionTitle}>{t.contacts.recent}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}>
                {RECENT.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentItem}
                    onPress={() =>
                      navigation.navigate('TransferMoney', {
                        contact: { name: item.name, avatar: item.avatar },
                      })
                    }>
                    <View style={styles.recentAvatarWrap}>
                      <Image source={{ uri: item.avatar }} style={styles.recentAvatar} />
                    </View>
                    <Text style={styles.recentName}>{item.name}</Text>
                    <Text style={styles.recentAmount}>-{formatAmount(item.lastAmount)}</Text>
                  </TouchableOpacity>
                ))}
                {/* Add new */}
                <TouchableOpacity
                  style={styles.recentItem}
                  onPress={() => setToast(t.common.demoFeature)}>
                  <View style={styles.addAvatarBtn}>
                    <Icon type="ionicon" name="add" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.recentName, { color: colors.primary }]}>{t.contacts.add}</Text>
                  <Text style={styles.recentAmount}> </Text>
                </TouchableOpacity>
              </ScrollView>

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>{t.contacts.all}</Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.contactRow,
              index === 0 && styles.contactRowFirst,
              index === filtered.length - 1 && styles.contactRowLast,
            ]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactBank}>{item.bank} · {item.daysAgo}</Text>
            </View>
            <View style={styles.contactRight}>
              <Text style={styles.contactAmount}>-{money(item.lastAmount)}</Text>
              <TouchableOpacity
                style={styles.sendAgainBtn}
                onPress={() =>
                  navigation.navigate('TransferMoney', {
                    contact: { name: item.name, bank: item.bank, avatar: item.avatar },
                  })
                }>
                <Text style={styles.sendAgainText}>{t.contacts.sendAgain}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon type="ionicon" name="search-outline" size={32} color={colors.muted} />
            <Text style={styles.emptyText}>{t.contacts.empty}</Text>
          </View>
        }
      />

      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone="default"
        duration={1800}
      />
    </SafeAreaView>
  );
};

export default AllContactsScreen;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  header: {
    backgroundColor: c.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#fff' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 8,
    backgroundColor: c.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: c.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: c.text,
    paddingVertical: 0,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 10,
    color: c.subtext,
    letterSpacing: 0.6,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 4,
  },

  // Recent
  recentList: { gap: 16, marginBottom: 16 },
  recentItem: { alignItems: 'center', gap: 5 },
  recentAvatarWrap: { position: 'relative' },
  recentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
  },
  recentName: { fontSize: 11, color: c.subtext, fontWeight: '500', maxWidth: 56, textAlign: 'center' },
  recentAmount: { fontSize: 10, color: c.subtext, textAlign: 'center' },
  addAvatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Contact list
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  contactRowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  contactRowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  separator: { height: 0.5, backgroundColor: c.divider, marginLeft: 72 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '500', color: c.text },
  contactBank: { fontSize: 11, color: c.subtext, marginTop: 3 },
  contactRight: { alignItems: 'flex-end', gap: 5 },
  contactAmount: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  sendAgainBtn: {
    backgroundColor: c.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
  },
  sendAgainText: { fontSize: 11, color: c.primaryDark, fontWeight: '500' },

  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  emptyText: { fontSize: 14, color: c.muted },
});
