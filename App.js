import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { View, Image, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { appWidth, appHeight } from './utils/layout';
import { useFonts } from 'expo-font';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import LanguageScreen from './screens/LanguageScreen';
import ColorScreen from './screens/ColorScreen';
import UpgradeScreen from './screens/UpgradeScreen';
import InstallScreen from './screens/InstallScreen';
import PartyScreen from './screens/PartyScreen';
import KnowMeScreen from './screens/KnowMeScreen';

const Stack = createStackNavigator();

// Native splash will auto-hide when JS is ready; we overlay our own animation.

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });
  const [overlayVisible, setOverlayVisible] = React.useState(true);
  const hasAnimatedRef = React.useRef(false);

  // Animated values for glass scale/opacity
  const glassScale = React.useRef(new Animated.Value(0.6)).current;
  const glassOpacity = React.useRef(new Animated.Value(0)).current;

  // Confetti setup
  const screenWidth = appWidth;
  const screenHeight = appHeight;
  const confettiCount = 24;
  const confettiColors = ['#8B5CF6', '#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24'];
  const glassSize = screenWidth * 0.5;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const confetti = React.useMemo(() =>
    Array.from({ length: confettiCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const burstRadius = (glassSize * 0.35) * (0.4 + Math.random() * 0.6);
      const dx = Math.cos(angle) * burstRadius;
      const dy = Math.sin(angle) * burstRadius + screenHeight * (0.28 + Math.random() * 0.18);
      return {
        id: i,
        size: 6 + Math.random() * 8,
        color: confettiColors[i % confettiColors.length],
        delay: Math.random() * 280,
        duration: 1400 + Math.random() * 900,
        rotate: 360 + Math.random() * 540,
        dx,
        dy,
      };
    }),
  [screenWidth, screenHeight]);

  const confettiAnims = React.useRef(
    confetti.map(() => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const runConfetti = React.useCallback(() => {
    const animations = confetti.map((item, idx) => {
      const { translateX, translateY, rotate, opacity } = confettiAnims[idx];
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      opacity.setValue(0);
      return Animated.parallel([
        Animated.timing(translateX, {
          toValue: item.dx,
          duration: item.duration,
          delay: item.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: item.dy,
          duration: item.duration,
          delay: item.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: item.rotate,
          duration: item.duration,
          delay: item.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 260,
            delay: item.delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 360,
            delay: Math.max(0, item.duration - 460),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    Animated.stagger(20, animations).start();
  }, [confetti, confettiAnims]);

  const startOverlayAnimation = React.useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    glassScale.setValue(0.6);
    glassOpacity.setValue(0);

    // Failsafe: never leave the splash stuck (springs + native driver can hang on web)
    const failsafe = setTimeout(() => setOverlayVisible(false), 4500);
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.parallel([
        Animated.timing(glassOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.spring(glassScale, {
          toValue: 1.06,
          overshootClamping: false,
          useNativeDriver: useNative,
          speed: 10,
          bounciness: 7,
        }),
      ]),
      Animated.timing(glassScale, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      }),
      Animated.delay(280),
    ]).start(() => {
      // quick flourish
      runConfetti();
      Animated.timing(glassOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: useNative,
      }).start();
      const maxMs = Math.max(...confetti.map((c) => c.delay + c.duration));
      setTimeout(() => {
        clearTimeout(failsafe);
        setOverlayVisible(false);
      }, maxMs + 150);
    });
  }, [glassOpacity, glassScale, runConfetti, confetti]);

  const onLayoutRootView = React.useCallback(() => {
    if (fontsLoaded) {
      // Start overlay animation on first layout after fonts are ready
      startOverlayAnimation();
    }
  }, [fontsLoaded, startOverlayAnimation]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <ThemeProvider>
      <LanguageProvider>
        {/* On desktop browsers the app renders in a centered phone-width column */}
        <View style={styles.webFrame}>
        <View style={styles.root} onLayout={onLayoutRootView}>
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
              name="Color"
              component={ColorScreen}
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
            <Stack.Screen name="Party" component={PartyScreen} />
            <Stack.Screen name="KnowMe" component={KnowMeScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen
              name="Install"
              component={InstallScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
            </Stack.Navigator>
          </NavigationContainer>

          {overlayVisible && (
            <View style={styles.overlay} pointerEvents="auto">
              <Image
                source={require('./assets/placeholder-splash.png')}
                style={styles.overlayBg}
                resizeMode="cover"
              />
              <Animated.Image
                source={require('./assets/glass.png')}
                style={{
                  width: screenWidth * 0.5,
                  height: screenWidth * 0.5,
                  opacity: glassOpacity,
                  transform: [{ scale: glassScale }],
                  resizeMode: 'contain',
                }}
              />

              {/* Confetti */}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {confetti.map((item, idx) => {
                  const anims = confettiAnims[idx];
                  return (
                    <Animated.View
                      key={item.id}
                      style={{
                        position: 'absolute',
                        top: centerY,
                        left: centerX,
                        width: item.size,
                        height: item.size * 1.6,
                        backgroundColor: item.color,
                        borderRadius: 2,
                        opacity: anims.opacity,
                        transform: [
                          { translateX: anims.translateX },
                          { translateY: anims.translateY },
                          { rotate: anims.rotate.interpolate({
                            inputRange: [0, 360],
                            outputRange: ['0deg', '360deg'],
                          }) },
                        ],
                      }}
                    />
                  );
                })}
              </View>
            </View>
          )}
        </View>
        </View>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    backgroundColor: '#17171f',
    alignItems: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    ...(Platform.OS === 'web' ? { maxWidth: 480 } : null),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
