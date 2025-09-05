// PostDetailScreen.tsx
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../ThemeContext";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import RenderHTML from "react-native-render-html";
import CustomAlert from "./CustomAlert";

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [postData, setPostData] = useState(post);
  const { theme } = useContext(ThemeContext);
  const { width } = Dimensions.get("window");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");


  // Load comments + auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));

    const commentsQ = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeComments = onSnapshot(commentsQ, (snap) => {
      setComments(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt
            ? d.data().createdAt.toDate()
            : new Date(),
        }))
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, [post.id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      setAlertMessage("Login required. Please sign in to add a comment.");
      setAlertType("info");
      setAlertVisible(true);
      return;
    }

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        text: commentText.trim(),
        authorName: user.displayName || user.email || "Anonymous",
        authorUid: user.uid,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (err) {
      console.log("add comment error", err);
      setAlertMessage("Error. Unable to post comment.");
      setAlertType("info");
      setAlertVisible(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: post.title + (post.body ? `\n\n${post.body}` : "")
      });
    } catch (err) {
      console.log("Error sharing post:", err);
    }
  };

  const likePost = async () => {
    try {
      const ref = doc(db, "posts", post.id);
      await updateDoc(ref, { likes: increment(1) });

      setPostData((prev) => ({ ...prev, likes: prev.likes + 1 }));
    } catch (err) {
      console.log("comment upvote error", err);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const ref = doc(db, "posts", post.id, "comments", commentId);
      await updateDoc(ref, { likes: increment(1) });
    } catch (err) {
      console.log("comment upvote error", err);
    }
  };

  const handleReport = async () => {
    setAlertMessage("Reported Submitted. \nThe moderation team will review this.");
    setAlertType("success");
    setAlertVisible(true);
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentContainer, { backgroundColor: theme.commentBackground }]}>
      <TouchableOpacity
        style={styles.commentHeader}
        onPress={() => navigation.navigate("Profile", { uid: item.authorUid })}
      >
        <Ionicons name="person-circle" size={30} color={theme.text} />
        <Text style={[styles.commentAuthor, { color: theme.text }]}>{item.authorName}</Text>
        <Text style={[styles.commentTime, { color: theme.dateGrey }]}>{item.createdAt.toLocaleString()}</Text>
      </TouchableOpacity>

      <Text style={[styles.commentText, { color: theme.postBodyText }]}>{item.text}</Text>

      <View style={styles.commentActionsRow}>
        <TouchableOpacity style={styles.commentActionBtn} onPress={() => likeComment(item.id)}>
          <Ionicons name="heart" size={20} color={theme.text2} />
          <Text style={[styles.commentActionText, { color: theme.text }]}>{item.likes}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.commentActionBtn} onPress={() => handleReport()}>
          <MaterialIcons name="report" size={20} color={theme.reportRed} />
          <Text style={[styles.commentActionText, { color: theme.text }]}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
      <RenderHTML
        contentWidth={width - 40}
        source={{ html: post.body }}
        baseStyle={{ color: theme.postBodyText, fontSize: 14 }}
        tagsStyles={{
          b: { fontWeight: "bold" },
          strong: { fontWeight: "bold" },
          u: { textDecorationLine: "underline" },
          i: { fontStyle: "italic" },
        }}
      />

      {/* Owner Section */}
      {post.postType !== "report" && (
        <TouchableOpacity
          style={styles.ownerSection}
          onPress={() => navigation.navigate("Profile", { uid: post.ownerUid })}
        >
          <Ionicons name="person-circle" size={40} color={theme.text} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.ownerName, { color: theme.text }]}>{post.ownerName || "Owner of Post"}</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={[styles.date, { color: theme.dateGrey }]}>
        Posted on: {new Date().toLocaleDateString()}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => likePost()} style={[styles.actionBtn, { backgroundColor: theme.text2 }]} >
          <Ionicons name="heart" size={20} color="white" />
          <Text style={styles.actionText}>{postData.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.text2 }]} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="white" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#d32f2f" }]} onPress={handleReport}>
          <MaterialIcons name="report" size={20} color="white" />
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.commentsTitle, { color: theme.text }]}>Comments ({comments.length})</Text>
      <FlatList
        data={comments}
        keyExtractor={(i) => i.id}
        renderItem={renderComment}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View style={styles.commentInputRow}>
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.bottomBorder,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={theme.searchBarBackground}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={addComment}>
          <Ionicons name="send" size={24} color={theme.text2} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      <CustomAlert
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  body: { fontSize: 16, marginBottom: 8 },
  ownerSection: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  ownerName: { fontWeight: "bold" },
  date: { marginVertical: 10 },
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
  commentContainer: { borderRadius: 10, padding: 8, marginBottom: 8 },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  commentAuthor: { fontWeight: "bold", marginLeft: 6 },
  commentTime: { marginLeft: 8, fontSize: 12 },
  commentText: { fontSize: 14, marginBottom: 6 },
  commentsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  commentInputRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  commentInput: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10 },
  commentActionsRow: { flexDirection: "row" },
  commentActionBtn: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  commentActionText: { marginLeft: 4 },
});