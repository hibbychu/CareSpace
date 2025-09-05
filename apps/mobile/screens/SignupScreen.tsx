import { Image } from 'react-native';
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import CustomAlert from "./CustomAlert";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");


  const customAlert = async (alertType: "success" | "error" | "info" | "warning", alertText: string,) => {
    setAlertMessage(alertText);
    setAlertType(alertType);
    setAlertVisible(true);
  };

  const profileImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNKPxf1kaLpjwwABj7hshow0GKt0iNRNsBQg&s",
    "https://pngemoji.com/wp-content/uploads/2025/08/3d-red-beggar-emoji-holding-hat-money-crying-face.png",
    "https://media.tenor.com/KJ_DW8BB-FIAAAAe/beggar-emoji-begging.png",
    "https://i.imgflip.com/12mv0n.jpg?a488040"
  ];

  const [selectedProfileImage, setSelectedProfileImage] = useState(profileImages[0]); // Default to first image

  const handleSignup = async () => {
    if (!email || !password || !name) {
      customAlert("error", "Please fill in all the fields")
      return;
    }
    try {
      // 1. Sign up & update display name in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const uid = userCredential.user.uid;

      // 2. Store additional details in Firestore (users collection)
      await setDoc(doc(db, "users", uid), {
        profileImage: selectedProfileImage,
        displayName: name,
        createdAt: serverTimestamp(),
        bio: "No bio yet."
      });

      customAlert("success", "Account created successfully")
      navigation.navigate("Login");
    } catch (err) {
      customAlert("error", "Signup failed");
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleSignup} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ marginTop: 15 }}>Already have an account? Login</Text>
      </TouchableOpacity>

      <CustomAlert
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />
      <View style={styles.imagePickerRow}>
        {profileImages.map((url, idx) => (
          <TouchableOpacity key={url} onPress={() => setSelectedProfileImage(url)}>
            <Image
              source={{ uri: url }}
              style={[styles.profileThumb, selectedProfileImage === url && styles.selectedThumb]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  input: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#4f46e5", padding: 15, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  imagePickerRow: { flexDirection: "row", justifyContent: "center", marginVertical: 15 },
  profileThumb: { width: 60, height: 60, borderRadius: 30, marginHorizontal: 8, borderWidth: 2, borderColor: "#ccc" },
  selectedThumb: { borderColor: "#4f46e5", borderWidth: 3 },
});
