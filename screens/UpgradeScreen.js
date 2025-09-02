import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { PartyIcon } from '../components/GameModeIcons';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens, gradients } from '../theme/tokens';

const { width } = Dimensions.get('window');

// Premium Unlock Icon Component
const UnlockIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_4418_4786)">
        <Path 
          opacity="0.4" 
          d="M16.1899 8.86039C15.7999 8.86039 15.4899 8.55039 15.4899 8.16039V6.88039C15.4899 5.90039 15.0699 4.96039 14.3499 4.30039C13.6099 3.63039 12.6599 3.32039 11.6599 3.41039C9.97986 3.57039 8.50986 5.28039 8.50986 7.06039V7.96039C8.50986 8.35039 8.19986 8.66039 7.80986 8.66039C7.41986 8.66039 7.10986 8.35039 7.10986 7.96039V7.06039C7.10986 4.56039 9.12986 2.25039 11.5199 2.02039C12.9099 1.89039 14.2499 2.33039 15.2799 3.27039C16.2999 4.19039 16.8799 5.51039 16.8799 6.88039V8.16039C16.8799 8.55039 16.5699 8.86039 16.1899 8.86039Z" 
          fill={color}
        />
        <Path 
          d="M19.9602 8.96008C19.1202 8.03008 17.7402 7.58008 15.7202 7.58008H8.28023C6.26023 7.58008 4.88023 8.03008 4.04023 8.96008C3.07023 10.0401 3.10023 11.4801 3.21023 12.4801L3.91023 18.0501C4.12023 20.0001 4.91023 22.0001 9.21023 22.0001H14.7902C19.0902 22.0001 19.8802 20.0001 20.0902 18.0601L20.7902 12.4701C20.9002 11.4801 20.9302 10.0401 19.9602 8.96008ZM12.0002 18.5801C9.91023 18.5801 8.21023 16.8801 8.21023 14.7901C8.21023 12.7001 9.91023 11.0001 12.0002 11.0001C14.0902 11.0001 15.7902 12.7001 15.7902 14.7901C15.7902 16.8801 14.0902 18.5801 12.0002 18.5801Z" 
          fill={color}
        />
        <Path 
          opacity="0.4" 
          d="M12 18.58C14.0931 18.58 15.79 16.8832 15.79 14.79C15.79 12.6968 14.0931 11 12 11C9.9068 11 8.20996 12.6968 8.20996 14.79C8.20996 16.8832 9.9068 18.58 12 18.58Z" 
          fill={color}
        />
        <Path 
          d="M11.4299 16.64C11.2399 16.64 11.0499 16.57 10.8999 16.42L9.90988 15.43C9.61988 15.14 9.61988 14.66 9.90988 14.37C10.1999 14.08 10.6799 14.08 10.9699 14.37L11.4499 14.85L13.0499 13.37C13.3499 13.09 13.8299 13.11 14.1099 13.41C14.3899 13.71 14.3699 14.19 14.0699 14.47L11.9399 16.44C11.7899 16.57 11.6099 16.64 11.4299 16.64Z" 
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_4418_4786">
          <Rect width="24" height="24" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

// Premium Feature Icons Components
const PartyModeIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_4418_8598)">
        <Path d="M20.8901 13V14H20.0201C19.2801 14 18.6801 14.6 18.6801 15.35V15.65C18.6801 16.4 18.0801 17 17.3301 17C16.5901 17 15.9901 16.4 15.9901 15.65V15.35C15.9901 14.6 15.3801 14 14.6401 14C13.9001 14 13.3001 14.6 13.3001 15.35V15.65C13.3001 16.4 12.6901 17 11.9501 17C11.2101 17 10.6001 16.4 10.6001 15.65V15.35C10.6001 14.6 10.0001 14 9.26011 14C8.52011 14 7.91011 14.6 7.91011 15.35V15.65C7.91011 16.4 7.31011 17 6.57011 17C5.82011 17 5.22011 16.4 5.22011 15.65V15.33C5.22011 14.59 4.63011 13.99 3.90011 13.98H3.11011V13C3.11011 11.62 4.15011 10.45 5.56011 10.11C5.84011 10.04 6.13011 10 6.44011 10H17.5601C17.8701 10 18.1601 10.04 18.4401 10.11C19.8501 10.45 20.8901 11.62 20.8901 13Z" fill={color} />
        <Path d="M18.4401 7.17V8.58C18.1501 8.52 17.8601 8.5 17.5601 8.5H6.44006C6.14006 8.5 5.85006 8.53 5.56006 8.59V7.17C5.56006 5.97 6.64006 5 7.98006 5H16.0201C17.3601 5 18.4401 5.97 18.4401 7.17Z" fill={color} />
        <Path d="M8.75 3.55039V5.01039H7.98C7.72 5.01039 7.48 5.04039 7.25 5.10039V3.55039C7.25 3.20039 7.59 2.90039 8 2.90039C8.41 2.90039 8.75 3.20039 8.75 3.55039Z" fill={color} />
        <Path d="M16.75 3.33008V5.10008C16.52 5.03008 16.28 5.00008 16.02 5.00008H15.25V3.33008C15.25 2.92008 15.59 2.58008 16 2.58008C16.41 2.58008 16.75 2.92008 16.75 3.33008Z" fill={color} />
        <Path d="M12.75 2.82V5H11.25V2.82C11.25 2.37 11.59 2 12 2C12.41 2 12.75 2.37 12.75 2.82Z" fill={color} />
        <Path d="M22 21.2505C22 21.6605 21.66 22.0005 21.25 22.0005H2.75C2.34 22.0005 2 21.6605 2 21.2505C2 20.8405 2.34 20.5005 2.75 20.5005H3.11V15.4805H3.72V15.5505C3.72 16.8905 4.6 18.1305 5.91 18.4205C6.93 18.6605 7.9 18.3305 8.56 17.6805C8.94 17.3005 9.56 17.2905 9.94 17.6705C10.46 18.1805 11.17 18.5005 11.95 18.5005C12.73 18.5005 13.44 18.1905 13.96 17.6705C14.34 17.3005 14.95 17.3005 15.34 17.6805C15.99 18.3305 16.96 18.6605 17.99 18.4205C19.3 18.1305 20.18 16.8905 20.18 15.5505V15.5005H20.89V20.5005H21.25C21.66 20.5005 22 20.8405 22 21.2505Z" fill={color} />
      </G>
      <Defs>
        <ClipPath id="clip0_4418_8598">
          <Rect width="24" height="24" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const MoreQuestionsIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_4418_8671)">
        <Path d="M17 2.42969H7C4 2.42969 2 4.42969 2 7.42969V13.4297C2 16.4297 4 18.4297 7 18.4297V20.5597C7 21.3597 7.89 21.8397 8.55 21.3897L13 18.4297H17C20 18.4297 22 16.4297 22 13.4297V7.42969C22 4.42969 20 2.42969 17 2.42969ZM12 14.5997C11.58 14.5997 11.25 14.2597 11.25 13.8497C11.25 13.4397 11.58 13.0997 12 13.0997C12.42 13.0997 12.75 13.4397 12.75 13.8497C12.75 14.2597 12.42 14.5997 12 14.5997ZM13.26 10.4497C12.87 10.7097 12.75 10.8797 12.75 11.1597V11.3697C12.75 11.7797 12.41 12.1197 12 12.1197C11.59 12.1197 11.25 11.7797 11.25 11.3697V11.1597C11.25 9.99969 12.1 9.42969 12.42 9.20969C12.79 8.95969 12.91 8.78969 12.91 8.52969C12.91 8.02969 12.5 7.61969 12 7.61969C11.5 7.61969 11.09 8.02969 11.09 8.52969C11.09 8.93969 10.75 9.27969 10.34 9.27969C9.93 9.27969 9.59 8.93969 9.59 8.52969C9.59 7.19969 10.67 6.11969 12 6.11969C13.33 6.11969 14.41 7.19969 14.41 8.52969C14.41 9.66969 13.57 10.2397 13.26 10.4497Z" fill={color} />
      </G>
      <Defs>
        <ClipPath id="clip0_4418_8671">
          <Rect width="24" height="24" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const ExclusiveCategoriesIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_4418_5052)">
        <Path d="M7.24 2H5.34C3.15 2 2 3.15 2 5.33V7.23C2 9.41 3.15 10.56 5.33 10.56H7.23C9.41 10.56 10.56 9.41 10.56 7.23V5.33C10.57 3.15 9.42 2 7.24 2Z" fill={color} />
        <Path opacity="0.4" d="M18.6699 2H16.7699C14.5899 2 13.4399 3.15 13.4399 5.33V7.23C13.4399 9.41 14.5899 10.56 16.7699 10.56H18.6699C20.8499 10.56 21.9999 9.41 21.9999 7.23V5.33C21.9999 3.15 20.8499 2 18.6699 2Z" fill={color} />
        <Path d="M18.6699 13.4297H16.7699C14.5899 13.4297 13.4399 14.5797 13.4399 16.7597V18.6597C13.4399 20.8397 14.5899 21.9897 16.7699 21.9897H18.6699C20.8499 21.9897 21.9999 20.8397 21.9999 18.6597V16.7597C21.9999 14.5797 20.8499 13.4297 18.6699 13.4297Z" fill={color} />
        <Path opacity="0.4" d="M7.24 13.4297H5.34C3.15 13.4297 2 14.5797 2 16.7597V18.6597C2 20.8497 3.15 21.9997 5.33 21.9997H7.23C9.41 21.9997 10.56 20.8497 10.56 18.6697V16.7697C10.57 14.5797 9.42 13.4297 7.24 13.4297Z" fill={color} />
      </G>
      <Defs>
        <ClipPath id="clip0_4418_5052">
          <Rect width="24" height="24" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const CustomQuestionsIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_4418_4832)">
        <Path opacity="0.4" d="M15.48 3H7.52C4.07 3 2 5.06 2 8.52V16.47C2 19.94 4.07 22 7.52 22H15.47C18.93 22 20.99 19.94 20.99 16.48V8.52C21 5.06 18.93 3 15.48 3Z" fill={color} />
        <Path d="M21.02 2.98028C19.23 1.18028 17.48 1.14028 15.64 2.98028L14.51 4.10028C14.41 4.20028 14.38 4.34028 14.42 4.47028C15.12 6.92028 17.08 8.88028 19.53 9.58028C19.56 9.59028 19.61 9.59028 19.64 9.59028C19.74 9.59028 19.84 9.55028 19.91 9.48028L21.02 8.36028C21.93 7.45028 22.38 6.58028 22.38 5.69028C22.38 4.79028 21.93 3.90028 21.02 2.98028Z" fill={color} />
        <Path d="M17.8601 10.4198C17.5901 10.2898 17.3301 10.1598 17.0901 10.0098C16.8901 9.88984 16.6901 9.75984 16.5001 9.61984C16.3401 9.51984 16.1601 9.36984 15.9801 9.21984C15.9601 9.20984 15.9001 9.15984 15.8201 9.07984C15.5101 8.82984 15.1801 8.48984 14.8701 8.11984C14.8501 8.09984 14.7901 8.03984 14.7401 7.94984C14.6401 7.83984 14.4901 7.64984 14.3601 7.43984C14.2501 7.29984 14.1201 7.09984 14.0001 6.88984C13.8501 6.63984 13.7201 6.38984 13.6001 6.12984C13.4701 5.84984 13.3701 5.58984 13.2801 5.33984L7.9001 10.7198C7.5501 11.0698 7.2101 11.7298 7.1401 12.2198L6.7101 15.1998C6.6201 15.8298 6.7901 16.4198 7.1801 16.8098C7.5101 17.1398 7.9601 17.3098 8.4601 17.3098C8.5701 17.3098 8.6801 17.2998 8.7901 17.2898L11.7601 16.8698C12.2501 16.7998 12.9101 16.4698 13.2601 16.1098L18.6401 10.7298C18.3901 10.6498 18.1401 10.5398 17.8601 10.4198Z" fill={color} />
      </G>
      <Defs>
        <ClipPath id="clip0_4418_4832">
          <Rect width="24" height="24" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const UpgradeScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get upgrade reason from route params
  const upgradeReason = route?.params?.upgradeReason || 'party';
  const isFavoritesUpgrade = upgradeReason === 'favorites';

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for premium badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        translations[language]?.upgradeSuccess || 'Upgrade Successful!',
        translations[language]?.upgradeSuccessMessage || 'Welcome to Paper Jar Premium! You can now access Party Mode and all premium features.',
        [
          {
            text: translations[language]?.startPlaying || 'Start Playing',
            onPress: () => navigation.navigate('Game', { gameMode: 'party' }),
          },
        ]
      );
    }, 2000);
  };

  const handleRestore = () => {
    Alert.alert(
      translations[language]?.restorePurchases || 'Restore Purchases',
      translations[language]?.restoreMessage || 'Checking for previous purchases...',
      [{ text: 'OK' }]
    );
  };

  const pricingPlans = [
    {
      id: 'monthly',
      title: translations[language]?.monthlyPlan || 'Monthly',
      price: '$2.99',
      period: translations[language]?.perMonth || '/month',
      subtitle: translations[language]?.flexibleBilling || 'Cancel anytime',
      popular: false,
    },
    {
      id: 'yearly',
      title: translations[language]?.yearlyPlan || 'Yearly',
      price: '$19.99',
      period: translations[language]?.perYear || '/year',
      subtitle: translations[language]?.bestValue || 'Save 44% • Best Value',
      popular: true,
      savings: translations[language]?.save44 || 'SAVE 44%',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={gradients.primary.colors}
        style={styles.backgroundGradient}
        start={gradients.primary.start}
        end={gradients.primary.end}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ModernBackButton 
            onPress={() => navigation.goBack()}
            size="md"
          />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View 
              style={[
                styles.premiumBadge,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {/* Outer circle with gradient */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              {/* Inner circle for better concentric effect */}
              <View style={styles.innerCircle}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.innerCircleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                
                {/* Icon container */}
                <View style={styles.iconContainer}>
                  {isFavoritesUpgrade ? (
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <G clipPath="url(#clip0_4418_8679)">
                        <Path
                          d="M16.44 3.09961C14.63 3.09961 13.01 3.97961 12 5.32961C10.99 3.97961 9.37 3.09961 7.56 3.09961C4.49 3.09961 2 5.59961 2 8.68961C2 9.87961 2.19 10.9796 2.52 11.9996C4.1 16.9996 8.97 19.9896 11.38 20.8096C11.72 20.9296 12.28 20.9296 12.62 20.8096C15.03 19.9896 19.9 16.9996 21.48 11.9996C21.81 10.9796 22 9.87961 22 8.68961C22 5.59961 19.51 3.09961 16.44 3.09961Z"
                          fill="#fff"
                        />
                      </G>
                      <Defs>
                        <ClipPath id="clip0_4418_8679">
                          <Rect width="24" height="24" fill="white" />
                        </ClipPath>
                      </Defs>
                    </Svg>
                  ) : (
                    <PartyIcon size={40} color="#fff" />
                  )}
                </View>
              </View>
            </Animated.View>
            
            <Text style={styles.heroTitle}>
              {isFavoritesUpgrade 
                ? (translations[language]?.unlockUnlimitedFavorites || 'Unlock Unlimited Favorites')
                : (translations[language]?.unlockPartyMode || 'Unlock Party Mode')
              }
            </Text>
            <Text style={styles.heroSubtitle}>
              {isFavoritesUpgrade
                ? (translations[language]?.favoritesTagline || 'Save as many questions as you want and build your perfect conversation collection')
                : (translations[language]?.partyModeTagline || 'Transform any gathering into an unforgettable experience')
              }
            </Text>
          </Animated.View>

          {/* Premium Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>
              {translations[language]?.whatYouGet || 'What You Get'}
            </Text>
            
            <View style={styles.featuresGrid}>
              {isFavoritesUpgrade ? (
                <>
                  {/* Unlimited Favorites */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                          <G clipPath="url(#clip0_favorites)">
                            <Path
                              d="M16.44 3.09961C14.63 3.09961 13.01 3.97961 12 5.32961C10.99 3.97961 9.37 3.09961 7.56 3.09961C4.49 3.09961 2 5.59961 2 8.68961C2 9.87961 2.19 10.9796 2.52 11.9996C4.1 16.9996 8.97 19.9896 11.38 20.8096C11.72 20.9296 12.28 20.9296 12.62 20.8096C15.03 19.9896 19.9 16.9996 21.48 11.9996C21.81 10.9796 22 9.87961 22 8.68961C22 5.59961 19.51 3.09961 16.44 3.09961Z"
                              fill="#fff"
                            />
                          </G>
                          <Defs>
                            <ClipPath id="clip0_favorites">
                              <Rect width="24" height="24" fill="white" />
                            </ClipPath>
                          </Defs>
                        </Svg>
                      </View>
                      <Text style={styles.featureTitle}>Unlimited Saves</Text>
                      <Text style={styles.featureDescription}>
                        Save as many favorite questions as you want
                      </Text>
                    </View>
                  </View>

                  {/* Extended Library */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <MoreQuestionsIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>10,000+ Questions</Text>
                      <Text style={styles.featureDescription}>
                        Massive collection to choose your favorites from
                      </Text>
                    </View>
                  </View>

                  {/* Party Mode Access */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <PartyModeIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>Party Mode</Text>
                      <Text style={styles.featureDescription}>
                        Unlock the ultimate party game experience
                      </Text>
                    </View>
                  </View>

                  {/* Custom Categories */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <ExclusiveCategoriesIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>Premium Topics</Text>
                      <Text style={styles.featureDescription}>
                        Exclusive categories to save from
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Party Mode Access */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <PartyModeIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>Party Mode</Text>
                      <Text style={styles.featureDescription}>
                        Unlock the ultimate party game experience
                      </Text>
                    </View>
                  </View>

                  {/* Extended Library */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <MoreQuestionsIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>10,000+ Questions</Text>
                      <Text style={styles.featureDescription}>
                        Massive collection of conversation starters
                      </Text>
                    </View>
                  </View>

                  {/* Exclusive Categories */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <ExclusiveCategoriesIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>Premium Topics</Text>
                      <Text style={styles.featureDescription}>
                        Exclusive categories and specialized themes
                      </Text>
                    </View>
                  </View>

                  {/* Custom Questions */}
                  <View style={styles.featureCard}>
                    <View style={styles.featureCardGlass}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.08)']}
                        style={styles.featureCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <View style={styles.featureIconContainer}>
                        <CustomQuestionsIcon size={28} color="#fff" />
                      </View>
                      <Text style={styles.featureTitle}>Custom Questions</Text>
                      <Text style={styles.featureDescription}>
                        Create and save your own conversation starters
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Pricing Plans */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>
              {translations[language]?.choosePlan || 'Choose Your Plan'}
            </Text>
            
            <View style={styles.pricingPlans}>
              {pricingPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.pricingPlan,
                    selectedPlan === plan.id && styles.selectedPlan,
                  ]}
                  onPress={() => handlePlanSelect(plan.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.planGlass}>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={
                        selectedPlan === plan.id
                          ? plan.id === 'yearly'
                            ? ['rgba(76, 175, 80, 0.4)', 'rgba(76, 175, 80, 0.2)', 'rgba(255, 255, 255, 0.1)']
                            : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']
                          : ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
                      }
                      style={styles.planGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>
                    <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                    {selectedPlan === plan.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049', '#388e3c']}
                style={styles.upgradeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.upgradeButtonContent}>
                <View style={styles.iconContainer}>
                  <UnlockIcon size={22} color="#fff" />
                </View>
                <Text style={styles.upgradeText}>
                  {isProcessing 
                    ? (translations[language]?.processing || 'Processing...') 
                    : (translations[language]?.startPremium || 'Start Premium')
                  }
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
            >
              <Text style={styles.restoreText}>
                {translations[language]?.restorePurchases || 'Restore Purchases'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              {translations[language]?.autoRenew || 'Subscription automatically renews unless cancelled 24 hours before renewal.'}
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonGlass: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  premiumBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  badgeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: '48%', // Two columns
    minWidth: 150, // Ensure minimum readable size
    aspectRatio: 1.1, // Slightly taller than wide
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 12,
  },
  featureCardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },
  featureCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 20,
    flexWrap: 'wrap',
    numberOfLines: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
    paddingHorizontal: 4,
  },
  pricingSection: {
    marginBottom: 40,
  },
  pricingPlans: {
    gap: 16,
  },
  pricingPlan: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 16,
  },
  selectedPlan: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    transform: [{ scale: 1.02 }],
  },
  planGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 24,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  planGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  savingsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  savingsText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    justifyContent: 'center',
  },
  planPrice: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  planPeriod: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  planSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 24,
    position: 'relative',
  },
  upgradeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  upgradeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 32,
    gap: 12,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  restoreText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(5px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pricingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heartIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  innerCircleGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(5px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default UpgradeScreen; 