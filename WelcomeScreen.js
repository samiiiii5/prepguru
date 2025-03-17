import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, Alert, StyleSheet, Dimensions, Image } from "react-native";
import Swiper from "react-native-swiper";
import { configureGoogleSignIn, handleGoogleSignIn } from "./logic/SignInlogic"; // Import functions from SignInlogic.js
import { useNavigation } from "@react-navigation/native";

const images = [
  require("./images/img0.jpg"), // Ensure these paths are correct
  require("./images/img1.jpg"),
  require("./images/img2.jpg"),
  require("./images/img3.jpg"),
];

const WelcomeScreen = () => {
  const navigation = useNavigation();

  // Configure Google Sign-In on component mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const user = await handleGoogleSignIn(); // Trigger Google Sign-In
      if (user) {
        Alert.alert("Welcome", `Hello, ${user.displayName || "User"}!`, [
          {
            text: "OK",
            onPress: () => navigation.replace("Home"), // Navigate to HomeScreen
          },
        ]);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      Alert.alert("Error", "Google Sign-In failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        style={{ height: Dimensions.get("window").height * 0.82 }}
        showsButtons={false}
        activeDotColor="#001F54"
        dotColor="#998FA2"
      >
        {images.map((image, index) => (
          <View style={styles.slide} key={index}>
            <Image source={image} style={styles.img} />
          </View>
        ))}
      </Swiper>
      <View style={styles.signInContainer}>
        <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
          <Text style={styles.buttonText}>Sign In With Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -37,
  },
  img: {
    alignSelf: "center",
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 80,
    height: Dimensions.get("window").height * 0.8,
    width: Dimensions.get("window").width * 0.96,
    borderColor: "black",
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#001F54",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "center",
    width: 250,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
  signInContainer: {
    marginTop: 10,
  },
});

export default WelcomeScreen;
