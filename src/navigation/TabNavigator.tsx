import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationScreen from '../container/NotificationScreen';
import SettingScreen from '../container/SettingScreen';
import ProfileScreen from '../container/ProfileScreen';
import HomeNavigator from './HomeNavigator';
import PillTabBar from './PillTabBar';
import { useLanguage } from '../context/LanguageContext';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <PillTabBar {...props} />}
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
