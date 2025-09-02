import React, { useState } from "react";
import { Menu, Provider as PaperProvider } from "react-native-paper";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeProvider, ThemeContext } from "./ThemeContext";
import { Portal, Modal, Button } from "react-native-paper";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import Profile from "./screens/Profile";
import EventDetails from "./screens/EventDetails";
import ForumScreen from "./screens/ForumScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import CreatePostScreen from "./screens/CreatePostScreen";

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
          headerStyle: { backgroundColor: "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <HomeStackNav.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          title: "Event Name",
          headerStyle: { backgroundColor: "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </HomeStackNav.Navigator>

  );
}

function CreatePostButton() {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation<any>();

  const openSheet = () => setVisible(true);
  const closeSheet = () => setVisible(false);

  const handleSelect = (type: "public" | "anonymous") => {
    closeSheet();
    navigation.navigate("CreatePost" as never, {
      screen: "CreatePost",
      params: { type },
    } as never);
  };

  return (
    <View>
      {/* Button */}
      <TouchableOpacity
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: 50,
          borderRadius: 30,
        }}
        onPress={openSheet}
      >
        <MaterialIcons name="add" size={28} color="white" />
        <Text style={{ color: "white", fontSize: 12 }}>Create Post</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeSheet}
          contentContainerStyle={styles.bottomSheet}
        >
          <Text style={styles.title}>Create Post</Text>
          <Button
            mode="contained"
            style={{ marginBottom: 10, paddingVertical:6 }}
            onPress={() => handleSelect("public")}>
            Public Post
          </Button>
          <Button
            mode="contained-tonal"
            style={{ backgroundColor: "#d32f2f", paddingVertical:6 }}
            textColor="white"      // set text color here
            onPress={() => handleSelect("anonymous")}
          >
            Anonymous Safety Report
          </Button>
          <Button onPress={closeSheet} style={{ marginTop: 10 }}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
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
          headerStyle: { backgroundColor: "#4f46e5" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </ProfileStackNav.Navigator>
  );
}

const CreatePostStackNav = createNativeStackNavigator();
function CreatePostStack() {
  return (
    <CreatePostStackNav.Navigator>
      <CreatePostStackNav.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={({ route }) => ({
          headerTitle:
            route.params?.type === "anonymous"
              ? "Anonymous Safety Report"
              : "Create a new Post",
          headerStyle: { backgroundColor: route.params?.type === "anonymous" ? "#d32f2f" : "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        })}
      />
    </CreatePostStackNav.Navigator>
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
          headerTitle: "Forums",
          headerStyle: { backgroundColor: "#7b2cbf" },
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
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarStyle: {
                backgroundColor: "#7b2cbf",
              },
              headerShown: false,
              tabBarActiveTintColor: "white",
              tabBarInactiveTintColor: "#CCCCCC",
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
            <Tab.Screen
              name="CreatePost"
              component={CreatePostStack}
              options={{
                tabBarButton: () => <CreatePostButton />,
              }}
              listeners={{
                tabPress: (e) => e.preventDefault(), // prevent default so button opens modal instead
              }}
            />
            <Tab.Screen name="Forum" component={ForumStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 70, // lifts it above the bottom tab bar
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
});

