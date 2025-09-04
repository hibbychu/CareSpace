import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import temp from "../assets/temp.png";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContext } from "../ThemeContext";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: undefined;
};

function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const styles = createStyles(theme);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
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
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      </View>

      {/* News cards */}
      <View style={styles.cardsContainer}>
        {/* News Card 1 */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Article 1</Text>
            <Text style={styles.cardDate}>
              Synopsis - no read more button, the entire card is clickable
            </Text>
          </View>
        </TouchableOpacity>

        {/* News Card 2 */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Article 2</Text>
            <Text style={styles.cardDate}>Synopsis</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Read More</Text>
            </TouchableOpacity>
          </View>
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
      borderColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    viewMoreText: {
      color: theme.primary,
      fontSize: 14,
    },
    cardsContainer: {
      marginTop: 10,
    },
    card: {
      backgroundColor: theme.background,
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
      color: theme.background,
      fontSize: 14,
    },
  });

export default HomeScreen;
