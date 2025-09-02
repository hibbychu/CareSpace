import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeProvider, ThemeContext } from "./ThemeContext";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import Profile from "./screens/Profile";
import EventDetails from "./screens/EventDetails";
import ForumScreen from "./screens/ForumScreen";
import PostDetailScreen from "./screens/PostDetailScreen";

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
          headerStyle: { backgroundColor: "#7b2cbf" },
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
          headerTitle: "CareSpace",  
          headerStyle: { backgroundColor: "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </ProfileStackNav.Navigator>
  );
}

const ForumStackNav = createNativeStackNavigator();
function ForumStack() {
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext); // access theme

  return (
    <ForumStackNav.Navigator>
      <ForumStackNav.Screen
        name="ForumMain"
        component={ForumScreen}
        options={{
          headerTitle: "CareSpace",
          headerStyle: { backgroundColor:"#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          headerRight: () => (
            <MaterialIcons
              name={isDarkTheme ? "light-mode" : "dark-mode"} // or use Ionicons sun/moon
              size={26}
              color="#fff"
              style={{ marginRight: 12 }}
              onPress={toggleTheme}
            />
          ),
        }}
      />
      <ForumStackNav.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerTitle: "Post Details",
          headerStyle: { backgroundColor: "#7b2cbf" },
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
  );
}

