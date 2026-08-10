import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { ICON_TYPE } from '../components/Icon/style';
import { FONT, TYPE } from '../theme/tokens';

// Thanh điều hướng đáy dạng "pill nổi" theo design "Classical":
// nền tối #1a1815, tab đang chọn = pill trắng + icon/nhãn đen, tab khác chỉ icon mờ.
const DARK = '#1a1815';
const OFF_WHITE = '#fdfcfb';
const INACTIVE = 'rgba(253,252,251,0.55)';

const TAB_ICON: Record<string, string> = {
  Home: 'home',
  Notification: 'bell',
  Setting: 'settings',
  Profile: 'user',
};

const PillTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: (insets.bottom || 12) }]}
      pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string' ? options.tabBarLabel : route.name;
          const badge = options.tabBarBadge;

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
              onPress={onPress}
              activeOpacity={0.85}
              style={[styles.item, focused && styles.itemActive]}>
              <View>
                <Icon
                  type={ICON_TYPE.Iconoir}
                  name={TAB_ICON[route.name] ?? 'circle'}
                  size={22}
                  color={focused ? DARK : INACTIVE}
                />
                {badge != null ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              {focused ? <Text style={styles.label}>{label}</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PillTabBar;

const styles = StyleSheet.create({
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
    backgroundColor: DARK,
    borderRadius: 100,
    padding: 6,
    gap: 4,
    // Viền đồng mờ để thanh vẫn tách khỏi nền ở chế độ Tối
    borderWidth: 1,
    borderColor: 'rgba(216,183,131,0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 6,
  },
  itemActive: {
    backgroundColor: OFF_WHITE,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: TYPE.body,
    color: DARK,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5484d',
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
