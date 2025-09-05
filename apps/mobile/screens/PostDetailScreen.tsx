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
  ScrollView,
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
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import RenderHTML from "react-native-render-html";
import CustomAlert from "./CustomAlert";

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [postData, setPostData] = useState(post);
  const { theme } = useContext(ThemeContext);
  const { width, height } = Dimensions.get("window");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");
  const [usersMap, setUsersMap] = useState<{ [uid: string]: { displayName: string; profileImage: string } }>({});

  //load commenters
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));

    const commentsQ = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeComments = onSnapshot(commentsQ, async (snap) => {
      const commentsData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt ? d.data().createdAt.toDate() : new Date(),
      }));

      setComments(commentsData);

      // Fetch any new users that are not already in usersMap
      const uidsToFetch = commentsData
        .map((c) => c.authorUid)
        .filter((uid) => uid && !usersMap[uid]);

      if (uidsToFetch.length > 0) {
        const newUsers: { [uid: string]: { displayName: string; profileImage: string } } = {};
        await Promise.all(
          uidsToFetch.map(async (uid) => {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
              const data = docSnap.data();
              newUsers[uid] = {
                displayName: data.displayName || "Unknown",
                profileImage: data.profileImage || ""
              };
            } else {
              newUsers[uid] = { displayName: "Admin", profileImage: "https://cdn-icons-png.flaticon.com/512/9703/9703596.png" };
            }
          })
        );
        setUsersMap((prev) => {
          const updatedMap = { ...prev, ...newUsers };
          console.log("Updated usersMap:", updatedMap); // <-- log here
          return updatedMap;
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, [post.id, usersMap]);

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
        <Image
          source={{ uri: usersMap[item.authorUid]?.profileImage || "https://i.pinimg.com/236x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg" }}
          style={{ width: 30, height: 30, borderRadius: 15 }}
        />
        <Text style={[styles.commentAuthor, { color: theme.text }]}>
          {usersMap[item.authorUid]?.displayName || item.authorName || "Anonymous"}
        </Text>
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
    <FlatList
      style={[styles.container, { backgroundColor: theme.background }]}
      data={comments}
      keyExtractor={(i) => i.id}
      renderItem={renderComment}
      contentContainerStyle={{ paddingBottom: 80 }}
      ListHeaderComponent={
        <>
          {/* All your post content goes here */}
          {postData.images.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageSlider}
            >
              {postData.images.map((uri, index) =>
                uri ? (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={[styles.postImage, { width: width - 24, height: height * 0.3 }]}
                  />
                ) : null
              )}
            </ScrollView>
          )}

          <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: post.body }}
            baseStyle={{ color: theme.postBodyText, fontSize: 14 }}
          />

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

          <Text style={[styles.commentsTitle, { color: theme.text }]}>
            Comments ({comments.length})
          </Text>

          <View style={styles.commentInputRow}>
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
                placeholderTextColor={theme.dateGrey}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity onPress={addComment}>
                <Ionicons name="send" size={24} color={theme.text2} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>

          <CustomAlert
            message={alertMessage}
            visible={alertVisible}
            onHide={() => setAlertVisible(false)}
            type={alertType}
          />

        </>
      }
    />
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 12 },
  imageSlider: {
    marginBottom: 12,
  },
  postImage: {
    height: 500,
    resizeMode: "contain",
    borderRadius: 10,
    marginRight: 12,
  },
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
  commentInputRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  commentInput: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10 },
  commentActionsRow: { flexDirection: "row" },
  commentActionBtn: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  commentActionText: { marginLeft: 4 },
});