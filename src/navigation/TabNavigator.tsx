import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationScreen from '../container/NotificationScreen';
import SettingScreen from '../container/SettingScreen';
import ProfileScreen from '../container/ProfileScreen';
import Icon from '../components/Icon';
import { ICON_TYPE } from '../components/Icon/style';
import { useTheme } from '@rneui/themed';
import HomeNavigator from './HomeNavigator';
import { HomeScreen } from '../container';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  const colors = useTheme().theme.colors;

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          elevation: 0,
          height: 70,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
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
              color={focused ? colors.primary : colors.outline}
            />
          );
        },
      })}
      initialRouteName="Home"
    >
      <Tabs.Screen name="Home" component={HomeNavigator} />
      <Tabs.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen name="Setting" component={SettingScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
};

export default TabNavigator;
