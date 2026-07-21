import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SkillsScreen from '../container/Skills';
import SkillDetail from '../container/Skills/screen/SkillDetail';

const Stack = createStackNavigator();

const SkillNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="SkillsHome">
    <Stack.Screen name="SkillsHome" component={SkillsScreen} />
    <Stack.Screen name="SkillDetail" component={SkillDetail} />
  </Stack.Navigator>
);

export default SkillNavigator;
