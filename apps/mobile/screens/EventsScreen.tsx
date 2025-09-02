import React from "react";
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

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: undefined;
};

function EventsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Upcoming Events Section */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filter</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row", // horizontal layout
    justifyContent: "space-between", // push items to edges
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  filterButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterText: {
    color: "#4f46e5",
    fontSize: 14,
  },
  cardsContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
  },
  cardDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default EventsScreen;
