import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../container/Home';
import BankScreen from '../container/BankScreen';

const HomeStack = createStackNavigator();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
