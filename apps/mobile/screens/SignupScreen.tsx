import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      Alert.alert("Success", "Account created!");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Signup failed", err.message);
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
});
