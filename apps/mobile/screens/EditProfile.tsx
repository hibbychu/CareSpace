import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

function EditProfile({ initialName, initialEmail, initialAbout, onClose }) {
  const [name, setName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [about, setAbout] = useState(initialAbout || '');

  const handleSave = () => {
    // Add backend/save logic here
    alert('Profile updated!');
    onClose();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType='email-address' />
      <Text style={styles.label}>About</Text>
      <TextInput style={[styles.input, styles.textarea]} value={about} onChangeText={setAbout} multiline />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, backgroundColor: '#f5f5f5', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 17, fontWeight: '600', marginBottom: 5, marginTop: 11 },
  input: { backgroundColor: '#fff', borderRadius: 7, borderWidth: 1, borderColor: '#ccc', padding: 13, fontSize: 16, marginBottom: 6 },
  textarea: { minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  button: { backgroundColor: '#7b2cbf', paddingVertical: 14, borderRadius: 9, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancel: { backgroundColor: '#888', paddingVertical: 10, borderRadius: 7, alignItems: 'center', marginTop: 10 },
});

export default EditProfile;
