import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationScreen from '../container/NotificationScreen';
import SettingScreen from '../container/SettingScreen';
import ProfileScreen from '../container/ProfileScreen';
import Icon from '../components/Icon';
import { ICON_TYPE } from '../components/Icon/style';
import HomeNavigator from './HomeNavigator';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../context/ThemeContext';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useLanguage();
  const colors = useThemeColors();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E89951',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 6,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarBadgeStyle: {
          fontSize: 10,
          minWidth: 16,
          height: 16,
          lineHeight: 16,
          top: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          elevation: 0,
          height: 80,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: string = '';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Notification':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Setting':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
            <Icon
              type={ICON_TYPE.Ionicons}
              name={iconName}
              size={24}
              color={focused ? '#E89951' : '#bbb'}
            />
          );
        },
      })}
      initialRouteName="Home"
    >
      <Tabs.Screen
        name="Home"
        component={HomeNavigator}
        options={{ tabBarLabel: t.tabs.home }}
      />
      <Tabs.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarLabel: t.tabs.notification,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="Setting"
        component={SettingScreen}
        options={{ tabBarLabel: t.tabs.setting }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t.tabs.profile }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;
