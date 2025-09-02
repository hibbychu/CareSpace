import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import temp from "../assets/temp.png";

function EventDetails() {
  return (
    <ScrollView style={styles.container}>
      <Image source={temp} style={styles.image} />

      <Text style={styles.title}>Event 1</Text>
      <Text style={styles.date}>Sep 5, 2025 | 2:00 PM</Text>

      <Text style={styles.description}>
        This is the detailed description of Event 1. Here you can include all
        information like location, agenda, speakers, and anything else
        relevant.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default EventDetails;
