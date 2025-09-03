import React, { useState, useContext, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Menu } from "react-native-paper";
import { ThemeContext } from "../ThemeContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

export default function ForumScreen({ navigation }) {
  const { isDarkTheme } = useContext(ThemeContext);
  const isDark = isDarkTheme;

  const [posts, setPosts] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [selectedFilterLabel, setSelectedFilterLabel] = useState("Latest");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  // fetch posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          body: data.body || "",
          likes: data.likes || 0,
          image: data.image || null,
          owner: data.ownerName || "Owner",
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        };
      });
      setPosts(arr);
    });
    return () => unsub();
  }, []);

  const handleShare = async (post: any) => {
    try {
      await Share.share({ message: post.title + (post.body ? `\n\n${post.body}` : "") });
    } catch (err) { console.log(err); }
  };

  const renderPost = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate("PostDetail", { post: item })}>
      <View style={{ padding: 12, backgroundColor: isDark ? "#1c1c1c" : "#fff", marginBottom: 8 }}>
        {item.image && <Image source={{ uri: item.image }} style={{ width: "100%", height: 180, borderRadius: 6, marginBottom: 8 }} />}
        <Text style={{ fontWeight: "bold", fontSize: 18, color: isDark ? "#fff" : "#000" }}>{item.title}</Text>
        {item.body ? <Text style={{ color: isDark ? "#ccc" : "#555" }}>{item.body}</Text> : null}
        <TouchableOpacity onPress={() => handleShare(item)} style={{ flexDirection: "row", marginTop: 8 }}>
          <Ionicons name="share-social" size={20} color="white" />
          <Text style={{ color: "white", marginLeft: 4 }}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff", padding: 12 }}>
      <FlatList
        data={posts.filter(p =>
          p.title.toLowerCase().includes(searchText.toLowerCase()) ||
          p.body.toLowerCase().includes(searchText.toLowerCase())
        )}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
