import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import EditProfile from './EditProfile';
import { useNavigation } from '@react-navigation/native';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface Props {
  navigation: any; // React Navigation prop
}

const Profile: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out successfully");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      Alert.alert("Error", "Unable to logout");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <Image
        source={{ uri: user?.photoURL || 'https://via.placeholder.com/120' }}
        style={styles.avatar}
      />

      {/* User Info */}
      <Text style={styles.name}>{user?.displayName || "Guest"}</Text>
      <Text style={styles.email}>{user?.email || "Not logged in"}</Text>

      {/* Action Buttons */}
      {user ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.sectionContent}>
          Hello! I love building mobile apps with React Native and exploring UI design.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#f2f2f2' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 14, marginTop: 40, borderWidth: 2, borderColor: '#ddd' },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 2, color: '#222' },
  email: { fontSize: 16, color: '#666', marginBottom: 16 },
  button: { backgroundColor: '#7b2cbf', paddingVertical: 13, paddingHorizontal: 50, borderRadius: 10, marginVertical: 8, width: '95%', alignItems: 'center' },
  logoutButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  section: { marginTop: 30, width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#222' },
  sectionContent: { fontSize: 15, color: '#444', lineHeight: 22 },
});

export default Profile;
