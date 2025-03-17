import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

const ChapterScreen = ({ route }) => {
  const { subject } = route.params;
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid; // Get logged-in user ID

  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch chapters specific to the logged-in user
  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "User not logged in. Please sign in again.");
      return;
    }

    const fetchChapters = async () => {
      const snapshot = await database().ref(`flashcards/${userId}/${subject}`).once("value");
      if (snapshot.exists()) {
        const chapterList = Object.keys(snapshot.val() || {});
        setChapters(chapterList);
        setFilteredChapters(chapterList);
      }
      setLoading(false);
    };

    fetchChapters();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [subject, userId]);

  // Filter search results
  useEffect(() => {
    const filtered = chapters.filter((chapter) =>
      chapter.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChapters(filtered);
  }, [searchQuery, chapters]);

  // Add a new chapter under the current user's flashcards
  const handleAddChapter = async () => {
    if (!newChapter.trim()) {
      Alert.alert("Error", "Chapter name cannot be empty");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (chapters.includes(newChapter)) {
      Alert.alert("Error", "Chapter already exists");
      return;
    }

    try {
      await database().ref(`flashcards/${userId}/${subject}/${newChapter}`).set(true);
      setChapters([...chapters, newChapter]);
      setFilteredChapters([...filteredChapters, newChapter]);
      setNewChapter("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding chapter:", error);
      Alert.alert("Error", "Could not add chapter.");
    }
  };

  // Delete a chapter only for the logged-in user
  const handleDeleteChapter = async (chapter) => {
    Alert.alert(
      "Delete Chapter",
      `Are you sure you want to delete "${chapter}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await database().ref(`flashcards/${userId}/${subject}/${chapter}`).remove();
              const updatedChapters = chapters.filter((item) => item !== chapter);
              setChapters(updatedChapters);
              setFilteredChapters(updatedChapters);
            } catch (error) {
              console.error("Error deleting chapter:", error);
              Alert.alert("Error", "Could not delete chapter.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{subject.charAt(0).toUpperCase() + subject.slice(1)} Flashcards</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Image source={require("./assets/search.png")} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#001F54"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {loading && <ActivityIndicator size="large" color="#001F54" />}

      {/* List of Chapters */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={filteredChapters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Flashcards", { subject, chapter: item })}
              onLongPress={() => handleDeleteChapter(item)}
            >
              <Text style={styles.chapterText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Add Chapter Button */}
      <View style={styles.addChapterButtonContainer}>
        <TouchableOpacity style={styles.addChapterButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addChapterButtonText}>Add Chapter</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Adding Chapter */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.addChapterInput}
              placeholder="New Chapter"
              value={newChapter}
              onChangeText={setNewChapter}
            />
            <Pressable style={styles.modalButton} onPress={handleAddChapter}>
              <Text style={styles.modalButtonText}>Add</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  topLine: { position: "absolute", left: 0, top: 20, width: "95%", height: 10, backgroundColor: "#001F54" },
  smallLine: { position: "absolute", left: 0, top: 40, width: "75%", height: 10, backgroundColor: "#001F54" },
  textContainer: { padding: 20 },
  text: { fontWeight: "bold", fontSize: 25, marginTop: 30, marginBottom: -20 },
  searchBarContainer: { flexDirection: "row", alignItems: "center", borderColor: "#333", borderWidth: 1.5, borderRadius: 5, margin: 20, paddingLeft: 10 },
  searchIcon: { width: 25, height: 25, marginRight: 10 },
  searchBar: { fontSize: 16, flex: 1, color: "#001F54" },
  card: { padding: 15, backgroundColor: "#fff", margin: 10, borderRadius: 10, elevation: 3 },
  chapterText: { fontSize: 18, fontWeight: "bold" },
  addChapterButtonContainer: { padding: 20, backgroundColor: "#f8f9fa" },
  addChapterButton: { backgroundColor: "#001F54", padding: 15, borderRadius: 10, alignItems: "center" },
  addChapterButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalButton: { backgroundColor: "#001F54", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  modalButtonText: { color: "#FFF", fontWeight: "bold" },
});

export default ChapterScreen;
