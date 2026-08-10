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
import AppIcon from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import { AppSnackbar } from '../../components/UI';
import SubHeader from '../../components/UI/SubHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

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
      <SubHeader
        title={t.contacts.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setToast(t.common.demoFeature)} hitSlop={8}>
            <AppIcon type={ICON_TYPE.Iconoir} name="user-plus" size={20} color={colors.accent700} />
          </TouchableOpacity>
        }
      />

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
                    <Icon type="ionicon" name="add" size={18} color={colors.accent} />
                  </View>
                  <Text style={[styles.recentName, { color: colors.accent }]}>{t.contacts.add}</Text>
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

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: SPACING.screenX,
    marginTop: SPACING.s3,
    marginBottom: SPACING.s2,
    backgroundColor: c.white,
    borderRadius: RADII.item,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.text,
    paddingVertical: 0,
  },

  listContent: { paddingHorizontal: SPACING.screenX, paddingBottom: 120 },
  sectionTitle: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginBottom: SPACING.s3,
    marginTop: SPACING.s2,
  },

  // Recent
  recentList: { gap: SPACING.s4, marginBottom: SPACING.s4 },
  recentItem: { alignItems: 'center', gap: 5 },
  recentAvatarWrap: { position: 'relative' },
  recentAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: c.accent,
  },
  recentName: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.subtext, maxWidth: 56, textAlign: 'center' },
  recentAmount: { fontFamily: FONT.regular, fontSize: 10, color: c.muted, textAlign: 'center' },
  addAvatarBtn: {
    width: 52,
    height: 52,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Contact list
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s3,
    backgroundColor: c.white,
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
  },
  contactRowFirst: { borderTopLeftRadius: RADII.card, borderTopRightRadius: RADII.card },
  contactRowLast: { borderBottomLeftRadius: RADII.card, borderBottomRightRadius: RADII.card },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginLeft: 72 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: c.accent,
  },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  contactBank: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, marginTop: 3 },
  contactRight: { alignItems: 'flex-end', gap: 5 },
  contactAmount: { fontFamily: FONT.semibold, fontSize: TYPE.caption, color: c.danger },
  sendAgainBtn: {
    backgroundColor: c.accent100,
    borderRadius: RADII.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sendAgainText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },

  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  emptyText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.muted },
});
