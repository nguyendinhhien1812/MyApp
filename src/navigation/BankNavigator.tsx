import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BankScreen from '../container/BankScreen';
import TransferMoney from '../container/BankScreen/screen/TransferMoney';
import QRPayScreen from '../container/QRPay';
import TopUpScreen from '../container/TopUp';
import CardManagementScreen from '../container/CardManagement';
import AllContactsScreen from '../container/AllContacts';
import InvestmentScreen from '../container/Investment';

const Stack = createStackNavigator();

const BankNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="BankScreen">
      <Stack.Screen name="BankScreen" component={BankScreen} />
      <Stack.Screen name="TransferMoney" component={TransferMoney} />
      <Stack.Screen name="QRPay" component={QRPayScreen} />
      <Stack.Screen name="TopUp" component={TopUpScreen} />
      <Stack.Screen name="CardManagement" component={CardManagementScreen} />
      <Stack.Screen name="AllContacts" component={AllContactsScreen} />
      <Stack.Screen name="Investment" component={InvestmentScreen} />
    </Stack.Navigator>
  );
};

export default BankNavigator;
