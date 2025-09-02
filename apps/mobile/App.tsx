import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import Profile from "./screens/Profile";
import HomeScreen from "./screens/HomeScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "CareSpace",
            headerStyle: { backgroundColor: "#4f46e5" },
            headerTintColor: "#fff", 
            headerTitleAlign: "center",
          }}
        />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
