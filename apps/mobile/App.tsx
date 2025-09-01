import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function App() {
  const [reports, setReports] = useState<string[]>([]);

  // Listen to deep links
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Deep link received:', event.url);
    });

    return () => subscription.remove();
  }, []);

  // Fetch Firestore reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reports'));
        const reportIds = snapshot.docs.map(doc => doc.id);
        setReports(reportIds);
      } catch (error) {
        console.error('🔥 Firestore error:', error);
      }
    };

    fetchReports();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Firebase Connected!</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {reports.length > 0 ? (
          reports.map((r) => <Text key={r} style={styles.report}>Report: {r}</Text>)
        ) : (
          <Text style={styles.report}>No reports found.</Text>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  report: {
    fontSize: 16,
    marginVertical: 5,
  },
});
