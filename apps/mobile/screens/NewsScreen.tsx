import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { ThemeContext } from "../ThemeContext";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
};

const NewsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(
          collection(db, "news"),
          orderBy("publishedAt", "desc")
        );
        const querySnapshot = await getDocs(newsQuery);
        const newsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            url: data.url,
            urlToImage: data.urlToImage || null,
          };
        });
        setArticles(newsData);
      } catch (error) {
        console.error("Error fetching news: ", error);
        alert("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const openArticle = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Cannot open this URL: " + url);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  if (articles.length === 0)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.text }}>No news articles available.</Text>
      </View>
    );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ paddingBottom: 16, paddingTop: 10 }}
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => openArticle(item.url)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.urlToImage && (
            <Image
              source={{ uri: item.urlToImage }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <Text style={{ color: theme.text }}>{item.description}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.background,
    },
    card: {
      width: "100%",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: theme.borderColor || "#ccc",
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    image: {
      width: "100%",
      height: 150,
      marginBottom: 8,
      borderRadius: 8,
    },
  });

export default NewsScreen;
