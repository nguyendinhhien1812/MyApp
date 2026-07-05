import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';

const MainStack = createStackNavigator();

type MainRoute = {
  name: string;
  component: any;
  options?: any;
};

import BankNavigator from './BankNavigator';
import InvestmentNavigator from './InvestmentNavigator';
import ExpenseNavigator from './ExpenseNavigator';
import AboutScreen from '../container/About';
import WebViewScreen from '../container/WebView';
import LoginScreen from '../container/Login';
import SkillNavigator from './SkillNavigator';
import EditProfileScreen from '../container/EditProfile';
import SecurityScreen from '../container/Security';
import TermsScreen from '../container/Terms';

const MainNavigator = () => {
  const navigators = [
    {
      name: 'HomeTabs',
      component: TabNavigator,
    },
    {
      name: 'BankScreen',
      component: BankNavigator,
    },
    {
      name: 'InvestmentScreen',
      component: InvestmentNavigator,
    },
    {
      name: 'ExpenseScreen',
      component: ExpenseNavigator,
    },
    {
      name: 'AboutScreen',
      component: AboutScreen,
    },
    {
      name: 'WebViewScreen',
      component: WebViewScreen,
    },
    {
      name: 'LoginScreen',
      component: LoginScreen,
    },
    {
      name: 'SkillsScreen',
      component: SkillNavigator,
    },
    {
      name: 'EditProfileScreen',
      component: EditProfileScreen,
    },
    {
      name: 'SecurityScreen',
      component: SecurityScreen,
    },
    {
      name: 'TermsScreen',
      component: TermsScreen,
    },
  ];

  return (
    <MainStack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      {navigators.map(({ name, component, options }: MainRoute) => (
        <MainStack.Screen
          key={name}
          name={name}
          options={options}
          component={component}
        />
      ))}
    </MainStack.Navigator>
  );
};

export default MainNavigator;
