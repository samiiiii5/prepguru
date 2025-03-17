import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated 
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const fadeAnim = new Animated.Value(0); 

  // Animate when navigating
  const handlePress = (screen) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200, 
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate(screen);
      fadeAnim.setValue(0); 
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Blue Lines */}
      <View style={styles.topLine} />
      <View style={styles.smallLine} />

      {/* Profile Header */}
      <Text style={styles.heading}>Profile</Text>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image 
          source={profileImage ? { uri: profileImage } : require("./assets/profile.png")} 
          style={styles.profileImage} 
        />
        <Text style={styles.profileText}>
          "Your profile tells your story, but your dedication writes your future. 
          Stay committed, stay strong, and conquer NEET!"
        </Text>
      </View>

      {/* Scrollable Section for Options */}
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.option} onPress={() => handlePress("Detail")}>
          <Text style={styles.optionText}>Personal Details</Text>
          <Text style={styles.subText}>Edit your profile information.</Text>
        </TouchableOpacity> 
        <TouchableOpacity style={styles.option} onPress={() => handlePress("Save")}>
          <Text style={styles.optionText}>Saved Details</Text>
          <Text style={styles.subText}>Veiw your details.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handlePress("Progress")}>
          <Text style={styles.optionText}>Progress</Text>
          <Text style={styles.subText}>Track your NEET preparation and performance.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handlePress("Recommendation")}>
          <Text style={styles.optionText}>Recommendation</Text>
          <Text style={styles.subText}>Get study tips and subject-wise strategies.</Text>
        </TouchableOpacity>

       
    
        <TouchableOpacity style={styles.option} onPress={() => handlePress("Delete")}>
          <Text style={styles.optionText}>Delete Account</Text>
          <Text style={styles.subText}>Dont forget to vist again.</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  topLine: { position: "absolute", left: 0, top: 20, width: "60%", height: 10, backgroundColor: "#001F54" },
  smallLine: { position: "absolute", left: 0, top: 40, width: "40%", height: 10, backgroundColor: "#001F54" },
  heading: { fontWeight: "bold", fontSize: 25, marginTop: 60, marginBottom: 20, textAlign: "center", color: "#1E3A8A" },
  profileSection: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 2, borderColor: "#1E3A8A" },
  profileText: { 
    fontSize: 14, 
    fontFamily: "serif", 
    textAlign: "center", 
    color: "#333", 
    letterSpacing: 1, 
    paddingHorizontal: 20, 
    fontStyle: "italic",
  },
  optionsContainer: { marginTop: 10 },
  option: { 
    backgroundColor: "#FFF", 
    padding: 20, 
    marginVertical: 8, 
    borderRadius: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  optionText: { fontSize: 16, fontWeight: "bold", color: "#1E3A8A" },
  subText: { fontSize: 12, color: "#555", marginTop: 5, textAlign: "center" },
});

export default ProfileScreen;
