import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import database from "@react-native-firebase/database"; // Firebase Database Import
import auth from "@react-native-firebase/auth"; // Firebase Authentication Import
import { useNavigation } from "@react-navigation/native";

const Save = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth().currentUser; // Get the currently logged-in user
        if (currentUser) {
          const snapshot = await database().ref(`/users/${currentUser.uid}`).once("value"); // Fetch specific user's data
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No details found for the current user.");
          }
        } else {
          console.log("No user logged in.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Details</Text>

      {userData ? (
        <View>
          <Text style={styles.label}>Name: {userData.name}</Text>
          <Text style={styles.label}>Mobile: {userData.mobile}</Text>
          <Text style={styles.label}>Age: {userData.age}</Text>
          <Text style={styles.label}>Category: {userData.category}</Text>
          <Text style={styles.label}>Background: {userData.background}</Text>
          <Text style={styles.label}>Board: {userData.board}</Text>
          <Text style={styles.label}>State: {userData.state}</Text>
          <Text style={styles.label}>Gender: {userData.gender}</Text>
          <Text style={styles.label}>Dob: {new Date(userData.dob).toDateString()}</Text>
        </View>
      ) : (
        <Text style={styles.label}>No details found.</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 18, marginTop: 10 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16 },
});

export default Save;
