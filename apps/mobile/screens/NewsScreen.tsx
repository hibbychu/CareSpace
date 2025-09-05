import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { db } from './../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

// Define a type for your news items for better type safety
type NewsItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string; // image is optional in Firestore
};

const NewsPage = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  useEffect(() => {
    // This function creates a real-time listener to the 'news' collection
    const unsub = onSnapshot(collection(db, "news"), (snapshot) => {
      const data: NewsItem[] = [];
      snapshot.forEach(doc => {
        // Cast the data to your NewsItem type
        const item = doc.data() as Omit<NewsItem, 'id'>;
        data.push({
          id: doc.id,
          ...item,
        });
      });
      setNewsData(data);
    });

    // Return a cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsub();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header section with title and View All link */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming events</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Event Card */}
      <View style={styles.eventCard}>
        <Image
          source={{ uri: 'https://picsum.photos/400/200' }} // Updated placeholder image
          style={styles.eventImage}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>National Day 2025 Craft Event</Text>
          <Text style={styles.eventDescription}>
            Come together with your friends to celebrate Singapore's National Day! Join us for a special arts and crafts workshop where you can learn to create unique Singapore-themed crafts.
          </Text>
          <Text style={styles.eventDate}>Sun, 3rd Aug 2025</Text>
          <Text style={styles.eventLocation}>1 Tampines Walk, Singapore 528523</Text>
        </View>
      </View>

      {/* Latest News Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest News</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamically Rendered News Feed */}
      {newsData.map((post) => (
        <TouchableOpacity key={post.id} onPress={() => Linking.openURL(post.url)}>
          <View style={styles.postCard}>
            {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDescription}>{post.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#888',
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventDetails: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  eventLocation: {
    fontSize: 12,
    color: '#777',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  likeCount: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default NewsPage;

// import React, { useState, useEffect } from 'react';
// import { Linking } from 'react-native';
// import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
// import { db } from './../firebaseConfig'; // Assuming firebaseConfig.ts is in the same directory
// import { collection, onSnapshot } from 'firebase/firestore';

// type NewsItem = {
//   id: string;
//   title: string;
//   description: string;
//   url: string;
//   image: string;
// };

// const NewsPage = () => {
//   // const latestNewsData = [
//   //   {
//   //     title: 'Migrant workers who saved driver from sinkhole get SCDF awards...',
//   //     byline: 'Mr Pitchai Udaiyappan Subbiah, Mr Sathapillai Rajendran...',
//   //     id: '1',
//   //   }, 
//   // ];
//   const [newsData, setNewsData] = useState<NewsItem[]>([]);

//   useEffect(() => {
//     // This function creates a real-time listener to the 'news' collection
//     const unsub = onSnapshot(collection(db, "news"), (snapshot) => {
//       const data: NewsItem[] = [];
//       snapshot.forEach(doc => {
//         data.push({
//           id: doc.id,
//           ...doc.data() as Omit<NewsItem, 'id'>, // Cast the data to your NewsItem type
//         });
//       });
//       setNewsData(data);
//     });

//     // Return a cleanup function to unsubscribe from the listener when the component unmounts
//     return () => unsub();
//   }, []); // Empty dependency array means this effect runs only once on mount

//   const userPostsData = [
//     {
//       title: 'Foreign worker saves baby hanging from ledge',
//       byline: 'Mr Pitchai Udaiyappan Subbiah, Mr Sathapillai Rajendran...',
//       likes: 100,
//       id: '1',
//       image: 'https://static.mothership.sg/1/2015/04/foreign-worker-saves-baby.jpg',
//       url: 'https://ifonlysingaporeans.blogspot.com/2015/04/foreign-workers-heroic-act-saves.html',
//     },
//     {
//       title: 'Foreign worker saves baby hanging from ledge',
//       byline: 'Mr Pitchai Udaiyappan Subbiah, Mr Sathapillai Rajendran...',
//       likes: 90,
//       id: '2',
//       image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9-Rsj8YcRgWTTD8yJZ-IVKxMRAMhv4OdmVQ&s',
//       url: 'https://www.straitstimes.com/singapore/migrant-workers-who-saved-driver-from-sinkhole-get-scdf-awards-mobile-data-and-goodie-bags'
//     },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header section with title and View All link */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Upcoming events</Text>
//         <TouchableOpacity>
//           <Text style={styles.viewAllText}>View all</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Upcoming Event Card */}
//       <View style={styles.eventCard}>
//         <Image
//           source={{ uri: 'https://via.placeholder.com/400x200' }} // Placeholder image for the event
//           style={styles.eventImage}
//         />
//         <View style={styles.eventDetails}>
//           <Text style={styles.eventTitle}>National Day 2025 Craft Event</Text>
//           <Text style={styles.eventDescription}>
//             Come together with your friends to celebrate Singapore's National Day! Join us for a special arts and crafts workshop where you can learn to create unique Singapore-themed crafts.
//           </Text>
//           <Text style={styles.eventDate}>Sun, 3rd Aug 2025</Text>
//           <Text style={styles.eventLocation}>1 Tampines Walk, Singapore 528523</Text>
//         </View>
//       </View>

//       {/* Latest News Section */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Latest News</Text>
//         <TouchableOpacity>
//           <Text style={styles.viewAllText}>View all</Text>
//         </TouchableOpacity>
//       </View>

//       {/* User Post Feed */}
//       {userPostsData.map((post) => (
//   <TouchableOpacity key={post.id} onPress={() => Linking.openURL(post.url)}>
//     <View style={styles.postCard}>
//       <View style={styles.postHeader}>
//         <Text style={styles.postTitle}>{post.title}</Text>
//         <View style={styles.postActions}>
//           <View style={styles.likeContainer}>
//             <Text>❤️</Text>
//             <Text style={styles.likeCount}>{post.likes}</Text>
//           </View>
//           <Text>➡️</Text>
//         </View>
//       </View>
//       {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
//       <Text style={styles.postDescription}>{post.byline}</Text>
//     </View>
//   </TouchableOpacity>
// ))}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     marginTop: 15,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   viewAllText: {
//     color: '#888',
//     fontSize: 14,
//   },
//   eventCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   eventImage: {
//     width: '100%',
//     height: 150,
//   },
//   eventDetails: {
//     padding: 15,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   eventDescription: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 5,
//   },
//   eventDate: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 5,
//   },
//   eventLocation: {
//     fontSize: 12,
//     color: '#777',
//   },
//   newsItem: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   newsTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   newsByline: {
//     fontSize: 12,
//     color: '#777',
//   },
//   postCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   postHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   postTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     flex: 1,
//   },
//   postActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // Spacing between icons
//     marginLeft: 10,
//   },
//   likeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   likeCount: {
//     fontSize: 12,
//     color: '#555',
//     marginLeft: 4,
//   },
//   postImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   postDescription: {
//     fontSize: 14,
//     color: '#555',
//   },
// });

// export default NewsPage;
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
