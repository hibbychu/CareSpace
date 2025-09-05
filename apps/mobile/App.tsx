import React, { useEffect, useState, useContext } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeProvider, ThemeContext } from "./ThemeContext";
import { Provider as PaperProvider, Portal, Modal, Button } from "react-native-paper";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import Profile from "./screens/Profile";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import EventDetails from "./screens/EventDetails";
import ForumScreen from "./screens/ForumScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import CreatePostScreen from "./screens/CreatePostScreen";
import EditProfile from './screens/EditProfile';
import NewsScreen from "./screens/NewsScreen";



function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <MaterialIcons
      name={theme ? "light-mode" : "dark-mode"}
      size={26}
      color="#fff"
      style={{ marginRight: 12 }}
      onPress={toggleTheme}
    />
  );
}

// Bottom Tab
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStackNav = createNativeStackNavigator();
function HomeStack() {
  const { theme } = useContext(ThemeContext);
  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerRight: () => <ThemeToggleButton />,
      }}>
      <HomeStackNav.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerTitle: () => (
                <Image
                  source={require("./assets/logo-white.png")}
                  style={{height: 45, resizeMode: "contain", marginLeft: 25}}
                />
              ),          
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <HomeStackNav.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "All Events",
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <HomeStackNav.Screen
        name="EventDetails"
        component={EventDetails}
        options={({ route }) => ({
          title: route.params?.event?.eventName || "Event Details",
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        })}
      />
      <HomeStackNav.Screen
        name="News"
        component={NewsScreen}
        options={{
          title: "All News",
          headerStyle: { backgroundColor: theme.primary },
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
  const { theme } = useContext(ThemeContext);
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
          contentContainerStyle={[
            styles.bottomSheet,
            { backgroundColor: theme.background },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>Create Post</Text>
          <Button
            mode="contained"
            style={{ marginBottom: 10, paddingVertical: 6 }}
            onPress={() => handleSelect("public")}>
            Public Post
          </Button>
          <Button
            mode="contained-tonal"
            style={{ backgroundColor: "#d32f2f", paddingVertical: 6 }}
            textColor="white"      // set text color here
            onPress={() => handleSelect("anonymous")}
          >
            Anonymous Safety Report
          </Button>
          <Button onPress={closeSheet} style={{ marginTop: 10 }} textColor={theme.text2}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const ProfileStackNav = createNativeStackNavigator();
function ProfileStack() {
  const { theme } = useContext(ThemeContext);
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerRight: () => <ThemeToggleButton />,
      }}>
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={Profile}
        options={{
          headerTitle: () => (
            <Image
              source={require('./assets/logo-white.png')}
              style={{height: 45, resizeMode: "contain", marginLeft: 25}}
            />
          ),
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <ProfileStackNav.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: "Login",
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <ProfileStackNav.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: "Sign Up",
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <ProfileStackNav.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerTitle: "Sign Up",
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </ProfileStackNav.Navigator>
  );
}

// Create Post Stack
const CreatePostStackNav = createNativeStackNavigator();
function CreatePostStack() {
  return (
    <CreatePostStackNav.Navigator
      screenOptions={{
        headerRight: () => <ThemeToggleButton />,
      }}>
      <CreatePostStackNav.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={({ route }) => ({
          headerTitle:
            route.params?.type === "anonymous" ? "Anonymous Safety Report" : "Create a new Post",
          headerStyle: { backgroundColor: route.params?.type === "anonymous" ? "#d32f2f" : "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        })}
      />
    </CreatePostStackNav.Navigator>
  );
}

// Forum Stack
const ForumStackNav = createNativeStackNavigator();
function ForumStack() {
  return (
    <ForumStackNav.Navigator
      screenOptions={{
        headerRight: () => <ThemeToggleButton />,
      }}>
      <ForumStackNav.Screen
        name="ForumMain"
        component={ForumScreen}
        options={{
          headerTitle: "Forums",
          headerStyle: { backgroundColor: "#7b2cbf" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <ForumStackNav.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params?.post?.postType === "report" ? "Report Details" : "Post Details",
          headerStyle: { backgroundColor: route.params?.post?.postType === "report" ? "#d32f2f" : "#7b2cbf", },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        })}
      />
      <ForumStackNav.Screen
        name="Profile"
        component={Profile}
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

// App
export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarStyle: { backgroundColor: "#7b2cbf" },
              headerShown: false,
              tabBarActiveTintColor: "white",
              tabBarInactiveTintColor: "#CCCCCC",
              tabBarLabelStyle: { fontSize: 12 },
              tabBarIcon: ({ color, size }) => {
                let iconName: string;
                if (route.name === "Home") iconName = "home";
                else if (route.name === "Forum") iconName = "forum";
                else if (route.name === "Profile") iconName = "person";
                else iconName = "circle";
                return <MaterialIcons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen
              name="CreatePost"
              component={CreatePostStack}
              options={({ navigation }) => ({
                tabBarButton: () => <CreatePostButton navigation={navigation} />,
              })}
              listeners={{ tabPress: (e) => e.preventDefault() }}
            />
            <Tab.Screen name="Forum" component={ForumStack} />
            <Tab.Screen
              name="Profile"
              component={ProfileStack}
              options={{
                tabBarLabel: user ? user.displayName || user.email : "Profile",
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 70,
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