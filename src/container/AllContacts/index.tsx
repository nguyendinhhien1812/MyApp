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
import { Translations } from '../../i18n/translations';
import {
  RelativeTime,
  searchContacts,
  recentContacts,
} from '../../services/contactService';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { money, shortMoney } from '../../utils/money';


const lastSeenLabel = (rt: RelativeTime, t: Translations) => {
  const one = rt.value === 1;
  const unit =
    rt.unit === 'days' ? (one ? t.common.dayAgo : t.common.daysAgo)
    : rt.unit === 'weeks' ? (one ? t.common.weekAgo : t.common.weeksAgo)
    : one ? t.common.monthAgo : t.common.monthsAgo;
  return `${rt.value} ${unit}`;
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

  const filtered = searchContacts(search);

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
                {recentContacts().map(item => (
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
                    <Text style={styles.recentName}>{item.shortName}</Text>
                    <Text style={styles.recentAmount}>-{shortMoney(item.lastAmount, { trim: true })}</Text>
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
        ItemSeparatorComponent={Separator}
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
              <Text style={styles.contactBank}>{item.bank} · {lastSeenLabel(item.lastSeen, t)}</Text>
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

// Ở module scope chứ không lồng trong màn. Nó cần màu theo theme nên tự gọi
// useThemeColors thay vì nhận styles qua props — FlatList không cho truyền
// props tuỳ ý vào ItemSeparatorComponent.
const Separator = () => {
  const c = useThemeColors();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: c.divider,
        marginLeft: 72,
      }}
    />
  );
};

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
