import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BankScreen from '../container/BankScreen';
import TransferMoney from '../container/BankScreen/screen/TransferMoney';
import { useTheme } from '@rneui/themed';

const Stack = createStackNavigator();

type Route = {
  name: string;
  component: any;
  options?: any;
};

const BankNavigator = () => {
  const { colors } = useTheme().theme;
  const stackScreens = [
    {
      name: 'BankScreen',
      component: BankScreen,
      options: {
        title: 'Ngân hàng',
      },
    },
    {
      name: 'TransferMoney',
      component: TransferMoney,
      options: {
        title: 'Chuyển tiền',
      },
    },
  ];
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: 'Ngân hàng',
        headerStyle: { backgroundColor: colors.background },
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
        headerTitleStyle: { color: colors.warning },
        headerTintColor: colors.warning,
        headerLeftContainerStyle: {
          paddingHorizontal: 16,
        },
      }}
      initialRouteName="BankScreen"
    >
      {stackScreens.map(({ name, component, options }: Route) => (
        <Stack.Screen
          key={name}
          name={name}
          options={options}
          component={component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default BankNavigator;
