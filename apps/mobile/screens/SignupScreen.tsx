import { Image } from "react-native";
import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import CustomAlert from "./CustomAlert";
import { ThemeContext } from "../ThemeContext";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");

  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const customAlert = (alertType: "success" | "error" | "info" | "warning", alertText: string) => {
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

  const [selectedProfileImage, setSelectedProfileImage] = useState(profileImages[0]); // Default

  const handleSignup = async () => {
    if (!email || !password || !name) {
      customAlert("error", "Please fill in all the fields");
      return;
    }
    try {
      // 1. Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const uid = userCredential.user.uid;

      // 2. Store details in Firestore
      await setDoc(doc(db, "users", uid), {
        profileImage: selectedProfileImage,
        displayName: name,
        createdAt: serverTimestamp(),
        bio: "No bio yet.",
      });

      customAlert("success", "Account created successfully");
      navigation.navigate("Login");
    } catch (err) {
      customAlert("error", "Signup failed");
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

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

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={theme.dateGrey}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.dateGrey}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.dateGrey}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleSignup} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>

      <CustomAlert
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />


    </View>
  );
};

export default SignupScreen;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      marginBottom: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    input: {
      width: "100%",
      padding: 12,
      borderWidth: 1,
      borderColor: theme.bottomBorder,
      borderRadius: 8,
      marginBottom: 12,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    button: {
      backgroundColor: theme.text2,
      padding: 15,
      borderRadius: 8,
      width: "100%",
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    linkText: {
      marginTop: 15,
      color: theme.text2,
    },
    imagePickerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 15,
    },
    profileThumb: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginHorizontal: 8,
      borderWidth: 2,
      borderColor: theme.bottomBorder,
    },
    selectedThumb: {
      borderColor: theme.text2,
      borderWidth: 5,
    },
  });
