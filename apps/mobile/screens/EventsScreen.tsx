import React, { useEffect, useState, useContext } from "react";
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
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ThemeContext } from "../ThemeContext";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: { eventID: string };
};

type Event = {
  id: string;
  eventName: string;
  dateTime: any;
  organiser: string;
  address: string;
  description: string;
  imageUrl?: string;
};

function EventsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("dateTime", "asc"));
        const querySnapshot = await getDocs(q);

        const eventsData: Event[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Event, "id">),
        }));

        setEvents(eventsData);
      } catch (error) {
        console.log("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {events.map((event) => (
          <View key={event.id} style={styles.card}>
            <Image
              source={event.imageUrl ? { uri: event.imageUrl } : temp}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{event.eventName}</Text>
              <Text style={styles.cardDate}>
                {event.dateTime?.seconds
                  ? new Date(event.dateTime.seconds * 1000).toLocaleString()
                  : ""}
              </Text>
              <Text style={styles.cardText}>Organiser: {event.organiser}</Text>
              <Text style={styles.cardText}>Address: {event.address}</Text>
              <Text style={styles.cardText}>{event.description}</Text>

              <TouchableOpacity
                style={styles.cardButton}
                onPress={() =>
                  navigation.navigate("EventDetails", { eventID: event.id })
                }
              >
                <Text style={styles.cardButtonText}>More Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default EventsScreen;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    filterButton: {
      borderWidth: 2,
      borderColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: theme.background,
    },
    filterText: {
      color: theme.primary,
      fontSize: 14,
    },
    cardsContainer: {
      marginTop: 10,
    },
    card: {
      backgroundColor: theme.cardBackground,
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
      color: theme.text,
    },
    cardDate: {
      fontSize: 14,
      color: theme.dateGrey,
      marginBottom: 8,
    },
    cardText: {
      color: theme.text,
      marginBottom: 4,
    },
    cardButton: {
      marginTop: 10,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: theme.primary,
    },
    cardButtonText: {
      color: "#fff",
      fontSize: 14,
    },
  });
