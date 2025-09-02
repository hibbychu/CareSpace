// ForumScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

const posts = [
    {
        id: "1",
        title: "Looking for cricket mates! Anyone keen for ...",
        body: "Hi everyone, I'm new here and looking to find some friends to play cricket with on the weekends. I'm keen to get a regular group together for some friendly matches.",
        likes: 24,
        image: null,
    },
    {
        id: "2",
        title: "The food at this hawker is good. Reminds m...",
        body: "",
        likes: 69,
        image: "https://picsum.photos/400/250", // placeholder
    },
    {
        id: "3",
        title: "What's the best way to send money to India...",
        body: "Just wanted to get some advice from those of you who regularly send money back home. What's the best way to do it now? My old method seems not to be working...",
        likes: 11,
        image: null,
    },
];

const pickerOptions = [
    { label: "Latest", value: "latest" },
    { label: "Popular Today", value: "popular_today" },
    { label: "Popular Week", value: "popular_week" },
    { label: "Popular Month", value: "popular_month" },
];

const ForumScreen = () => {
    const [selectedFilter, setSelectedFilter] = useState("latest");
    const [selectedFilterLabel, setSelectedFilterLabel] = useState("Latest");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchText, setSearchText] = useState("");

    const renderPost = ({ item }: any) => (
        <View style={styles.postContainer}>
            {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
            <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
            {item.body ? <Text style={styles.postBody}>{item.body}</Text> : null}

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="heart" size={20} color="white" />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <MaterialIcons name="chat-bubble-outline" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="share-social" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Filter/Search Bar */}
            <View style={styles.filterSearchBarBg}>
                {!isSearchMode ? (
                    <>
                        <Picker
                            selectedValue={selectedFilter}
                            onValueChange={(itemValue) => {
                                setSelectedFilter(itemValue);
                                const label = pickerOptions.find(opt => opt.value === itemValue)?.label || "";
                                setSelectedFilterLabel(label);
                            }}
                            style={styles.picker}
                            dropdownIconColor="gray"
                        >
                            {pickerOptions.map(opt => (
                                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                            ))}
                        </Picker>

                        {/* Spacer pushes search to the right */}
                        <View style={{ flex: 1 }} />

                        <TouchableOpacity onPress={() => setIsSearchMode(true)}>
                            <Ionicons name="search" size={30} color="grey" style={{ marginLeft: 15 }} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search posts..."
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => setIsSearchMode(false)}>
                            <Ionicons name="close" size={30} color="grey" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomBorder} />
            </View>

            {/* Post Feed */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 70 }}
            />
        </View>
    );
};

export default ForumScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    filterSearchBarBg: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        position: "relative",
    },
    bottomBorder: {
        height: 1,
        backgroundColor: "#ccc",
        position: "absolute",
        left: 10,
        right: 10,
        bottom: 0,
    },
    picker: {
        width: 180,
        height: 50,
        fontSize: 14
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "black",
        borderRadius: 6,
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 10,
    },
    postContainer: {
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        padding: 12,
    },
    postTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
    postBody: { color: "#555", fontSize: 13, marginBottom: 8 },
    postImage: { width: "100%", height: 180, borderRadius: 6, marginBottom: 8 },
    actionsRow: {
        flexDirection: "row",
        marginTop: 4,
        backgroundColor: "#9688B2",
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
