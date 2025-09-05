import React, { useEffect, useState, useContext, createContext } from "react";
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

type Theme = {
  background: string;
  text: string;
  primary: string;
  dateGrey: string;
};

export const ThemeContext = createContext<{ theme: Theme }>({
  theme: {
    background: "#fff",
    text: "#000",
    primary: "#007bff",
    dateGrey: "#999",
  },
});

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: { eventID: string }; // 👈 pass eventID as param
};

type Event = {
  id: string;
  eventName: string;
  dateTime: any;
  organiser: string;
  address: string;
  description: string;
};

function EventsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("dateTime", "asc"));
        const querySnapshot = await getDocs(q);

        const eventsData: Event[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Event, "id">),
        }));

        console.log("Fetched events:", eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.log("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {events.map((event) => (
          <View key={event.id} style={styles.card}>
            <Image source={temp} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {event.eventName}
              </Text>
              <Text style={styles.cardDate}>
                {event.dateTime?.seconds
                  ? new Date(event.dateTime.seconds * 1000).toLocaleString()
                  : ""}
              </Text>
              <Text style={{ color: theme.text, marginBottom: 4 }}>
                Organiser: {event.organiser}
              </Text>
              <Text style={{ color: theme.text, marginBottom: 4 }}>
                Address: {event.address}
              </Text>
              <Text style={{ color: theme.text }}>{event.description}</Text>

              {/* 👇 More Details button */}
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

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#7b2cbf",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterText: {
    color: "#7b2cbf",
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
    marginTop: 10,
    backgroundColor: "#7b2cbf",
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
