import React, { Suspense } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import { Federated } from '@callstack/repack/client';
import { View, ActivityIndicator } from 'react-native';

const MainStack = createStackNavigator();

type MainRoute = {
  name: string;
  component: any;
  options?: any;
};

import BankNavigator from './BankNavigator';
import InvestmentNavigator from './InvestmentNavigator';
import ExpenseNavigator from './ExpenseNavigator';

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
