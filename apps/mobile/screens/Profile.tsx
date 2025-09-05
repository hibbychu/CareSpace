import { Image } from "react-native";
import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../ThemeContext";
import CustomAlert from "./CustomAlert";

const Profile: React.FC = ({ navigation, route }) => {
  const [user, setUser] = useState(null); // currently logged in user
  const [profileUser, setProfileUser] = useState(null); // details to display
  const [guestMode, setGuestMode] = useState(false);
  const uidFromParams = route?.params?.uid;
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  const customAlert = (
    alertType: "success" | "error" | "info" | "warning",
    alertText: string
  ) => {
    setAlertMessage(alertText);
    setAlertType(alertType);
    setAlertVisible(true);
  };

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        if (uidFromParams) {
          // Viewing another user's profile
          const profileRef = doc(db, "users", uidFromParams);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setProfileUser(profileSnap.data());
            setGuestMode(false);
          } else {
            setProfileUser({
              displayName: "Unknown User",
              email: "Not found",
              bio: "No profile available.",
            });
            setGuestMode(true);
          }
        } else if (user) {
          // Viewing logged-in user's profile
          const profileRef = doc(db, "users", user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setProfileUser(profileSnap.data());
            setGuestMode(false);
          } else {
            setProfileUser({
              displayName: user.displayName || user.email,
              email: user.email,
              bio: user.bio,
            });
            setGuestMode(false);
          }
        } else {
          // Guest
          setProfileUser({
            displayName: "Guest",
            email: "Not logged in",
            bio: "No bio available.",
          });
          setGuestMode(true);
        }
      };

      fetchProfile();
    }, [uidFromParams, user])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate("Login");
    } catch (err) {
      console.error("Logout error:", err);
      customAlert("error", "Unable to logout");
    }
  };

  // Only allow edit/logout for own profile (not when viewing another user's profile or guest)
  const isOwnProfile = !uidFromParams && !!user;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {profileUser?.profileImage ? (
          <Image
            source={{ uri: profileUser.profileImage }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: "" }} // fallback image
            style={styles.avatar}
            resizeMode="cover"
          />
        )}

        <Text style={styles.name}>{profileUser?.displayName}</Text>
        <Text style={styles.email}>{profileUser?.email}</Text>

        {isOwnProfile && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}

        {!uidFromParams && !user && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.sectionContent}>{profileUser?.bio}</Text>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        message={alertMessage}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      padding: 24,
      backgroundColor: theme.background,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 14,
      marginTop: 40,
      borderWidth: 2,
      borderColor: "#ddd",
    },
    name: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 2,
      color: theme.text,
    },
    email: { fontSize: 16, color: theme.dateGrey, marginBottom: 16 },
    button: {
      backgroundColor: "#7b2cbf",
      paddingVertical: 13,
      paddingHorizontal: 50,
      borderRadius: 10,
      marginVertical: 8,
      width: "95%",
      alignItems: "center",
    },
    logoutButton: { backgroundColor: "#ef4444" },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 1,
    },
    section: {
      marginTop: 30,
      width: "100%",
      backgroundColor: theme.cardBackground,
      padding: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
      color: theme.text,
    },
    sectionContent: { fontSize: 15, color: theme.text, lineHeight: 22 },
  });

export default Profile;
