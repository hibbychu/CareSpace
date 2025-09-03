// ForumScreen.tsx
import React, { useState, useContext } from "react";
import { Share } from "react-native";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Menu } from "react-native-paper";
import { ThemeContext } from "../ThemeContext";

const posts = [
    { id: "1", title: "Looking for cricket mates! Anyone keen for ...", body: "Hi everyone, I'm new here and looking to find some friends to play cricket with on the weekends. I'm keen to get a regular group together for some friendly matches.", likes: 24, image: null, createdAt: new Date("2025-09-01T10:00:00"), },
    { id: "2", title: "The food at this hawker is good. Reminds m...", body: "", likes: 69, image: "https://picsum.photos/400/250", createdAt: new Date("2025-09-03T09:15:00"), },
    { id: "3", title: "What's the best way to send money to India...", body: "Just wanted to get some advice from those of you who regularly send money back home. What's the best way to do it now? My old method seems not to be working...", likes: 11, image: null, createdAt: new Date("2025-09-02T15:30:00"), },
];

const pickerOptions = [
    { label: "Latest", value: "latest" },
    { label: "Popular Today", value: "popular_today" },
    { label: "Popular Week", value: "popular_week" },
    { label: "Popular Month", value: "popular_month" },
];

const ForumScreen = ({ navigation }) => {
    const { isDarkTheme } = useContext(ThemeContext); // ← use the context
    const isDark = isDarkTheme;
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("latest");
    const [selectedFilterLabel, setSelectedFilterLabel] = useState("Latest");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchText, setSearchText] = useState("");

    const getFilteredPosts = () => {
        let filteredPosts = posts.filter(post =>
            post.title.toLowerCase().includes(searchText.toLowerCase()) ||
            post.body.toLowerCase().includes(searchText.toLowerCase())
        );

        const now = new Date();

        switch (selectedFilter) {
            case "latest":
                filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case "popular_day":
                filteredPosts = filteredPosts.filter(
                    post => post.createdAt.toDateString() === now.toDateString()
                );
                filteredPosts.sort((a, b) => b.likes - a.likes);
                break;
            case "popular_week":
                filteredPosts = filteredPosts.filter(
                    post => getWeekNumber(post.createdAt) === getWeekNumber(now) &&
                        post.createdAt.getFullYear() === now.getFullYear()
                );
                filteredPosts.sort((a, b) => b.likes - a.likes);
                break;
            case "popular_month":
                filteredPosts = filteredPosts.filter(
                    post => post.createdAt.getMonth() === now.getMonth() &&
                        post.createdAt.getFullYear() === now.getFullYear()
                );
                filteredPosts.sort((a, b) => b.likes - a.likes);
                break;
            default:
                break;
        }
        return filteredPosts;
    };

    // helper function to get week number
    const getWeekNumber = (date: Date) => {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const millisecsInDay = 86400000;
        return Math.ceil(((date.getTime() - onejan.getTime()) / millisecsInDay + onejan.getDay() + 1) / 7);
    };

    const handleShare = async (post: any) => {
        try {
            const message = post.title + (post.body ? `\n\n${post.body}` : "");
            await Share.share({
                message,
            });
        } catch (error) {
            console.log("Error sharing post:", error);
        }
    };

    const renderPost = ({ item }: any) => (
        <TouchableOpacity onPress={() => navigation.navigate("PostDetail", { post: item })}>
            <View style={[styles.postContainer, { backgroundColor: isDark ? "#1c1c1c" : "#fff" }]}>
                {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
                <Text style={[styles.postTitle, { color: isDark ? "#fff" : "#000" }]} numberOfLines={1}>{item.title}</Text>
                {item.body ? <Text style={[styles.postBody, { color: isDark ? "#ccc" : "#555" }]}>{item.body}</Text> : null}

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
            <View style={[styles.bottomBorder, { backgroundColor: isDark ? "#444" : "gray" }]} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
            {/* Filter/Search Bar */}
            <View style={styles.filterSearchBarBg}>
                {!isSearchMode ? (
                    <>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                                    <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 16 }}>
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
                            <Ionicons name="search" size={30} color={isDark ? "#fff" : "grey"} style={{ marginLeft: 15 }} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: isDark ? "#333" : "#f0f0f0", color: isDark ? "#fff" : "#000" }]}
                            placeholder="Search posts..."
                            placeholderTextColor={isDark ? "#aaa" : "#888"}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => setIsSearchMode(false)}>
                            <Ionicons name="close" size={30} color={isDark ? "#fff" : "grey"} style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.bottomBorder, { backgroundColor: isDark ? "#444" : "gray" }]} />
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
