import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import database from "@react-native-firebase/database";

const ChapterAndConfigScreen = ({ route, navigation }) => {
  const { subject } = route.params; // Subject passed from navigation
  const [chapters, setChapters] = useState([]); // List of chapters for the subject
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  const [openTime, setOpenTime] = useState(false); // Dropdown for time
  const [selectedTime, setSelectedTime] = useState("5");
  const [timeOptions] = useState([
    { label: "5 Minutes", value: "5" },
    { label: "10 Minutes", value: "10" },
    { label: "15 Minutes", value: "15" },
    { label: "20 Minutes", value: "20" },
  ]);

  const [openQuestions, setOpenQuestions] = useState(false); // Dropdown for number of questions
  const [selectedQuestions, setSelectedQuestions] = useState("10");
  const [questionOptions] = useState([
    { label: "10 Questions", value: "10" },
    { label: "20 Questions", value: "20" },
    { label: "30 Questions", value: "30" },
    { label: "40 Questions", value: "40" },
  ]);

  useEffect(() => {
    // Fetch chapters dynamically from Firebase based on the selected subject
    const fetchChapters = async () => {
      try {
        const snapshot = await database()
        .ref(`/test/${subject}`)
          .once("value");
        if (snapshot.exists()) {
          setChapters(Object.keys(snapshot.val()));
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    fetchChapters();
  }, [subject]);

  const handleStartTest = () => {
    if (selectedChapters.length === 0) {
      Alert.alert(
        "No Chapters Selected",
        "Please select at least one chapter to start the test."
      );
      return;
    }

    // Navigate to SpeedTestScreen with selected configurations
    navigation.navigate("SpeedTestScreen", {
      subject,
      selectedChapters,
      selectedTime: parseInt(selectedTime),
      selectedQuestions: parseInt(selectedQuestions),
    });
  };

  return (
    <View style={styles.container}>
      {/* Select Chapters Button */}
      <TouchableOpacity
        style={styles.selectChapterButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedChapters.length > 0
            ? `${selectedChapters.length} Chapters Selected`
            : "Select Chapters"}
        </Text>
      </TouchableOpacity>

      {/* Modal for Chapter Selection */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Chapters</Text>
          <FlatList
            data={chapters}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chapterItem,
                  selectedChapters.includes(item) && styles.selectedChapter,
                ]}
                onPress={() => {
                  if (selectedChapters.includes(item)) {
                    setSelectedChapters((prev) =>
                      prev.filter((chapter) => chapter !== item)
                    );
                  } else {
                    setSelectedChapters((prev) => [...prev, item]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.chapterText,
                    selectedChapters.includes(item) && styles.selectedChapterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalSelectButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.modalSelectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Dropdown for Time Selection */}
      <Text style={styles.label}>Time for Test (minutes):</Text>
      <DropDownPicker
        open={openTime}
        value={selectedTime}
        items={timeOptions}
        setOpen={setOpenTime}
        setValue={setSelectedTime}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      {/* Dropdown for Number of Questions Selection */}
      <Text style={styles.label}>Number of Questions:</Text>
      <DropDownPicker
        open={openQuestions}
        value={selectedQuestions}
        items={questionOptions}
        setOpen={setOpenQuestions}
        setValue={setSelectedQuestions}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      {/* Start Test Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
        <Text style={styles.startButtonText}>Start Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  selectChapterButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: "bold",
  },
  dropdown: {
    marginBottom: 20,
    borderRadius: 8,
    borderColor: "#ccc",
    height: 50,
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: "#ccc",
  },
  startButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chapterItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedChapter: {
    backgroundColor: "#007BFF",
  },
  selectedChapterText: {
    color: "#FFF",
  },
  modalSelectButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  modalSelectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChapterAndConfigScreen;
