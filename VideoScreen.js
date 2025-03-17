import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { database } from './firebaseConfig'; // Ensure correct Firebase configuration

const VideoScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch categories dynamically from the database
  useEffect(() => {
    const categoriesRef = database.ref('categories'); // Ensure this matches your database structure

    categoriesRef.on('value', (snapshot) => {
      const categoryData = snapshot.val();
      if (categoryData) {
        const categoryList = Object.keys(categoryData); // Assuming `categories` is an object with keys as category names
        setCategories(categoryList);
      }
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => categoriesRef.off('value');
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Blue Line on the Right */}
      <View style={styles.topLine} />
      {/* Small Blue Line below on the Right */}
      <View style={styles.smallLine} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
      <Text style={[styles.text, { fontWeight: 'bold', marginTop: 15, marginLeft: 5, fontSize: 25 }]}>Videos</Text>
      </View>

      {/* Middle Section */}
      <View style={styles.middleContainer}>
        <Text style={styles.text}>Select a Category</Text>

        {/* Dynamically render category buttons */}
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          categories.length > 0 ? (
            categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.button}
                onPress={() => navigation.navigate('CategoryScreen', { category })}
              >
                <Text style={styles.buttonText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No categories available</Text>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topLine: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: '70%',
    height: 10,
    backgroundColor: '#001F54', // Blue color
  },
  smallLine: {
    position: 'absolute',
    left: 0,
    top: 40,
    width: '50%',
    height: 10,
    backgroundColor: '#001F54', // Blue color
  },
  headerContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    marginTop: 50, // Position "Videos" below the bottom line
  },
  textContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  textv: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#00000',
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
    marginTop: -100, // Optional: Adjust to ensure proper alignment
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#000000',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#001F54',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
  noDataText: {
    color: '#0d0b0b',
    fontSize: 16,
    marginTop: 20,
  },
});

export default VideoScreen;