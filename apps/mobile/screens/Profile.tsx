import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import EditProfile from './EditProfile';

function Profile() {
  const [modalVisible, setModalVisible] = useState(false);

  const user = {
    avatar: 'https://via.placeholder.com/120',
    name: 'Jane Doe',
    about: 'Hello! I love building mobile apps with React Native and exploring UI design.',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{user.name}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.sectionContent}>{user.about}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* EditProfile modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <EditProfile
          initialName={user.name}
          initialEmail={user.email}
          initialAbout={user.about}
          onClose={() => setModalVisible(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#f2f2f2' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 14, marginTop: 40, borderWidth: 2, borderColor: '#ddd' },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 2, color: '#222' },
  email: { fontSize: 16, color: '#666', marginBottom: 16 },
  button: { backgroundColor: '#4f46e5', paddingVertical: 13, paddingHorizontal: 50, borderRadius: 10, marginVertical: 8, width: '95%', alignItems: 'center' },
  logoutButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  section: { marginTop: 30, width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#222' },
  sectionContent: { fontSize: 15, color: '#444', lineHeight: 22 },
});

export default Profile;
