// PostDetailScreen.tsx
import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../ThemeContext"; // adjust path if needed

const PostDetailScreen = ({ route }) => {
  const { post } = route.params; // passed from ForumScreen
  const { isDarkTheme } = useContext(ThemeContext); // consume theme
  const isDark = isDarkTheme;

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: "1", text: "Nice post!", author: "Alice" },
    { id: "2", text: "I agree!", author: "Bob" },
  ]);

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([...comments, { id: Date.now().toString(), text: commentText, author: "You" }]);
    setCommentText("");
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>{post.title}</Text>
      <Text style={[styles.body, { color: isDark ? "#ccc" : "#555" }]}>{post.body}</Text>
      <Text style={[styles.date, { color: isDark ? "#888" : "#888" }]}>Posted on: {new Date().toLocaleDateString()}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#7b2cbf" }]}>
          <Ionicons name="heart" size={20} color="white" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#7b2cbf" }]}>
          <MaterialIcons name="report" size={20} color="white" />
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.commentsTitle, { color: isDark ? "#fff" : "#000" }]}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={[styles.commentAuthor, { color: isDark ? "#fff" : "#000" }]}>{item.author}:</Text>
            <Text style={[styles.commentText, { color: isDark ? "#ccc" : "#555" }]}>{item.text}</Text>
          </View>
        )}
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
  comment: { flexDirection: "row", marginBottom: 4 },
  commentAuthor: { fontWeight: "bold", marginRight: 4 },
  commentText: { flex: 1 },
  commentInputRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});
