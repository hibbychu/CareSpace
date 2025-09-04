import React, { useContext, useState, useEffect } from "react";
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
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: undefined;
  News: undefined;
};

type Event = {
  eventID: string;
  eventName: string;
  dateTime: any; // Firestore timestamp
  organiser: string;
  address: string;
  description: string;
};

function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const styles = createStyles(theme);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // ⚡ make sure this matches your field name in Firestore
        const q = query(collection(db, "events"), orderBy("dateTime", "asc"));
        const querySnapshot = await getDocs(q);

        const eventsData: Event[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            eventName: data.eventName,
            dateTime: data.dateTime, // Firestore Timestamp
            organiser: data.organiser,
            address: data.address,
            description: data.description,
          };
        });

        setEvents(eventsData);
        console.log("Fetched events:", eventsData);
      } catch (error) {
        console.log("Error fetching events:", error);
      }
    };

  fetchEvents();
}, []);

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

      <View style={styles.cardsContainer}>
        {/* Render Firestore events */}
        {events.map((event) => (
          <View key={event.eventID} style={styles.card}>
            <Image source={temp} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{event.eventName}</Text>
              <Text style={styles.cardDate}>
                {event.dateTime?.toDate
                  ? event.dateTime.toDate().toLocaleString()
                  : String(event.dateTime)}
              </Text>
              <Text style={{ color: theme.text, marginBottom: 4 }}>
                Organiser: {event.organiser}
              </Text>
              <Text style={{ color: theme.text, marginBottom: 4 }}>
                Address: {event.address}
              </Text>
              <Text style={{ color: theme.text }}>{event.description}</Text>
            </View>
          </View>
        ))}

        {/* Static Event Card Example */}
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
