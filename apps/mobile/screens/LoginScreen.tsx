import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import CustomAlert from "./CustomAlert";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning">("info");

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertMessage("Please fill all fields");
      setAlertType("error");
      setAlertVisible(true);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAlertMessage("Login successfully");
      setAlertType("success");
      setAlertVisible(true);
      navigation.replace("ProfileMain");
    } catch (err: any) {
      setAlertMessage("Login Failed");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={{ marginTop: 15 }}>Don't have an account? Sign Up</Text>
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

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  input: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#4f46e5", padding: 15, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
