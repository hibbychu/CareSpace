import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import CustomAlert from "./CustomAlert";
import { ThemeContext } from "../ThemeContext";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async () => {
    if (!email || !password) {
      customAlert("error", "Please fill all fields");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("ProfileMain");
    } catch (err: any) {
      customAlert("error", "Login Failed");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.title}>Login</Text>

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

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    logo: {
      height:200,
      width:200
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
      fontSize: 18
    },
  });
