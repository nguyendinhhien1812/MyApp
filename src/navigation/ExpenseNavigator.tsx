import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExpenseScreen from '../container/Expense';
import ExpenseDetail from '../container/Expense/screen/ExpenseDetail';
import ExpenseStats from '../container/Expense/screen/ExpenseStats';

const Stack = createStackNavigator();

const ExpenseNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="ExpenseHome">
    <Stack.Screen name="ExpenseHome"   component={ExpenseScreen} />
    <Stack.Screen name="ExpenseDetail" component={ExpenseDetail} />
    <Stack.Screen name="ExpenseStats"  component={ExpenseStats} />
  </Stack.Navigator>
);

export default ExpenseNavigator;
