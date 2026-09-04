import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@rneui/themed';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../theme/paperTheme';
import { FONT } from '../theme/tokens';

// Thanh điều hướng đáy: mỗi mục là icon trên, nhãn dưới; mục đang chọn có ô bo tròn.
// Màu lấy qua useThemeColors vì thứ tự phân tầng đảo giữa 2 chế độ — nền sáng thì
// thanh phải trắng hơn nền, nền tối thì phải sáng hơn card mới nổi lên được.
const BAR_HEIGHT = 72;
const ICON_SIZE = 24;

// Badge là khối tự đủ (nền đỏ + chữ trắng) nên màu cố định, KHÔNG lấy c.danger:
// ở chế độ tối c.danger là đỏ sáng #f87171, chữ trắng lên đó chỉ còn 2.77:1.
const BADGE_RED = '#d63d42';

// Ionicons có sẵn cặp đặc/viền: mục đang chọn dùng bản đặc cho nặng nét hơn
const TAB_ICON: Record<string, string> = {
  Home: 'home',
  Notification: 'notifications',
  Setting: 'settings',
  Profile: 'person',
};

const PillTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom || 12 }]}
      pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string' ? options.tabBarLabel : route.name;
          const badge = options.tabBarBadge;
          const base = TAB_ICON[route.name] ?? 'ellipse';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              activeOpacity={0.75}
              style={[styles.item, focused && styles.itemActive]}>
              <View>
                <Icon
                  type="ionicon"
                  name={focused ? base : `${base}-outline`}
                  size={ICON_SIZE}
                  color={focused ? c.accent700 : c.subtext}
                />
                {badge != null ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, focused && styles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PillTabBar;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: BAR_HEIGHT,
      marginHorizontal: 16,
      paddingHorizontal: 8,
      backgroundColor: c.tabBar,
      borderRadius: BAR_HEIGHT / 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.tabBarBorder,
      // Bóng chỉ có tác dụng ở nền sáng; nền tối đã dùng chênh lệch màu để tách tầng
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
      elevation: 8,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingVertical: 8,
      borderRadius: 22,
    },
    itemActive: {
      backgroundColor: c.tabBarActiveBg,
    },
    label: {
      fontFamily: FONT.medium,
      fontSize: 11,
      color: c.subtext,
    },
    labelActive: {
      color: c.accent700,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -9,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: BADGE_RED,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      fontFamily: FONT.semibold,
      fontSize: 10,
      color: '#fff',
    },
  });
