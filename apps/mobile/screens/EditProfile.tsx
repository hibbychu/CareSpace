import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

function EditProfile({ route }) {
  const navigation = useNavigation();
  const initialName = route?.params?.initialName || '';
  const initialEmail = route?.params?.initialEmail || '';
  const initialAbout = route?.params?.initialAbout || '';
  const initialAvatar = route?.params?.initialAvatar || '';
  
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [about, setAbout] = useState(initialAbout);
  const [avatar, setAvatar] = useState(initialAvatar); // profile pic

  // Function to pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    alert('Profile updated!');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar section */}
      <View style={styles.avatarBorder}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.selectPicBtn}>
        <Text style={styles.selectPicText}>Upload / Change Profile Picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      {/* <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType='email-address' /> */}
      <Text style={styles.label}>About</Text>
      <TextInput style={[styles.input, styles.textarea]} value={about} onChangeText={setAbout} multiline />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, backgroundColor: '#f5f5f5', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, marginTop: 20, textAlign: 'center' },
  avatarBorder: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#7b2cbf', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12, backgroundColor: '#fff' },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#eee' },
  selectPicBtn: { alignSelf: 'center', marginBottom: 10 },
  selectPicText: { color: '#7b2cbf', fontSize: 16, textDecorationLine: 'underline' },
  label: { fontSize: 17, fontWeight: '600', marginBottom: 5, marginTop: 11 },
  input: { backgroundColor: '#fff', borderRadius: 7, borderWidth: 1, borderColor: '#ccc', padding: 13, fontSize: 16, marginBottom: 6 },
  textarea: { minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  button: { backgroundColor: '#7b2cbf', paddingVertical: 14, borderRadius: 9, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancel: { backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 7, alignItems: 'center', marginTop: 10 },
});

export default EditProfile;
