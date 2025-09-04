import React, { useEffect, useState } from "react";
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
import { db } from "../firebase"; // import your firebase config
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: undefined;
};

type Event = {
  eventID: string;
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("dateTime", "asc"));
        const querySnapshot = await getDocs(q);
        const eventsData: Event[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            eventID: doc.id,
            eventName: data.eventName,
            dateTime: data.dateTime,
            organiser: data.organiser,
            address: data.address,
            description: data.description,
          };
        });
        setEvents(eventsData);
      } catch (error) {
        console.log("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Filter button row */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Event cards */}
      <View style={styles.cardsContainer}>
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
              <Text style={{ marginBottom: 4 }}>Organiser: {event.organiser}</Text>
              <Text style={{ marginBottom: 4 }}>Address: {event.address}</Text>
              <Text style={{ marginBottom: 8 }}>{event.description}</Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => navigation.navigate("EventDetails", { eventID: event.eventID })}
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
