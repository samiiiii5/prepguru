import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

const GamesScreen = () => {
  const navigation = useNavigation();

  // Create reference for the image scaling animation
  const scaleAnim = useRef(new Animated.Value(1)).current; // Scaling animation for the image

  // Start the scaling animation when the screen loads
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1, // Pop-up effect
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Back to normal size
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Blue Line */}
      <View style={styles.topLine} />
      <View style={styles.smallLine} />

      {/* Header */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginTop: 60, marginLeft: 10, fontSize: 25 }]}>Games</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Buttons */}
        {[
          { label: "Easy Quiz", subLabel: "Beginner Mode", imgSource: require("./assets/e.png"), route: "Easy" },
          { label: "Moderate Quiz", subLabel: "Intermediate Mode", imgSource: require("./assets/o.png"), route: "Mode" },
          { label: "Hard Quiz", subLabel: "Advanced Mode", imgSource: require("./assets/m.png"), route: "Hard" },
          { label: "Speed Test", subLabel: "Challenge Mode", imgSource: require("./assets/s.png"), route: "Speed" },
        ].map((game, index) => (
          <Animated.View key={index} style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(game.route, { subject: game.route })}
            >
              <Animated.Image
                source={game.imgSource}
                style={[styles.image, { transform: [{ scale: scaleAnim }] }]} // Apply scaling animation to the image
              />
              <View>
                <Text style={styles.label}>{game.label}</Text>
                <Text style={styles.subLabel}>{game.subLabel}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topLine: {
    position: "absolute",
    left: 0,
    top: 20,
    width: "80%",
    height: 10,
    backgroundColor: "#001F54",
  },
  smallLine: {
    position: "absolute",
    left: 0,
    top: 40,
    width: "60%",
    height: 10,
    backgroundColor: "#001F54",
  },
  textContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 15,
 
    marginBottom: 10,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#001F54",
  },
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexGrow: 1,
    paddingBottom: 200,
  },
  buttonContainer: {
    marginVertical: 10,
    alignItems: "center", // Center each button container
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    width: 250, // Make each button square-shaped
    height: 150, // Make each button square-shaped
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 15,
    right:10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    
  },
  subLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
});

export default GamesScreen;
