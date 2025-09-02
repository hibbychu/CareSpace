import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

// Simple radio button component for React Native
function RadioButton({ selected, onPress, label }) {
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const categories = [
  'Unsafe Equipment',
  'Poor Lighting',
  'Blocked Exits',
  'Chemical Hazard',
  'Other',
];

function Reporting() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [contractor, setContractor] = useState('');
  const [location, setLocation] = useState('');
  const [datetime, setDatetime] = useState('');
  const [image, setImage] = useState(null);

  // Image pick placeholder (you need expo-image-picker for real image selection)
  const handleImagePick = () => {
    alert('Image picker functionality goes here');
  };

  const handleSubmit = () => {
    if (!category || !description) {
      alert('Category and description are required.');
      return;
    }
    alert('Your anonymous report has been submitted.');
    setCategory('');
    setDescription('');
    setContractor('');
    setLocation('');
    setDatetime('');
    setImage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Add some space at the top before the title */}
      <View style={{ height: 20 }} />

      <Text style={styles.title}>Anonymous Safety Reporting</Text>

      {/* Radio buttons for category selection */}
      <Text style={styles.label}>Report category</Text>
      <View style={styles.radioGroup}>
        {categories.map((cat) => (
          <RadioButton
            key={cat}
            label={cat}
            selected={category === cat}
            onPress={() => setCategory(cat)}
          />
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue..."
        multiline
      />

      <Text style={styles.label}>Upload a picture of the safety hazard (optional)</Text>
      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      <Text style={styles.label}>Contractor or workplace's name (optional)</Text>
      <TextInput
        style={styles.input}
        value={contractor}
        onChangeText={setContractor}
        placeholder="e.g. ABC Construction"
      />

      <Text style={styles.label}>Workplace location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. 123 Pioneer Road"
      />

      <Text style={styles.label}>Date and time when images were taken</Text>
      <TextInput
        style={styles.input}
        value={datetime}
        onChangeText={setDatetime}
        placeholder="2 Sep 2025, 6 PM"
      />

      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left', // left-aligned is typical on mobile
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imageButton: {
    marginBottom: 10,
    backgroundColor: '#7b2cbf',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 5,
    marginBottom: 10,
  },
  submit: {
    marginTop: 15,
    padding: 14,
    backgroundColor: '#7b2cbf',
    borderRadius: 7,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  radioGroup: {
    marginBottom: 10,
    marginTop: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#7b2cbf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#7b2cbf',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7b2cbf',
  },
  radioLabel: {
    fontSize: 15,
    color: '#222',
  },
});

export default Reporting;
