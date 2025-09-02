import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageProvider } from './contexts/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import LanguageScreen from './screens/LanguageScreen';
import UpgradeScreen from './screens/UpgradeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Upgrade"
            component={UpgradeScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
