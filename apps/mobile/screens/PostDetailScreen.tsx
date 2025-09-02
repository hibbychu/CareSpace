// PostDetailScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const PostDetailScreen = ({ route }) => {
  const { post } = route.params; // passed from ForumScreen
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
    <View style={styles.container}>
      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.date}>Posted on: {new Date().toLocaleDateString()}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart" size={20} color="white" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MaterialIcons name="report" size={20} color="white" />
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commentsTitle}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentAuthor}>{item.author}:</Text>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={addComment}>
          <Ionicons name="send" size={24} color="#7b2cbf" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  body: { fontSize: 14, color: "#555", marginBottom: 8 },
  date: { fontSize: 12, color: "#888", marginBottom: 12 },
  actionsRow: { flexDirection: "row", marginBottom: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7b2cbf",
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
    borderColor: "#ccc",
    paddingHorizontal: 10,
  },
});
