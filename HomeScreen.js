import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Blue Line on the Right */}
      <View style={styles.topLine} />
      {/* Small Blue Line below on the Right */}
      <View style={styles.smallLine} />
      
      {/* Header Section */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginTop: 60, marginLeft: 10, fontSize: 25 }]}>
          Home
        </Text>
      </View>

      {/* Scrollable Subject Buttons */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Physics */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Py', { subject: 'Physics' })}
        >
          <Image source={require('./assets/physics.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Physics</Text>
            <Text style={styles.subLabel}>Get free Physics study material</Text>
          </View>
        </TouchableOpacity>

        {/* Chemistry */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Chem', { subject: 'Chemistry' })}
        >
          <Image source={require('./assets/chemistry.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Chemistry</Text>
            <Text style={styles.subLabel}>Get free Chemistry study material</Text>
          </View>
        </TouchableOpacity>

        {/* Biology */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Bio', { subject: 'Biology' })}
        >
          <Image source={require('./assets/biology.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Biology</Text>
            <Text style={styles.subLabel}>Get free Biology study material</Text>
          </View>
        </TouchableOpacity>

        {/* PYP */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PYP', { p: 'pyp' })}
        >
          <Image source={require('./assets/PYP.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Previous Year Papers</Text>
            <Text style={styles.subLabel}>Get NEET PYP</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('MM', { subject: 'MM' })}
        >
          <Image source={require('./assets/MM.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Mind Map</Text>
            <Text style={styles.subLabel}>Enhance Memory with Mind Map</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('CC', { subject: 'CC' })}
        >
          <Image source={require('./assets/CC.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Crash Course</Text>
            <Text style={styles.subLabel}>Daily Practice with Crash Course</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Formula', { subject: 'Formula' })}
        >
          <Image source={require('./assets/Formula.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Formula</Text>
            <Text style={styles.subLabel}>Get Shortcut to Success</Text>
          </View>
        </TouchableOpacity>
<TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('SubjectsScreen', { subject: 'SubjectsScreen' })}
        >
          <Image source={require('./assets/fc.png')} style={styles.image} />
          <View>
            <Text style={styles.label}>Flash Card</Text>
            <Text style={styles.subLabel}>Learn and Grow</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // White background
  },
  topLine: {
    position: "absolute",
    left: 0,
    top: 20,
    width: "90%",
    height: 10,
    backgroundColor: "#001F54", // Blue color
  },
  smallLine: {
    position: "absolute",
    left: 0,
    top: 40,
    width: "80%",
    height: 10,
    backgroundColor: "#001F54", // Blue color
  },
  textContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 100,
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  subLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scrollContainer: {
    paddingVertical: 10, // Ensures spacing around content
    paddingHorizontal: 10,
    flexGrow: 1, // Ensures scrollability
    paddingBottom: 200, // Extra space at the bottom
  },
});

export default HomeScreen;
