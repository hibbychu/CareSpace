// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, ScrollView } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import * as Linking from 'expo-linking';
// import { db } from './firebaseConfig';
// import { collection, getDocs } from 'firebase/firestore';

// export default function App() {
//   const [reports, setReports] = useState<string[]>([]);

//   // Listen to deep links
//   useEffect(() => {
//     const subscription = Linking.addEventListener('url', (event) => {
//       console.log('Deep link received:', event.url);
//     });

//     return () => subscription.remove();
//   }, []);

//   // Fetch Firestore reports
//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'reports'));
//         const reportIds = snapshot.docs.map(doc => doc.id);
//         setReports(reportIds);
//       } catch (error) {
//         console.error('🔥 Firestore error:', error);
//       }
//     };

//     fetchReports();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🚀 Firebase Connected!</Text>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {reports.length > 0 ? (
//           reports.map((r) => <Text key={r} style={styles.report}>Report: {r}</Text>)
//         ) : (
//           <Text style={styles.report}>No reports found.</Text>
//         )}
//       </ScrollView>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },
//   scrollContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   report: {
//     fontSize: 16,
//     marginVertical: 5,
//   },
// });

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import Profile from './screens/Profile';
import Reporting from './screens/Reporting';
import EditProfile from './screens/EditProfile';

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function EditProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Reporting" component={Reporting} />
        <Tab.Screen name="Profile" component={EditProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
