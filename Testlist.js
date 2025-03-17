import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, TextInput, BackHandler, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';

const TestList = ({ route }) => {
  const { subject,  testScreenType = "EasyTestScreen" } = route.params;
  const navigation = useNavigation();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateYAnim = useState(new Animated.Value(30))[0];
  const screenScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const snapshot = await database().ref(`test/${subject}`).once('value');
        if (snapshot.exists()) {
          setChapters(Object.keys(snapshot.val() || {}));
        } else {
          console.warn("No chapters found in Firebase!");
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [subject]);

  const handleChapterSelect = (chapter) => {
    if (testScreenType === "HardTestScreen") {
      // Navigate to HardTestScreen if testScreenType is 'HardTestScreen'
      navigation.navigate("HardType", { subject, chapter });
    } else if (testScreenType === "EasyTestScreen") {
      // Navigate to EasyTestScreen otherwise
      navigation.navigate("EasyTestScreen", { subject, chapter });
    }
  }

  // Custom Back Animation
  useEffect(() => {
    const backAction = () => {
      Animated.timing(screenScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        navigation.goBack();
      });

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // 🔍 Filtered Chapters based on search
  const filteredChapters = chapters.filter(chapter =>
    chapter.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatChapterName = (name) => {
    return name
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(' '); // Join words back into a string
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: screenScale }] }]}>
      
      {/* 🏷️ Title */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {subject.charAt(0).toUpperCase() + subject.slice(1)} Test
        </Text>
      </View>

      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#555"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 📄 List of Chapters */}
      {loading ? (
        <ActivityIndicator size="large" color="#001F54" />
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
          <FlatList
            data={filteredChapters}
            keyExtractor={(item, index) => item || index.toString()} // ✅ Fixed keyExtractor
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => handleChapterSelect(item)}>
                <Text style={styles.chapterText}>{formatChapterName(item)}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#001F54', textAlign: 'left', marginBottom: 10 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 3,
    marginBottom: 15,
  },
  searchIcon: { width: 40, height: 40, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  card: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 8, 
    alignItems: 'flex-start', // ✅ Fixed alignItems
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  chapterText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});

export default TestList;
