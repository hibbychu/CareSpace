// PostDetailScreen.tsx
import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../ThemeContext"; // adjust path if needed

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const { isDarkTheme } = useContext(ThemeContext);
  const isDark = isDarkTheme;

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: "1", text: "Nice post!", author: "Alice", avatar: null, likes: 2, createdAt: new Date(Date.now() - 3600 * 1000) },
    { id: "2", text: "I agree!", author: "Bob", avatar: null, likes: 3, createdAt: new Date(Date.now() - 7200 * 1000) },
  ]);

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        text: commentText,
        author: "You",
        avatar: null,
        likes: 0,
        createdAt: new Date()
      }
    ]);
    setCommentText("");
  };

  const handleUpvote = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  const handleReport = (id: string) => {
    Alert.alert("Reported", "This comment has been reported.");
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentContainer, { backgroundColor: isDark ? "#1c1c1c" : "#DADADA" }]}>
      <TouchableOpacity style={styles.commentHeader} onPress={() => Alert.alert("Profile clicked", `Navigate to ${item.author}'s profile`)}>
        <Ionicons name="person-circle" size={30} color={isDark ? "#fff" : "#000"} />
        <Text style={[styles.commentAuthor, { color: isDark ? "#fff" : "#000" }]}>{item.author}</Text>
        <Text style={[styles.commentTime, { color: isDark ? "#aaa" : "#666" }]}>
          {item.createdAt.toLocaleString()}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.commentText, { color: isDark ? "#ccc" : "#333" }]}>{item.text}</Text>

      <View style={styles.commentActionsRow}>
        <TouchableOpacity style={styles.commentActionBtn} onPress={() => handleUpvote(item.id)}>
          <Ionicons name="heart" size={20} color={isDark ? "#bb86fc" : "#7b2cbf"} />
          <Text style={[styles.commentActionText, { color: isDark ? "#fff" : "#000" }]}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentActionBtn} onPress={() => handleReport(item.id)}>
          <MaterialIcons name="report" size={20} color={isDark ? "#ff6b6b" : "#d32f2f"} />
          <Text style={[styles.commentActionText, { color: isDark ? "#fff" : "#000" }]}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>

      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>{post.title}</Text>
      <Text style={[styles.body, { color: isDark ? "#ccc" : "#555" }]}>{post.body}</Text>

       {/* Owner Section */}
      <TouchableOpacity style={styles.ownerSection} onPress={() => Alert.alert("Owner clicked", `Navigate to ${post.owner || "Owner"}'s profile`)}>
        <Ionicons name="person-circle" size={40} color={isDark ? "#fff" : "#000"} />
        <View style={{ marginLeft: 8 }}>
          <Text style={[styles.ownerName, { color: isDark ? "#fff" : "#000" }]}>{post.owner || "Owner of post"}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.date, { color: isDark ? "#888" : "#888" }]}>
        Posted on: {new Date().toLocaleDateString()}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#7b2cbf" }]}>
          <Ionicons name="heart" size={20} color="white" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#d32f2f" }]}>
          <MaterialIcons name="report" size={20} color="white" />
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.commentsTitle, { color: isDark ? "#fff" : "#000" }]}>Comments ({comments.length})</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View style={styles.commentInputRow}>
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#555" : "#ccc",
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={addComment}>
          <Ionicons name="send" size={24} color={isDark ? "#bb86fc" : "#7b2cbf"} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  ownerSection: {
    flexDirection: "row",   // aligns children in a row
    alignItems: "center",   // vertically centers them
    marginBottom: 12,
  },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  body: { fontSize: 14, marginBottom: 8 },
  date: { fontSize: 12, marginBottom: 12 },
  actionsRow: { flexDirection: "row", marginBottom: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  actionText: { color: "white", marginLeft: 4 },
  commentsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  commentContainer: {
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  commentAuthor: { fontWeight: "bold", marginLeft: 6 },
  commentTime: { marginLeft: 8, fontSize: 12 },
  commentText: { fontSize: 14, marginBottom: 6 },
  commentActionsRow: { flexDirection: "row" },
  commentActionBtn: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  commentActionText: { marginLeft: 4 },
  commentInputRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});
