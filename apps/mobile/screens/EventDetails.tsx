import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import temp from "../assets/temp.png";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { ThemeContext } from "../ThemeContext";

type Event = {
  eventName: string;
  dateTime: any; 
  organiser: string;
  address: string;
  description: string;
  imageUrl: string;
};

type RootStackParamList = {
  EventDetails: { eventID: string };
};

function EventDetails() {
  const route = useRoute<RouteProp<RootStackParamList, "EventDetails">>();
  const { eventID } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const docRef = doc(db, "events", eventID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ eventID: docSnap.id, ...docSnap.data() } as Event);
        }
      } catch (e) {
        console.error("Error fetching event details:", e);
      }
    }
    fetchEvent();
  }, [eventID]);

  if (!event) return <Text style={{ color: theme.text }}>Loading...</Text>;

  const eventDate = event.dateTime?.toDate
    ? event.dateTime.toDate()
    : new Date(event.dateTime);

  return (
    <ScrollView style={styles.container}>
      {/* Banner image */}
      <Image
        source={event.imageUrl ? { uri: event.imageUrl } : temp}
        style={styles.image}
      />

      {/* Event Name */}
      <Text style={styles.title}>{event.eventName}</Text>

      {/* Date + Time */}
      <Text style={styles.date}>
        {eventDate.toLocaleDateString()} | {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>

      {/* Organiser */}
      <Text style={styles.organiser}>Organised by: {event.organiser}</Text>

      {/* Address */}
      <Text style={styles.address}>📍 {event.address}</Text>

      {/* Description */}
      <Text style={styles.description}>{event.description}</Text>
    </ScrollView>
  );
}

export default EventDetails;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.text,
    },
    date: {
      fontSize: 16,
      color: theme.dateGrey,
      marginBottom: 8,
    },
    organiser: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      color: theme.text,
    },
    address: {
      fontSize: 15,
      marginBottom: 12,
      color: theme.text,
    },
    description: {
      fontSize: 16,
      lineHeight: 22,
      color: theme.text,
    },
  });
