import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { dataset as data } from "./full_dataset";
import glassImage from "./assets/glass.png";

const Stack = createStackNavigator();

const LANGUAGES = [
  { code: "cs", label: "🇨🇿 Čeština" },
  { code: "en", label: "🇬🇧 English" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "hi", label: "🇮🇳 हिंदी" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "pt", label: "🇵🇹 Português" },
  { code: "ru", label: "🇷🇺 Русский" },
  { code: "ur", label: "🇵🇰 اردو" },
  { code: "bn", label: "🇧🇩 বাংলা" },
];

const TRANSLATIONS = {
  header: {
    cs: "🎲",
    en: "🎲",
    zh: "🎲",
    hi: "🎲",
    es: "🎲",
    fr: "🎲",
    pt: "🎲",
    ru: "🎲",
    ur: "🎲",
    bn: "🎲"
  },
  newQuestion: {
    cs: "🔍 Nová otázka",
    en: "🔍 New question",
    zh: "🔍 新问题",
    hi: "🔍 नया प्रश्न",
    es: "🔍 Nueva pregunta",
    fr: "🔍 Nouvelle question",
    pt: "🔍 Nova pergunta",
    ru: "🔍 Новый вопрос",
    ur: "🔍 نیا سوال",
    bn: "🔍 নতুন প্রশ্ন"
  },
  hint: {
    cs: "💡 Nápověda",
    en: "💡 Hint",
    zh: "💡 提示",
    hi: "💡 संकेत",
    es: "💡 Pista",
    fr: "💡 Indice",
    pt: "💡 Dica",
    ru: "💡 Подсказка",
    ur: "💡 اشارہ",
    bn: "💡 ইঙ্গিত"
  },
  challenge: {
    cs: "🎯 Výzva",
    en: "🎯 Challenge",
    zh: "🎯 挑战",
    hi: "🎯 चुनौती",
    es: "🎯 Desafío",
    fr: "🎯 Défi",
    pt: "🎯 Desafio",
    ru: "🎯 Вызов",
    ur: "🎯 چیلنج",
    bn: "🎯 চ্যালেঞ্জ"
  },
  saveToFavorites: {
    cs: "⭐ Uložit do oblíbených",
    en: "⭐ Save to favorites",
    zh: "⭐ 保存到收藏",
    hi: "⭐ पसंदीदा में सेव करें",
    es: "⭐ Guardar en favoritos",
    fr: "⭐ Sauvegarder dans les favoris",
    pt: "⭐ Salvar nos favoritos",
    ru: "⭐ Сохранить в избранное",
    ur: "⭐ پسندیدہ میں محفوظ کریں",
    bn: "⭐ পছন্দের তালিকায় সংরক্ষণ করুন"
  },
  chooseLanguage: {
    cs: "Zvol jazyk:",
    en: "Choose language:",
    zh: "选择语言：",
    hi: "भाषा चुनें:",
    es: "Elige idioma:",
    fr: "Choisir la langue:",
    pt: "Escolha o idioma:",
    ru: "Выберите язык:",
    ur: "زبان منتخب کریں:",
    bn: "ভাষা নির্বাচন করুন:"
  },
  showFavorites: {
    cs: "📖 Zobrazit oblíbené",
    en: "📖 Show favorites",
    zh: "📖 显示收藏",
    hi: "📖 पसंदीदा दिखाएं",
    es: "📖 Mostrar favoritos",
    fr: "📖 Afficher les favoris",
    pt: "📖 Mostrar favoritos",
    ru: "📖 Показать избранное",
    ur: "📖 پسندیدہ دکھائیں",
    bn: "📖 পছন্দের তালিকা দেখান"
  },
  favoritesTitle: {
    cs: "📖 Oblíbené otázky",
    en: "📖 Favorite questions",
    zh: "📖 收藏的问题",
    hi: "📖 पसंदीदा प्रश्न",
    es: "📖 Preguntas favoritas",
    fr: "📖 Questions favorites",
    pt: "📖 Perguntas favoritas",
    ru: "📖 Избранные вопросы",
    ur: "📖 پسندیدہ سوالات",
    bn: "📖 প্রিয় প্রশ্ন"
  },
  loading: {
    cs: "Načítání...",
    en: "Loading...",
    zh: "加载中...",
    hi: "लोड हो रहा है...",
    es: "Cargando...",
    fr: "Chargement...",
    pt: "Carregando...",
    ru: "Загрузка...",
    ur: "لوڈ ہو رہا ہے...",
    bn: "লোড হচ্ছে..."
  },
  currentTopic: {
    cs: "Aktuální téma:",
    en: "Current topic:",
    zh: "当前主题：",
    hi: "वर्तमान विषय:",
    es: "Tema actual:",
    fr: "Sujet actuel:",
    pt: "Tópico atual:",
    ru: "Текущая тема:",
    ur: "موجودہ موضوع:",
    bn: "বর্তমান বিষয়:"
  }
};

function shuffle(array) {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Funkce pro odstranění ID čísel z textů
function cleanText(text) {
  if (typeof text === 'string') {
    // Odstraní jazykové prefixy jako [EN], [ZH], etc.
    let cleaned = text.replace(/^\[.{2,3}\]\s*/, '');
    // Odstraní čísla v závorkách na konci textu, např. " (1)?" -> "?"
    cleaned = cleaned.replace(/\s*\(\d+\)\s*([.?!]*)\s*$/, '$1');
    return cleaned;
  }
  return text;
}

// Funkce pro vyčištění objektu s překlady
function cleanTranslatedObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = cleanText(value);
  }
  return cleaned;
}

function HomeScreen({ navigation }) {
  const [language, setLanguage] = useState("cs");
  const [questionPool, setQuestionPool] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const combined = [];
    data.forEach((set) => {
      // Vyčistíme téma
      const cleanTopic = cleanTranslatedObject(set.topic);
      
      // Vyčistíme všechny otázky
      const cleanQuestions = set.questions.map(q => cleanTranslatedObject(q));
      
      cleanQuestions.forEach((q) => {
        combined.push({ question: q, topic: cleanTopic });
      });
    });
    const shuffled = shuffle(combined);
    console.log("Počáteční zásoba otázek:", shuffled.length);
    setQuestionPool(shuffled);
    setUsedQuestions([]);
    if (shuffled.length > 0) {
      setCurrentQuestion(shuffled[0]);
      setCurrentTopic(shuffled[0].topic);
    }
  }, []);

  // Update current topic when language changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.topic) {
      setCurrentTopic(currentQuestion.topic);
    }
  }, [language]);

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Reload favorites when language changes
  useEffect(() => {
    loadFavorites();
  }, [language]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favoritesData = stored ? JSON.parse(stored) : [];
      setFavorites(favoritesData);
    } catch (e) {
      console.error("Chyba při načítání oblíbených:", e);
    }
  };

  const isCurrentQuestionInFavorites = () => {
    if (!currentQuestion) return false;
    return favorites.some(q => q.question[language] === currentQuestion.question[language]);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  const triggerShake = () => {
    rotateAnim.setValue(0);
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const saveFavorite = async (questionObj) => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];
      const exists = favorites.some(q => q.question[language] === questionObj.question[language]);
      if (!exists) {
        favorites.push(questionObj);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
        // Update local state
        setFavorites(favorites);
      }
    } catch (e) {
      console.error("Chyba při ukládání oblíbené otázky:", e);
    }
  };

  const removeFavorite = async (questionObj) => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];
      const updatedFavorites = favorites.filter(q => q.question[language] !== questionObj.question[language]);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      // Update local state
      setFavorites(updatedFavorites);
    } catch (e) {
      console.error("Chyba při odstraňování oblíbené otázky:", e);
    }
  };

  const toggleFavorite = async (questionObj) => {
    if (isCurrentQuestionInFavorites()) {
      await removeFavorite(questionObj);
    } else {
      await saveFavorite(questionObj);
    }
  };

  const getNextQuestion = () => {
    setShowHints(false);
    setShowChallenge(false);
    
    console.log("Zbývající otázky:", questionPool.length);
    
    if (questionPool.length <= 1) {
      console.log("Vyčerpávám zásobu otázek, vytvářím novou");
      const combined = [];
      data.forEach((set) => {
        // Vyčistíme téma
        const cleanTopic = cleanTranslatedObject(set.topic);
        
        // Vyčistíme všechny otázky
        const cleanQuestions = set.questions.map(q => cleanTranslatedObject(q));
        
        cleanQuestions.forEach((q) => {
          combined.push({ question: q, topic: cleanTopic });
        });
      });
      const reshuffled = shuffle(combined);
      console.log("Nově vytvořená zásoba otázek:", reshuffled.length);
      setQuestionPool(reshuffled);
      setUsedQuestions([]);
      if (reshuffled.length > 0) {
        setCurrentQuestion(reshuffled[0]);
        setCurrentTopic(reshuffled[0].topic);
      }
    } else {
      const next = questionPool[0];
      setCurrentQuestion(next);
      setCurrentTopic(next.topic);
      setUsedQuestions([...usedQuestions, next]);
      setQuestionPool(questionPool.slice(1));
    }
    triggerShake();
  };

  const showTopicHints = () => {
    setShowHints(!showHints);
    setShowChallenge(false);
  };

  const showTopicChallenge = () => {
    setShowChallenge(!showChallenge);
    setShowHints(false);
  };

  const getTopicQuestions = () => {
    // Instead of trying to match topics, just get questions from the first topic
    // since all topics have the same content structure
    const topicData = data[0]; // Use first topic since all have same structure
    if (!topicData) {
      return [];
    }
    
    // Vyčistíme otázky před vrácením a použijeme aktuální jazyk
    const cleanQuestions = topicData.questions.map(q => cleanTranslatedObject(q));
    const shuffledQuestions = shuffle(cleanQuestions);
    return shuffledQuestions.slice(0, 3).map(q => ({ question: q }));
  };

  const getTopicChallenges = () => {
    // Instead of trying to match topics, just get challenges from the first topic
    // since all topics have the same content structure
    const topicData = data[0]; // Use first topic since all have same structure
    if (!topicData || !topicData.challenges) {
      return [];
    }
    
    // Vyčistíme výzvy před vrácením a použijeme aktuální jazyk
    return topicData.challenges.map(c => cleanTranslatedObject(c));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Horní reklamní banner */}
      <View style={styles.topAdBanner}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Ad Banner</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Image
          source={glassImage}
          style={[
            styles.glass,
            { transform: [{ rotateZ: rotateInterpolate }] },
          ]}
          resizeMode="contain"
        />

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {currentQuestion?.question?.[language] || TRANSLATIONS.loading[language]}
          </Text>
          <View style={styles.speechTail} />
          <TouchableOpacity 
            onPress={() => toggleFavorite(currentQuestion)} 
            style={[
              styles.starButton,
              isCurrentQuestionInFavorites() && styles.starButtonActive
            ]}
          >
            <Text style={[
              styles.starIcon,
              isCurrentQuestionInFavorites() && styles.starIconActive
            ]}>
              {isCurrentQuestionInFavorites() ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tlačítka pro nápovědu a výzvy */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.hintButton} onPress={showTopicHints}>
            <Text style={styles.buttonText}>💡</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shuffleButton} onPress={getNextQuestion}>
            <Text style={styles.shuffleText}>🔍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.challengeButton} onPress={showTopicChallenge}>
            <Text style={styles.buttonText}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* Zobrazení nápovědy */}
        {showHints && (
          <View style={styles.hintsBox}>
            <Text style={styles.hintsTitle}>{TRANSLATIONS.hint[language]}:</Text>
            {getTopicQuestions().map((questionObj, index) => (
              <Text key={index} style={styles.hintText}>
                • {questionObj.question[language]}
              </Text>
            ))}
          </View>
        )}

        {/* Zobrazení výzev */}
        {showChallenge && (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeTitle}>{TRANSLATIONS.challenge[language]}:</Text>
            {getTopicChallenges().map((challenge, index) => (
              <Text key={index} style={styles.challengeText}>
                🎯 {challenge[language]}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.langGrid}>
          <View style={styles.langColumn}>
            {LANGUAGES.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.code}
                onPress={() => setLanguage(item.code)}
                style={[
                  styles.langButton,
                  language === item.code && styles.langButtonActive,
                ]}
              >
                <Text style={[
                  styles.langText,
                  language === item.code && styles.langTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.langColumn}>
            {LANGUAGES.slice(5, 10).map((item) => (
              <TouchableOpacity
                key={item.code}
                onPress={() => setLanguage(item.code)}
                style={[
                  styles.langButton,
                  language === item.code && styles.langButtonActive,
                ]}
              >
                <Text style={[
                  styles.langText,
                  language === item.code && styles.langTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Favorites", { language })}
          style={styles.favoritesButton}
        >
          <Text style={styles.favoritesButtonText}>{TRANSLATIONS.showFavorites[language]}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Spodní reklamní banner */}
      <View style={styles.bottomAdBanner}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Ad Banner</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FavoritesScreen({ route }) {
  const [favorites, setFavorites] = useState([]);
  const language = route.params?.language || "cs";

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem("favorites");
        const favs = stored ? JSON.parse(stored) : [];
        setFavorites(favs);
      } catch (e) {
        console.error("Chyba při načítání oblíbených:", e);
      }
    };

    loadFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>{TRANSLATIONS.favoritesTitle[language]}</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.question[language]}-${index}`}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.question[language]}</Text>
            <Text style={styles.topicTextCard}>{item.topic[language]}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  glass: {
    width: "80%",
    height: 200,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  questionBox: {
    backgroundColor: "#fff",
    padding: 15,
    paddingRight: 35,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative", // Added for absolute positioning of star button
  },
  speechTail: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -10,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: "#fefefe",
    borderLeftWidth: 10,
    borderLeftColor: "transparent",
    borderRightWidth: 10,
    borderRightColor: "transparent",
  },
  questionText: {
    fontSize: 18,
    textAlign: "center",
  },
  shuffleButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  shuffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  languageLabel: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  langGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginVertical: 8,
  },
  langColumn: {
    flex: 1,
    marginHorizontal: 3,
  },
  langButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 2,
    backgroundColor: "#f0f0f0",
  },
  langButtonActive: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  langText: {
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  langTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fafafa",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
  },
  topicTextCard: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
  topicBox: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  topicLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00796b",
  },
  topicText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    gap: 8,
  },
  hintButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  shuffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  challengeButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  challengeButtonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  hintsBox: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  hintsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
  },
  hintText: {
    fontSize: 16,
    color: "#1b5e20",
    marginBottom: 5,
  },
  challengeBox: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: "#ffebee",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ef9a9a",
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c62828",
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 16,
    color: "#b71c1c",
    marginBottom: 5,
  },
  scrollContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  favoritesButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  favoritesButtonText: {
    fontSize: 18,
  },
  starButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#ffd700",
    borderRadius: 6,
    padding: 2,
    zIndex: 1,
  },
  starButtonActive: {
    backgroundColor: "#ffd700",
  },
  starIcon: {
    fontSize: 14,
    color: "#fff",
  },
  starIconActive: {
    color: "#fff",
  },
  topAdBanner: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    minHeight: 60,
  },
  bottomAdBanner: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    minHeight: 60,
  },
  adPlaceholder: {
    width: "90%",
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 320,
  },
  adText: {
    fontSize: 14,
    color: "#333",
  },
});
