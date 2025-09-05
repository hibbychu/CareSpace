import React, { useRef, useState, useContext, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { ThemeContext } from "../ThemeContext";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CustomAlert from "./CustomAlert";
import { onAuthStateChanged } from "firebase/auth";

export default function CreatePostScreen() {
  const route = useRoute();
  const { type } = route.params ?? {};
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageLink, setImageLink] = useState("");
  const richText = useRef<RichEditor>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");
  const { theme } = useContext(ThemeContext);
  //check if user is logged in.
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const customAlert = (
    alertType: "success" | "error" | "info" | "warning",
    alertText: string
  ) => {
    setAlertMessage(alertText);
    setAlertType(alertType);
    setAlertVisible(true);
  };
  const handleAddImage = async () => {
    if (images.length >= 5) {
      customAlert("warning", "You can only upload up to 5 images.");
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      customAlert("error", "Permission to access media library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      setImages((prev) => [...prev, uri]); 
    }
  };

  const handleAddImageLink = () => {
    if (images.length >= 5) {
      customAlert("warning", "You can only upload up to 5 images.");
      return;
    }

    if (!imageLink.trim()) {
      customAlert("error", "Please enter a valid image URL.");
      return;
    }

    setImages((prev) => [...prev, imageLink.trim()]); // no insertImage here
    setImageLink("");
  };

  const handlePost = async () => {
    if (!user) {
      customAlert(
        "info",
        "Login required. Please sign in to create a post or report"
      );
      return;
    }
    const bodyHtml = await richText.current?.getContentHtml();
    if (!title.trim() || !bodyHtml?.trim()) {
      customAlert("error", "Title and body cannot be empty");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        body: bodyHtml,
        images,
        likes: 0,
        postType: type === "public" ? "post" : "report",
        ownerUid: type === "public" ? auth.currentUser?.uid : "",
        owner: auth.currentUser?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });

      customAlert("success", "Post created successfully");
      setTitle("");
      setImages([]);
      richText.current?.setContentHTML(""); // clear editor
    } catch (err) {
      console.error("Error adding post:", err);
      customAlert("error", "Failed to create post.");
      return;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handlePost}
          style={[
            styles.postButton,
            type === "anonymous"
              ? { backgroundColor: "#e63946" }
              : { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.postButtonText}>
            {type === "public" ? "Post Publicly" : "Make Anonymous Report"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title input */}
        <TextInput
          placeholder="Title"
          placeholderTextColor={theme.secondary}
          value={title}
          onChangeText={setTitle}
          style={[
            styles.titleInput,
            { color: theme.text, borderBottomColor: theme.secondary },
          ]}
        />

        {/* Add Image Link */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: theme.text, marginBottom: 4 }}>
            Add Image via Link
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              placeholder="Paste image URL"
              placeholderTextColor={theme.secondary}
              value={imageLink}
              onChangeText={setImageLink}
              style={{
                flex: 1,
                color: theme.text,
                borderBottomColor: theme.secondary,
                borderBottomWidth: 1,
                padding: 4,
              }}
            />
            <TouchableOpacity
              onPress={handleAddImageLink}
              style={{
                backgroundColor: theme.primary,
                padding: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff" }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toolbar with auto state tracking */}
        <RichToolbar
          editor={richText}
          actions={[actions.setBold, actions.setUnderline]}
          iconMap={{
            [actions.setBold]: () => (
              <MaterialIcons name="format-bold" size={24} color={theme.text} />
            ),
            [actions.setUnderline]: () => (
              <MaterialIcons
                name="format-underlined"
                size={24}
                color={theme.text}
              />
            ),
          }}
          style={{
            backgroundColor: theme.background,
            borderColor: theme.secondary,
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 8,
          }}
        />

        {/* Rich Editor */}
        <RichEditor
          ref={richText}
          placeholder="Write your post here..."
          style={[
            styles.richEditor,
            { backgroundColor: theme.background, borderColor: theme.secondary },
          ]}
          editorStyle={{
            backgroundColor: theme.background,
            color: theme.text,
            placeholderColor: theme.secondary,
            contentCSSText: "font-size: 16px; min-height: 300px;",
          }}
        />

        {/* Image previews */}
        <ScrollView horizontal style={{ marginTop: 10 }}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      </ScrollView>

      <CustomAlert
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  content: { flex: 1, marginTop: 10 },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  richEditor: { borderWidth: 1, borderRadius: 8, minHeight: 150, padding: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
});
