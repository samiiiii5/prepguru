import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions, BackHandler } from "react-native";

const ResultScreen = ({ route, navigation }) => {
  const {
    selectedTime,
    selectedAnswers = {},
    questions = [],
    chapter = "Unknown Chapter",
    timeTaken = "00:00",
    testScreenType = "EasyTestScreen", // Default for flexibility
    subject = "Unknown Subject",
    mode = "normal",
  } = route.params || {};

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Handle back button press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Fade-in animation for smooth entry
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBackPress = () => {
    navigation.navigate("Home");
    return true;
  };

  // Identify skipped, wrong, and correct answers
  const totalQuestions = questions.length;
  let correct = 0,
    wrongAnswers = 0,
    skippedAnswers = 0;

  questions.forEach((question, index) => {
    const userAnswerObj = selectedAnswers[index];
    const userAnswer = userAnswerObj ? userAnswerObj.userAnswer : null;

    if (!userAnswer) {
      skippedAnswers++; // Mark as skipped
    } else if (
      String(userAnswer).toLowerCase() === String(question.correct || "").toLowerCase()
    ) {
      correct++;
    } else {
      wrongAnswers++;
    }
  });

  const data = [
    { name: "Correct", count: correct, color: "green", legendFontColor: "#333", legendFontSize: 14 },
    { name: "Wrong", count: wrongAnswers, color: "red", legendFontColor: "#333", legendFontSize: 14 },
    { name: "Skipped", count: skippedAnswers, color: "orange", legendFontColor: "#333", legendFontSize: 14 },
  ];

  const accuracy = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);

  const backgroundColor =
    mode === "easy"
      ? "#e3f2fd" // Light blue
      : mode === "intermediate"
      ? "#fff3cd" // Light yellow
      : mode === "advance"
      ? "#f8d7da" // Light red
      : "#ffffff"; // Default to white

  const screenWidth = Dimensions.get("window").width;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor }]}>
      <Text style={styles.title}>Result Analysis</Text>

      {/* Time Taken Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Time Taken</Text>
        <Text style={styles.timeValue}>{timeTaken}</Text>
      </View>

      <View style={styles.analysisContainer}>
        <Text style={[styles.analysisText, { color: "green" }]}>Correct: {correct}</Text>
        <Text style={[styles.analysisText, { color: "red" }]}>Wrong: {wrongAnswers}</Text>
        <Text style={[styles.analysisText, { color: "orange" }]}>Skipped: {skippedAnswers}</Text>
      </View>

      <PieChart
        data={data}
        width={screenWidth - 40} // Adjust width for padding
        height={200} // Fixed height
        chartConfig={{
          backgroundColor: "#f8f9fa",
          backgroundGradientFrom: "#f8f9fa",
          backgroundGradientTo: "#f8f9fa",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"count"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <Text style={styles.progressTitle}>Accuracy</Text>
          <Text style={styles.progressValue}>{accuracy}%</Text>
          <TouchableOpacity
            style={styles.reattemptButton}
            onPress={() => {
              navigation.navigate(testScreenType, {
                chapter: chapter || "Unknown Chapter",
                questions: [...(questions || [])], // Safeguard empty questions
                mode: mode || "normal",
                subject: subject || "Unknown Subject",
                selectedTime
              });
            }}
          >
            <Text style={styles.reattemptButtonText}>Reattempt</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressTitle}>Score</Text>
          <Text style={styles.progressValue}>
            {correct}/{totalQuestions}
          </Text>
          <TouchableOpacity
            style={styles.solutionButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("SolutionScreen", {
                chapter,
                questions: [...questions], // Pass all questions
                selectedAnswers, // Pass updated answers with skipped
                testScreenType,
              })
            }
          >
            <Text style={styles.solutionButtonText}>Solution</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  timeContainer: {
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  timeLabel: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  timeValue: { fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 5 },
  analysisContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  analysisText: { fontSize: 16, fontWeight: "bold" },
  progressContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  progressItem: { alignItems: "center", flex: 1 },
  progressTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  progressValue: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  reattemptButton: { padding: 12, backgroundColor: "#4caf50", borderRadius: 8, marginTop: 10 },
  reattemptButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  solutionButton: { padding: 12, backgroundColor: "#2196f3", borderRadius: 8, marginTop: 10 },
  solutionButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});

export default ResultScreen;
