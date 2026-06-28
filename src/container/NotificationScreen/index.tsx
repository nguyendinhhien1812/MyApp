import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../context/LanguageContext';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';

type NotifItem = {
  id: number;
  titleKey: string;
  contentKey: string;
  isRead: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  time: string;
};

const NOTIFICATIONS: NotifItem[] = [
  {
    id: 1,
    titleKey: 'Chuyển tiền thành công',
    contentKey: 'Bạn đã chuyển 500.000đ đến John Smith lúc 14:25.',
    isRead: false,
    icon: 'arrow-up-circle-outline',
    iconBg: '#e8f8f0',
    iconColor: '#1a7a40',
    time: '5 phút trước',
  },
  {
    id: 2,
    titleKey: 'Nhận tiền từ Kevin',
    contentKey: 'Kevin Brown đã chuyển 200.000đ vào tài khoản của bạn.',
    isRead: false,
    icon: 'arrow-down-circle-outline',
    iconBg: '#e8f8f0',
    iconColor: '#1a7a40',
    time: '32 phút trước',
  },
  {
    id: 3,
    titleKey: 'Cập nhật bảo mật',
    contentKey: 'Tài khoản của bạn vừa đăng nhập từ thiết bị mới.',
    isRead: false,
    icon: 'shield-checkmark-outline',
    iconBg: '#fff4e8',
    iconColor: PRIMARY_DARK,
    time: '2 giờ trước',
  },
  {
    id: 4,
    titleKey: 'Lương tháng 11',
    contentKey: 'Nhận 12.000.000đ từ Công ty ABC vào lúc 09:00.',
    isRead: true,
    icon: 'briefcase-outline',
    iconBg: '#e8f8f0',
    iconColor: '#1a7a40',
    time: 'Hôm qua',
  },
  {
    id: 5,
    titleKey: 'Thanh toán Spotify',
    contentKey: 'Đã thanh toán 59.000đ cho Spotify Premium.',
    isRead: true,
    icon: 'musical-notes-outline',
    iconBg: '#f5f0ff',
    iconColor: '#6c3fc4',
    time: 'Hôm qua',
  },
  {
    id: 6,
    titleKey: 'Khuyến mãi đặc biệt',
    contentKey: 'Chuyển tiền miễn phí toàn bộ trong tuần này. Áp dụng ngay!',
    isRead: true,
    icon: 'gift-outline',
    iconBg: PRIMARY_LIGHT,
    iconColor: PRIMARY_DARK,
    time: '2 ngày trước',
  },
];

const NotificationScreen = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(0); // 0=all, 1=read, 2=unread

  const filters = [
    t.notification.filterAll,
    t.notification.filterRead,
    t.notification.filterUnread,
  ];

  const filtered = NOTIFICATIONS.filter(item => {
    if (activeFilter === 1) return item.isRead;
    if (activeFilter === 2) return !item.isRead;
    return true;
  });

  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

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
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon type="ionicon" name="checkmark-done-outline" size={20} color={PRIMARY_DARK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon type="ionicon" name="settings-outline" size={20} color="#888" />
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon type="ionicon" name="notifications-off-outline" size={32} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>{t.notification.empty}</Text>
            <Text style={styles.emptyDesc}>{t.notification.emptyDesc}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}>
            {/* Icon */}
            <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
              <Icon type="ionicon" name={item.icon} size={20} color={item.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.notifContent}>
              <View style={styles.notifTitleRow}>
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                  {item.titleKey}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifBody} numberOfLines={2}>
                {item.contentKey}
              </Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: PRIMARY, fontWeight: '500', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterText: { fontSize: 12, color: '#888' },
  filterTextActive: { color: '#fff', fontWeight: '500' },

  listContent: { paddingHorizontal: 12, paddingBottom: 40 },

  notifRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  notifRowUnread: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 0.5,
    borderColor: '#f0c48a',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  notifTitle: { fontSize: 13, fontWeight: '500', color: '#1a1a1a', flex: 1 },
  notifTitleUnread: { fontWeight: '600', color: PRIMARY_DARK },
  notifBody: { fontSize: 12, color: '#888', lineHeight: 17 },
  notifTime: { fontSize: 11, color: '#bbb', marginTop: 5 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginLeft: 6,
    flexShrink: 0,
  },

  separator: { height: 8 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: '#888' },
  emptyDesc: { fontSize: 12, color: '#bbb' },
});
