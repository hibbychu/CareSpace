import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [bold, setBold] = useState(false);
  const [underline, setUnderline] = useState(false);

  const handleAddImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    // Open image picker
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // use MediaTypeOptions if MediaType does not exist
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImages([...images, pickerResult.assets[0].uri]);
    }
  };

  const handlePost = () => {
    console.log({ title, body, images });
    // implement your post logic
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
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

        {/* Body input */}
        <TextInput
          placeholder="Write your post here..."
          value={body}
          onChangeText={setBody}
          style={[
            styles.bodyInput,
            bold && { fontWeight: 'bold' },
            underline && { textDecorationLine: 'underline' },
          ]}
          multiline
        />

        {/* Formatting toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={() => setBold(!bold)} style={styles.toolbarButton}>
            <MaterialIcons name="format-bold" size={24} color={bold ? '#7b2cbf' : '#555'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUnderline(!underline)} style={styles.toolbarButton}>
            <MaterialIcons name="format-underlined" size={24} color={underline ? '#7b2cbf' : '#555'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddImage} style={styles.toolbarButton}>
            <MaterialIcons name="image" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Preview selected images */}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#7b2cbf', // purple
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  postButtonText: {
    color: '#fff', // white text
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
  },
  bodyInput: {
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  toolbar: {
    flexDirection: 'row',
    marginTop: 10,
  },
  toolbarButton: {
    marginRight: 15,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default CreatePostScreen;
