import React, { useState, useContext } from "react";
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

const sampleArticles = [
  {
    id: "1",
    title: "Migrant Workers in Singapore: Safety Measures",
    description:
      "Authorities have introduced new safety protocols to protect migrant workers amid rising concerns.",
    imageUrl: "https://via.placeholder.com/400x200.png?text=Migrant+Workers+1",
    url: "https://example.com/article1",
  },
  {
    id: "2",
    title: "Housing Improvements for Migrant Workers",
    description:
      "A new initiative aims to provide better living conditions for Singapore’s migrant workforce.",
    imageUrl: "https://via.placeholder.com/400x200.png?text=Migrant+Workers+2",
    url: "https://example.com/article2",
  },
  {
    id: "3",
    title: "Support Programs Launched for Migrant Workers",
    description:
      "Non-profit organizations are launching programs to support the wellbeing of migrant workers.",
    imageUrl: "https://via.placeholder.com/400x200.png?text=Migrant+Workers+3",
    url: "https://example.com/article3",
  },
];

const NewsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [articles, setArticles] = useState(sampleArticles);
  const [loading, setLoading] = useState(false);

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

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ paddingBottom: 16 }}
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => openArticle(item.url)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <Text>{item.description}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#121212" : "#fff", // theme-aware
    },
    card: {
      width: "100%",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: "#ccc",
      backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
      borderRadius: 8,
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === "dark" ? "#fff" : "#000",
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

// const NewsScreen = () => {
//   const [articles, setArticles] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const db = getFirestore(app);

//   useEffect(() => {
//     const fetchNews = async () => {
//       const snapshot = await getDocs(collection(db, "news"));
//       const newsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setArticles(newsList);
//       setLoading(false);
//     };
//     fetchNews();
//   }, []);

//   if (loading) return <ActivityIndicator size="large" />;

//   return (
//     <FlatList
//       data={articles}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ccc" }}>
//           <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
//           {item.imageUrl && (
//             <Image
//               source={{ uri: item.imageUrl }}
//               style={{ width: "100%", height: 150, marginVertical: 8 }}
//               resizeMode="cover"
//             />
//           )}
//           <Text>{item.description}</Text>
//         </View>
//       )}
//     />
//   );
// };

// export default NewsScreen;
