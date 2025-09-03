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
            <View style={[styles.postContainer, { backgroundColor: theme.background }]}>
                {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
                <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                {item.body ? <Text style={[styles.postBody, { color: theme.postBodyText }]}>{item.body}</Text> : null}

                <View style={[styles.actionsRow, { backgroundColor: "#9688B2" }]}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="heart" size={20} color="white" />
                        <Text style={styles.actionText}>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
                        <Ionicons name="share-social" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.bottomBorder, { backgroundColor: theme.bottomBorder }]} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Filter/Search Bar */}
            <View style={styles.filterSearchBarBg}>
                {!isSearchMode ? (
                    <>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                                    <Text style={{ color: theme.text, fontSize: 16 }}>
                                        {selectedFilterLabel} ▾
                                    </Text>
                                </TouchableOpacity>
                            }
                            contentStyle={{ backgroundColor: "#9688B2" }}
                        >
                            {pickerOptions.map(opt => (
                                <Menu.Item
                                    key={opt.value}
                                    onPress={() => {
                                        setSelectedFilter(opt.value);
                                        setSelectedFilterLabel(opt.label);
                                        setMenuVisible(false);
                                    }}
                                    title={opt.label}
                                    titleStyle={{ color: "white" }}
                                />
                            ))}
                        </Menu>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity onPress={() => setIsSearchMode(true)}>
                            <Ionicons name="search" size={30} color={theme.iconsGrey} style={{ marginLeft: 15 }} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: theme.searchBarBackground, color: theme.text }]}
                            placeholder="Search posts..."
                            placeholderTextColor={theme.searchBarPlaceHolderText}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => setIsSearchMode(false)}>
                            <Ionicons name="close" size={30} color={theme.iconsGrey} style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.bottomBorder, { backgroundColor: theme.bottomBorder }]} />
            </View>

            {/* Post Feed */}
            <FlatList
                data={getFilteredPosts()}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 70 }}
            />
        </View>
    );
};

export default ForumScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterSearchBarBg: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        position: "relative",
    },
    bottomBorder: {
        height: 1,
        position: "absolute",
        left: 10,
        right: 10,
        bottom: 0,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        borderRadius: 6,
        paddingHorizontal: 10,
    },
    postContainer: {
        padding: 12,
    },
    postTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 4 },
    postBody: { fontSize: 14, marginBottom: 8 },
    postImage: { width: "100%", height: 180, borderRadius: 6, marginBottom: 8 },
    actionsRow: {
        flexDirection: "row",
        marginTop: 4,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
        paddingHorizontal: 15,
        marginRight: 8,
    },
    actionText: { color: "white", marginLeft: 4, fontSize: 12 },
});
