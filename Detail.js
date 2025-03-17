import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth"; // Firebase Authentication

const Detail = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [category, setCategory] = useState(null);
  const [background, setBackground] = useState(null);
  const [board, setBoard] = useState(null);
  const [state, setState] = useState(null);
  const [gender, setGender] = useState(null);
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();

  const [openCategory, setOpenCategory] = useState(false);
  const [openBackground, setOpenBackground] = useState(false);
  const [openBoard, setOpenBoard] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openGender, setOpenGender] = useState(false);

  const handleSave = async () => {
    if (!name || mobile.length !== 10 || !age) {
      Alert.alert("Error", "Please fill all fields correctly.");
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    const userData = {
      name,
      mobile,
      age,
      category,
      background,
      board,
      state,
      gender,
      dob: dob.toISOString(),
      photo,
    };

    try {
      await database().ref(`/users/${currentUser.uid}`).set(userData);
      Alert.alert("Success", "Details saved!", [
        { text: "OK", onPress: () => navigation.navigate("Profile") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleCancel = () => {
    setName("");
    setMobile("");
    setAge("");
    setCategory(null);
    setBackground(null);
    setBoard(null);
    setState(null);
    setGender(null);
    setDob(new Date());
    setPhoto(null);
    navigation.navigate("Profile");
  };

  const pickImage = useCallback(() => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.didCancel) {
        Alert.alert("Cancelled", "Image selection cancelled.");
      } else if (response.errorCode) {
        Alert.alert("Error", `Image Picker Error: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0].uri);
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={photo ? { uri: photo } : require("./assets/profile.png")}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.heading}>Personal Details</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text.replace(/[^a-zA-Z ]/g, ""))}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={mobile}
            onChangeText={(text) =>
              setMobile(text.replace(/[^0-9]/g, "").slice(0, 10))
            }
            maxLength={10}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={(text) =>
              setAge(text.replace(/[^0-9]/g, "").slice(0, 2))
            }
          />

          <Text style={styles.label}>Category</Text>
          <DropDownPicker
            open={openCategory}
            setOpen={setOpenCategory}
            value={category}
            setValue={setCategory}
            items={[
              { label: "Fresher", value: "Fresher" },
              { label: "Dropper", value: "Dropper" },
              { label: "PG Exam", value: "PG Exam" },
              { label: "11th", value: "11th" },
              { label: "12th", value: "12th" },
            ]}
            containerStyle={{ marginBottom: 20 }}
          />

          <Text style={styles.label}>Background</Text>
          <DropDownPicker
            open={openBackground}
            setOpen={setOpenBackground}
            value={background}
            setValue={setBackground}
            items={[
              { label: "Medical", value: "Medical" },
              { label: "Engineering", value: "Engineering" },
              { label: "Humanities", value: "Humanities" },
            ]}
            containerStyle={{ marginBottom: 20 }}
          />

          <Text style={styles.label}>Board</Text>
          <DropDownPicker
            open={openBoard}
            setOpen={setOpenBoard}
            value={board}
            setValue={setBoard}
            items={[
              { label: "CBSE", value: "CBSE" },
              { label: "ICSE", value: "ICSE" },
              { label: "State Board", value: "State Board" },
              { label: "IB", value: "IB" },
              { label: "SSC", value: "SSC" },
            ]}
            containerStyle={{ marginBottom: 20 }}
          />

          <Text style={styles.label}>State</Text>
          <DropDownPicker
            open={openState}
            setOpen={setOpenState}
            value={state}
            setValue={setState}
            items={[
              { label: "Andhra Pradesh", value: "Andhra Pradesh" },
              { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
              { label: "Assam", value: "Assam" },
              { label: "West Bengal", value: "West Bengal" },
            ]}
            containerStyle={{ marginBottom: 20 }}
          />

          <Text style={styles.label}>Gender</Text>
          <DropDownPicker
            open={openGender}
            setOpen={setOpenGender}
            value={gender}
            setValue={setGender}
            items={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
            containerStyle={{ marginBottom: 20 }}
          />

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>DOB: {dob.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              maximumDate={new Date()}
              minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30 },
    heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    label: { fontSize: 16, marginTop: 10 },
    input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 5, color: "#000" },
    dateButton: { marginTop: 10, padding: 10, backgroundColor: "#ddd", borderRadius: 5 },
    dateText: { textAlign: "center" },
    profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: "center" },
    imageContainer: { alignItems: "center", marginBottom: 20 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    cancelButton: { backgroundColor: "red", padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
    saveButton: { backgroundColor: "blue", padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 },
    buttonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  });

  export default Detail;