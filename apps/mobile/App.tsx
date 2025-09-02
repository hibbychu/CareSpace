import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import Profile from "./screens/Profile";
// import ForumScreen from "./screens/ForumScreen"; // placeholder

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStackNav = createNativeStackNavigator();
function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerTitle: "CareSpace",        // Home header
          headerStyle: { backgroundColor: "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <HomeStackNav.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "All Events",             // Events header
          headerStyle: { backgroundColor: "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
<<<<<<< Updated upstream
=======
      <HomeStackNav.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          title: "Event Name",             
          headerStyle: { backgroundColor: "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
>>>>>>> Stashed changes
    </HomeStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator>
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={Profile}
        options={{
<<<<<<< Updated upstream
          headerTitle: "CareSpace",   // header for this tab
          headerStyle: { backgroundColor: "#4f46e5" },
=======
          headerTitle: "CareSpace",  
          headerStyle: { backgroundColor: "#7b2cbf" },
>>>>>>> Stashed changes
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </ProfileStackNav.Navigator>
  );
}

const ForumStackNav = createNativeStackNavigator();

function ForumStack() {
  return (
    <ForumStackNav.Navigator>
      <ForumStackNav.Screen
        name="ForumMain"
        component={Profile}          // replace with ForumScreen if exists
        options={{
          headerTitle: "CareSpace",
          headerStyle: { backgroundColor: "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </ForumStackNav.Navigator>
  );
}

// Tab Navigator
export default function App() {
  return (
<<<<<<< Updated upstream
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // hide tab navigator headers
          tabBarActiveTintColor: "#4f46e5",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ color, size }) => {
            let iconName: string;
            if (route.name === "Home") iconName = "home";
            else if (route.name === "Forum") iconName = "forum";
            else if (route.name === "Profile") iconName = "person";
            else iconName = "circle"; // default
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Forum" component={ForumStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
=======
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false, // hide tab navigator headers
            tabBarActiveTintColor: "#7b2cbf",
            tabBarInactiveTintColor: "#999",
            tabBarLabelStyle: { fontSize: 12 },
            tabBarIcon: ({ color, size }) => {
              let iconName: string;
              if (route.name === "Home") iconName = "home";
              else if (route.name === "Forum") iconName = "forum";
              else if (route.name === "Profile") iconName = "person";
              else iconName = "circle"; // default
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Forum" component={ForumStack} />
          <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
>>>>>>> Stashed changes
  );
}

