import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";

export default function CreatePostScreen() {
  const route = useRoute();
  const { type } = route.params ?? {};

  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const richText = useRef<RichEditor>(null);

  const handleAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      richText.current?.insertImage(uri);
      setImages([...images, uri]);
    }
  };

  const handlePost = async () => {
    const bodyHtml = await richText.current?.getContentHtml();
    console.log({ title, bodyHtml, images, type });
    // Implement post logic
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handlePost} style={[
          styles.postButton,
          type === "anonymous" && { backgroundColor: "#e63946" },
          type === "public" && { backgroundColor: "#7b2cbf" }, 
        ]}>
          <Text style={styles.postButtonText}>{type === "public" ? "Post Publicly" : "Make Anonymous Report"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title input */}
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        {/* Toolbar with auto state tracking */}
        <RichToolbar
          editor={richText}
          actions={[actions.setBold, actions.setUnderline, actions.insertImage]}
          iconMap={{
            [actions.setBold]: () => <MaterialIcons name="format-bold" size={24} color="#555" />,
            [actions.setUnderline]: () => <MaterialIcons name="format-underlined" size={24} color="#555" />,
            [actions.insertImage]: () => <MaterialIcons name="image" size={24} color="#555" />,
          }}
          onPressAddImage={handleAddImage}
        />

        {/* Rich Editor */}
        <RichEditor
          ref={richText}
          placeholder="Write your post here..."
          style={styles.richEditor}
          editorStyle={{
            backgroundColor: "#fff",
            color: "#000",
            placeholderColor: "#999",
            contentCSSText: "font-size: 16px; min-height: 150px;",
          }}
        />

        {/* Image previews */}
        <ScrollView horizontal style={{ marginTop: 10 }}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 12, paddingTop: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  content: { flex: 1, marginTop: 10 },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  richEditor: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, minHeight: 150, padding: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
});
