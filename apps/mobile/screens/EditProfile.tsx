import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

// PRESET PROFILE IMAGE OPTIONS
const profileImages = [
  "https://cdn-icons-png.freepik.com/512/11748/11748483.png",
  "https://cdn-icons-png.freepik.com/512/6833/6833605.png",
  "https://cdn.pixabay.com/photo/2021/01/04/10/37/icon-5887113_1280.png",
  "https://cdn-icons-png.freepik.com/256/6997/6997484.png"
];

function EditProfile({ route }) {
  const navigation = useNavigation();
  // initial values as passed by Profile
  const initialBio = route?.params?.initialAbout || '';
  const initialProfileImage = route?.params?.initialAvatar || profileImages[0];
  const [bio, setBio] = useState(initialBio);
  const [selectedProfileImage, setSelectedProfileImage] = useState(initialProfileImage);

  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert("You must be logged in to update your profile.");
        return;
      }
      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        profileImage: selectedProfileImage,
        bio: bio
      });
      Alert.alert("Profile updated!", "");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Update failed!", err.message || String(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar picker */}
      <Text style={styles.label}>Select Profile Picture:</Text>
      <View style={styles.imagePickerRow}>
        {profileImages.map((url) => (
          <TouchableOpacity key={url} onPress={() => setSelectedProfileImage(url)}>
            <Image
              source={{ uri: url }}
              style={[styles.profileThumb, selectedProfileImage === url && styles.selectedThumb]}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>About</Text>
      <TextInput style={[styles.input, styles.textarea]} value={bio} onChangeText={setBio} multiline />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, backgroundColor: '#f5f5f5', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, marginTop: 20, textAlign: 'center' },
  label: { fontSize: 17, fontWeight: '600', marginBottom: 5, marginTop: 17 },
  imagePickerRow: { flexDirection: "row", justifyContent: "center", marginVertical: 15 },
  profileThumb: { width: 60, height: 60, borderRadius: 30, marginHorizontal: 8, borderWidth: 2, borderColor: "#ccc" },
  selectedThumb: { borderColor: "#4f46e5", borderWidth: 3 },
  input: { backgroundColor: '#fff', borderRadius: 7, borderWidth: 1, borderColor: '#ccc', padding: 13, fontSize: 16, marginBottom: 6 },
  textarea: { minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  button: { backgroundColor: '#7b2cbf', paddingVertical: 14, borderRadius: 9, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancel: { backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 7, alignItems: 'center', marginTop: 10 },
});

export default EditProfile;
