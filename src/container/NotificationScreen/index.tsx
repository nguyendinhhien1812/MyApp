import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { Translations } from '../../i18n/translations';
import {
  NotifKey,
  NotifTime,
  Notification,
  listNotifications,
} from '../../services/notificationService';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT, TAB_BAR_SPACE } from '../../theme/tokens';

// Icon và màu là phần trình bày, tra theo khoá thông báo.
const NOTIF_VISUALS: Record<NotifKey, { icon: string; iconBg: string; iconColor: string }> = {
  transferOut:  { icon: 'arrow-up-circle-outline',   iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  receiveMoney: { icon: 'arrow-down-circle-outline', iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  security:     { icon: 'shield-checkmark-outline',  iconBg: '#fff4e8', iconColor: '#b36a1a' },
  salary:       { icon: 'briefcase-outline',         iconBg: '#e8f8f0', iconColor: '#1a7a40' },
  spotify:      { icon: 'musical-notes-outline',     iconBg: '#f5f0ff', iconColor: '#6c3fc4' },
  promo:        { icon: 'gift-outline',              iconBg: '#fdf3e7', iconColor: '#b36a1a' },
};

const formatTime = (time: NotifTime, t: Translations) => {
  switch (time.unit) {
    case 'yesterday':
      return t.common.yesterday;
    case 'minutes':
      return `${time.value} ${t.common.minutesAgo}`;
    case 'hours':
      return `${time.value} ${t.common.hoursAgo}`;
    case 'days':
      return `${time.value} ${t.common.daysAgo}`;
  }
};

const NotificationScreen = () => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState(0); // 0=all, 1=read, 2=unread
  const [notifications, setNotifications] = useState<Notification[]>(listNotifications());

  const filters = [
    t.notification.filterAll,
    t.notification.filterRead,
    t.notification.filterUnread,
  ];

  const filtered = notifications.filter(item => {
    if (activeFilter === 1) {return item.isRead;}
    if (activeFilter === 2) {return !item.isRead;}
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  const markRead = (id: number) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.notification.title}</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} {t.notification.filterUnread.toLowerCase()}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={markAllRead}>
            <Icon type="ionicon" name="checkmark-done-outline" size={20} color={colors.accent700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Setting' as never)}>
            <Icon type="ionicon" name="settings-outline" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
            onPress={() => setActiveFilter(i)}>
            <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon type="ionicon" name="notifications-off-outline" size={32} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>{t.notification.empty}</Text>
            <Text style={styles.emptyDesc}>{t.notification.emptyDesc}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const text = t.notification.items[item.key];
          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => markRead(item.id)}
              style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}>
              {/* Icon */}
              <View style={[styles.notifIcon, { backgroundColor: NOTIF_VISUALS[item.key].iconBg }]}>
                <Icon type="ionicon" name={NOTIF_VISUALS[item.key].icon} size={20} color={NOTIF_VISUALS[item.key].iconColor} />
              </View>

              {/* Content */}
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                    {text.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {text.body}
                </Text>
                <Text style={styles.notifTime}>{formatTime(item.time, t)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

// Ở module scope chứ không lồng trong màn: khoảng cách này không phụ thuộc
// theme, nên không cần đóng trên bất cứ thứ gì của component cha.
const Separator = () => <View style={separatorStyle.gap} />;

const separatorStyle = StyleSheet.create({ gap: { height: 8 } });

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: SPACING.s4,
    paddingBottom: SPACING.s3,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 26, color: c.text },
  headerSub: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: RADII.chip,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SPACING.screenX,
    marginBottom: SPACING.s3,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: c.borderStrong,
    backgroundColor: c.white,
  },
  filterChipActive: {
    backgroundColor: c.accent100,
    borderColor: c.accent100,
  },
  filterText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext },
  filterTextActive: { fontFamily: FONT.medium, color: c.accent700 },

  listContent: { paddingHorizontal: SPACING.screenX, paddingBottom: TAB_BAR_SPACE },

  notifRow: {
    flexDirection: 'row',
    gap: SPACING.s3,
    backgroundColor: c.white,
    borderRadius: RADII.card,
    padding: SPACING.s4,
    alignItems: 'flex-start',
  },
  notifRowUnread: {
    backgroundColor: c.accent100,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: RADII.item,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  notifTitle: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text, flex: 1 },
  notifTitleUnread: { fontFamily: FONT.semibold, color: c.accent700 },
  notifBody: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, lineHeight: 18 },
  notifTime: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, marginTop: 5 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.accent,
    marginLeft: 6,
    flexShrink: 0,
  },


  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: FONT.medium, fontSize: TYPE.itemTitle, color: c.subtext },
  emptyDesc: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.muted },
});
