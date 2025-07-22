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
  { code: "cs", label: "🇨🇿 CZ" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "es", label: "🇪🇸 ES" },
];

const QUESTION_BUTTON_TEXT = {
  cs: "🔍 Nová otázka",
  en: "🔍 Shuffle question",
  es: "🔍 Otra pregunta",
};

function shuffle(array) {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function HomeScreen({ navigation }) {
  const [language, setLanguage] = useState("cs");
  const [questionPool, setQuestionPool] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const combined = [];
    data.forEach((set) => {
      set.questions.forEach((q) => {
        combined.push({ question: q, topic: set.topic });
      });
    });
    const shuffled = shuffle(combined);
    setQuestionPool(shuffled);
    setUsedQuestions([]);
    setCurrentQuestion(shuffled[0]);
  }, []);

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
      }
    } catch (e) {
      console.error("Chyba při ukládání oblíbené otázky:", e);
    }
  };

  const getNextQuestion = () => {
    if (questionPool.length === 0) {
      const combined = [];
      data.forEach((set) => {
        set.questions.forEach((q) => {
          combined.push({ question: q, topic: set.topic });
        });
      });
      const reshuffled = shuffle(combined);
      setQuestionPool(reshuffled);
      setUsedQuestions([]);
      setCurrentQuestion(reshuffled[0]);
    } else {
      const next = questionPool[0];
      setCurrentQuestion(next);
      setUsedQuestions([...usedQuestions, next]);
      setQuestionPool(questionPool.slice(1));
    }
    triggerShake();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.header}>🎲 Otázky</Text>

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
            {currentQuestion?.question?.[language] || "Načítání..."}
          </Text>
          <View style={styles.speechTail} />
          <TouchableOpacity onPress={() => saveFavorite(currentQuestion)} style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18 }}>⭐ Uložit do oblíbených</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shuffleButton} onPress={getNextQuestion}>
          <Text style={styles.shuffleText}>{QUESTION_BUTTON_TEXT[language]}</Text>
        </TouchableOpacity>

        <Text style={styles.languageLabel}>Zvol jazyk:</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map((item) => (
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

        <TouchableOpacity
          onPress={() => navigation.navigate("Favorites")}
          style={{ marginTop: 20, alignSelf: "center" }}
        >
          <Text style={{ fontSize: 18 }}>📖 Zobrazit oblíbené</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);

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
      <Text style={styles.header}>📖 Oblíbené otázky</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.question.cs}-${index}`}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.question.cs}</Text>
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
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
  },
  questionBox: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#fefefe",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
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
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
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
    flexWrap: "wrap",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  langButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 5,
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
});
