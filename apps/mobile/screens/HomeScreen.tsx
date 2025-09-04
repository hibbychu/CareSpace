import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import temp from "../assets/temp.png";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContext } from "../ThemeContext";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: undefined;
  News: undefined;
};

const latestArticles = [
  {
    id: "1",
    title: "Migrant Workers in Singapore: Safety Measures",
    description: "Authorities have introduced new safety protocols...",
    url: "https://example.com/article1",
  },
  {
    id: "2",
    title: "Housing Improvements for Migrant Workers",
    description: "A new initiative aims to provide better living conditions...",
    url: "https://example.com/article2",
  },
];

function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const styles = createStyles(theme);

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: theme.background }}
    >
      {/* Upcoming Events Section */}
      <View style={styles.titleRow}>
        <Text style={styles.name}>Upcoming Events</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("Events")}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      </View>

      {/* Event cards */}
      <View style={styles.cardsContainer}>
        {/* Event Card 1 */}
        <View style={styles.card}>
          <Image source={temp} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Event 1</Text>
            <Text style={styles.cardDate}>Sep 5, 2025 | 2:00 PM</Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("EventDetails")}
            >
              <Text style={styles.cardButtonText}>More Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Card 2 */}
        <View style={styles.card}>
          <Image source={temp} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Event 2</Text>
            <Text style={styles.cardDate}>Sep 12, 2025 | 5:00 PM</Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("EventDetails")}
            >
              <Text style={styles.cardButtonText}>More Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Latest News Section */}
      <View style={styles.titleRow}>
        <Text style={styles.name}>Latest News</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("News")}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      </View>

      {/* News cards */}
      <View style={styles.cardsContainer}>
        {/* News Cards */}
        <View style={styles.cardsContainer}>
          {latestArticles.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={async () => {
                const supported = await Linking.canOpenURL(item.url);
                if (supported) {
                  await Linking.openURL(item.url); // opens in browser
                } else {
                  alert("Cannot open this URL: " + item.url);
                }
              }}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
    },
    viewMoreButton: {
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.text2,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    viewMoreText: {
      color: theme.text2,
      fontSize: 14,
    },
    cardsContainer: {
      marginTop: 10,
      marginBottom: 10,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 35,
    },
    cardImage: {
      width: "100%",
      height: 150,
    },
    cardContent: {
      padding: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      color: theme.text,
    },
    cardDate: {
      fontSize: 14,
      color: theme.dateGrey,
      marginBottom: 8,
    },
    cardButton: {
      backgroundColor: theme.primary,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    cardButtonText: {
      color: "white",
      fontSize: 14,
    },
  });

export default HomeScreen;
