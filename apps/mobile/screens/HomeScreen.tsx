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
import { db, fetchAndStoreNews } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  EventDetails: { eventID: string };
  News: undefined;
};

type Event = {
  eventID: string;
  eventName: string;
  dateTime: any; // Firestore timestamp
  organiser: string;
  address: string;
  description: string;
  imageUrl?: string;
};

type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
};

function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const styles = createStyles(theme);
  const [events, setEvents] = useState<Event[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    // Fetch and store news once on app start (or debug)
    fetchAndStoreNews().then(() => {
      console.log("fetchAndStoreNews triggered");
      // After fetching and storing news, fetch from Firestore
      fetchEventsAndNews();
    });
  }, []);

  const fetchEventsAndNews = async () => {
    try {
      // Fetch Events
      const eventsQuery = query(
        collection(db, "events"),
        orderBy("dateTime", "asc")
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData: Event[] = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          eventID: doc.id,
          eventName: data.eventName,
          dateTime: data.dateTime,
          organiser: data.organiser,
          address: data.address,
          description: data.description,
          imageUrl: data.imageUrl || null,
        };
      });
      setEvents(eventsData);

      // Fetch News ordered by publishedAt descending
      const newsQuery = query(
        collection(db, "news"),
        orderBy("publishedAt", "desc")
      );
      const newsSnapshot = await getDocs(newsQuery);
      const newsData: NewsArticle[] = newsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          url: data.url,
          urlToImage: data.urlToImage || null,
        };
      });
      setNewsArticles(newsData);
      setLoadingNews(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoadingNews(false);
    }
  };

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
        {events.slice(0, 1).map((event) => (
          <View key={event.eventID} style={styles.card}>
            <Image
              source={event.imageUrl ? { uri: event.imageUrl } : temp} // fallback to temp if no imageUrl
              style={styles.cardImage}
            />
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
              <Text style={{ color: theme.text, marginBottom: 4 }}>
                {event.description}
              </Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={() =>
                  navigation.navigate("EventDetails", {
                    eventID: event.eventID,
                  })
                }
              >
                <Text style={styles.cardButtonText}>More Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
          {loadingNews ? (
            <Text style={{ color: theme.text }}>Loading news...</Text>
          ) : newsArticles.length === 0 ? (
            <Text style={{ color: theme.text }}>No news available.</Text>
          ) : (
            newsArticles.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={async () => {
                  const supported = await Linking.canOpenURL(item.url);
                  if (supported) {
                    await Linking.openURL(item.url);
                  } else {
                    alert("Cannot open this URL: " + item.url);
                  }
                }}
              >
                <Image
                  source={item.urlToImage ? { uri: item.urlToImage } : temp}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={{ color: theme.text }}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
      elevation: 5,
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
