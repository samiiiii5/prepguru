import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import database from "@react-native-firebase/database";

const Delete = () => {
  const navigation = useNavigation();

  const handleDeleteAccount = async () => {
    try {
      const currentUser = auth().currentUser; // Get the currently authenticated user
  
      if (currentUser) {
        // Delete user's data from Realtime Database
        await database().ref(`/users/${currentUser.uid}`).remove();
  
        // Delete the user's account
        await currentUser.delete();
  
        // Google Sign-Out
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
  
        Alert.alert("Account Deleted", "Your account and data have been successfully deleted.");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
      } else {
        Alert.alert("Error", "No authenticated user found.");
      }
    } catch (error) {
      console.error("Error during account deletion:", error);
  
      // Handle Firebase-specific errors, like re-authentication requirement
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Error",
          "Your session has expired. Please sign in again and try deleting your account."
        );
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred while deleting the account.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.warningText}>
        Are you sure you want to delete your account?
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.noButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.yesButton} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  warningText: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#FF4C4C" },
  buttonContainer: { flexDirection: "row", gap: 10 },
  yesButton: { backgroundColor: "#FF4C4C", padding: 15, borderRadius: 5, width: 100 },
  noButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 5, width: 100 },
  buttonText: { textAlign: "center", color: "#FFF", fontWeight: "bold" },
});

export default Delete;
