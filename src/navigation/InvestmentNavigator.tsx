import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import InvestmentScreen from '../container/Investment';

const Stack = createStackNavigator();

const InvestmentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="InvestmentHome">
      <Stack.Screen name="InvestmentHome" component={InvestmentScreen} />
    </Stack.Navigator>
  );
};

export default InvestmentNavigator;
