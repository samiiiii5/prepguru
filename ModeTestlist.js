import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import database from "@react-native-firebase/database";
import { useRoute, useNavigation } from "@react-navigation/native";

const ModeTestlist = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subject, mode } = route.params; // Mode determines the flow
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const snapshot = await database()
          .ref(`/test/${subject}`)
          .once("value");

        if (snapshot.exists()) {
          setChapters(Object.keys(snapshot.val())); // Fetch chapter names
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    if (mode !== "all") {
      fetchChapters(); // Only fetch chapters for Individual and Group modes
    } else {
      handleAllMode(); // Directly handle All mode logic
    }
  }, [subject, mode]);

  const formatChapterName = (name) => {
    return name
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(' '); // Join words back into a string
  };

  const handleChapterSelect = (chapter) => {
    if (mode === "individual") {
      // Navigate directly to Test Screen with questions from the selected chapter
      navigation.navigate("ModeTestScreen", { subject, chapter });
    } else if (mode === "group") {
      // Allow multiple chapter selection
      setSelectedChapters((prev) =>
        prev.includes(chapter)
          ? prev.filter((ch) => ch !== chapter)
          : [...prev, chapter]
      );
    }
  };

  const handleGroupConfirm = async () => {
    if (selectedChapters.length === 0) {
      Alert.alert("No Chapters Selected", "Please select at least one chapter.");
      return;
    }

    try {
      // Fetch questions from all selected chapters
      let allQuestions = [];
      for (const chapter of selectedChapters) {
        const snapshot = await database()
          .ref(`/test/${subject}/${chapter}/questions`)
          .once("value");

        if (snapshot.exists()) {
          allQuestions = [...allQuestions, ...Object.values(snapshot.val())];
        }
      }

      // Randomly select 20 questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 20);

      // Navigate to Test Screen with selected questions
      navigation.navigate("ModeTestScreen", {
        subject,
        chapter: "Group Test",
        questions: selectedQuestions,
      });
    } catch (error) {
      console.error("Error fetching group questions:", error);
    }
  };

  const handleAllMode = async () => {
    try {
      let allQuestions = [];
      const snapshot = await database()
        .ref(`/test/${subject}`)
        .once("value");

      if (snapshot.exists()) {
        const chapters = Object.keys(snapshot.val()); // Get all chapters
        for (const chapter of chapters) {
          const chapterSnapshot = await database()
            .ref(`/test/${subject}/${chapter}/questions`)
            .once("value");

          if (chapterSnapshot.exists()) {
            allQuestions = [...allQuestions, ...Object.values(chapterSnapshot.val())];
          }
        }
      }

      // Randomly select 20 questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 20);

      // Navigate to Test Screen with selected questions
      navigation.navigate("ModeTestScreen", {
        subject,
        chapter: "All Chapters",
        questions: selectedQuestions,
      });
    } catch (error) {
      console.error("Error fetching all mode questions:", error);
    }
  };

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chapterButton,
        selectedChapters.includes(item) && styles.selectedChapterButton,
      ]}
      onPress={() => handleChapterSelect(item)}
    >
      <Text style={styles.chapterText}>{formatChapterName(item)}</Text>
    </TouchableOpacity>
  );

  if (mode === "all") {
    // Skip rendering for All mode as it directly processes questions
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chapters for {subject.charAt(0).toUpperCase() + subject.slice(1)}</Text>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item}
        renderItem={renderChapterItem}
        contentContainerStyle={styles.list}
      />
      {mode === "group" && (
        <TouchableOpacity style={styles.confirmButton} onPress={handleGroupConfirm}>
          <Text style={styles.confirmButtonText}>Start Group Test</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#001F54', textAlign: 'center', marginBottom: 10, marginTop: 30
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  chapterButton: {
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 8, 
    alignItems: 'flex-start', // ✅ Fixed alignItems
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    marginLeft:10,
    marginRight: 10
  },
  selectedChapterButton: {
    backgroundColor: "#FFF",
    opacity: 0.7
  },
  chapterText: {
   fontSize: 18, fontWeight: 'bold', color: '#333'
  },
  list: {
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ModeTestlist;
