import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

function Profile() {
  // Replace these with state/props as needed!
  const user = {
    avatar: 'https://via.placeholder.com/120',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    about: 'Hello! I love building mobile apps with React Native and exploring UI design.',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <Image source={{ uri: user.avatar }} style={styles.avatar} />

      {/* Name & Email */}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.sectionContent}>{user.about}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 14,
    marginTop: 40,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4f46e5',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 13,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginVertical: 8,
    width: '95%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  section: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222'
  },
  sectionContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});

export default Profile;
