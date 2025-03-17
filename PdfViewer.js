import React, { useState } from "react";
import { View, Alert, Modal, TouchableOpacity, StyleSheet, Text, TextInput } from "react-native";
import { WebView } from "react-native-webview";
import database from "@react-native-firebase/database";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

const PdfViewer = ({ route }) => {
  const { pdfUrl, subject, name } = route.params; // No need to pass userId
  const userId = auth().currentUser?.uid; // Fetch logged-in user ID
  const [selectedText, setSelectedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // Convert Google Drive download URL to preview URL
  const extractFileId = (url) => {
    const match = url.match(/id=([^&]+)/);
    return match ? match[1] : null;
  };
  const fileId = extractFileId(pdfUrl);
  const viewerUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : pdfUrl;

  // Function to format chapter name (standardizing case)
  const formatChapterName = (chapter) => chapter.toLowerCase().replace(/\s+/g, "_");

  // Function to handle marking as read (User-Specific)
  const markAsRead = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in. Please sign in again.");
      return;
    }

    try {
      const ref = database().ref(`pdfReads/${userId}/${subject}/${formatChapterName(name)}`);
      const snapshot = await ref.once("value");
      const currentCount = snapshot.val() || 0;
      await ref.set(currentCount + 1); // Increment read count for this user

      Alert.alert(
        "Finished Reading?",
        "Would you like to take a test now?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: () =>
              navigation.navigate("EasyTestScreen", {
                subject,
                chapter: formatChapterName(name),
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating read count:", error);
    }
  };

  // Function to save a flashcard to Firebase (User-Specific)
  const saveFlashcard = async () => {
    if (!editedText.trim()) {
      Alert.alert("Error", "Flashcard text cannot be empty!");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not logged in. Please sign in again.");
      return;
    }

    try {
      const flashcardRef = database()
        .ref(`flashcards/${userId}/${subject}/${formatChapterName(name)}`)
        .push();
      await flashcardRef.set({
        name: name,
        text: editedText.trim(),
      });

      Alert.alert("Success", "Flashcard saved successfully!");
      setModalVisible(false);
      setEditedText("");
    } catch (error) {
      console.error("Error saving flashcard:", error);
      Alert.alert("Error", "Could not save flashcard.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* WebView to Render the PDF */}
      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1 }}
        injectedJavaScript={` 
          document.addEventListener("selectionchange", function() {
            const selectedText = window.getSelection().toString();
            if (selectedText.length > 0) {
              window.ReactNativeWebView.postMessage(selectedText);
            }
          });
        `}
        onMessage={(event) => {
          setSelectedText(event.nativeEvent.data);
          setEditedText(event.nativeEvent.data);
          setModalVisible(true);
        }}
      />

      {/* Mark as Read Button */}
      <TouchableOpacity onPress={markAsRead} style={styles.readButton}>
        <Text style={styles.buttonText}>Mark as Read</Text>
      </TouchableOpacity>

      {/* Flashcard Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Edit Flashcard Text:</Text>
            <TextInput
              style={styles.textInput}
              value={editedText}
              onChangeText={setEditedText}
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={saveFlashcard} style={styles.button}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.buttonCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles for Modal & Buttons
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  textInput: {
    width: "100%",
    minHeight: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonCancel: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  readButton: {
    backgroundColor: "#28a745",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    left: "25%",
    width: "50%",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PdfViewer;
