import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { BackHandler } from "react-native";

const SolutionScreen = ({ route, navigation }) => {
  const { questions = [], selectedAnswers = {} } = route.params || {}; // Ensure defaults

  useEffect(() => {
    // Handle back button press
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  const handleBackPress = () => {
    // Navigate to the home screen when the back button is pressed
    navigation.navigate("Home");
    return true; // Prevent default behavior
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  if (!questions || questions.length === 0) {
    return <Text>Loading solutions...</Text>;
  }

  const animateTransition = (nextIndex) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      animateTransition(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition(currentIndex - 1);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Question Section */}
      <Text style={styles.chapterText}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Options Section */}
        {["a", "b", "c", "d"].map((option) => {
  const correctAnswer = String(currentQuestion.correct).trim().toLowerCase();
  const selectedAnswer = selectedAnswers[currentIndex]?.userAnswer
    ? String(selectedAnswers[currentIndex].userAnswer).trim().toLowerCase()
    : "";

  const isCorrect = option === correctAnswer;
  const isSelected = option === selectedAnswer;
  const isWrongSelected = isSelected && !isCorrect;
  console.log(`DEBUG - Question ${currentIndex + 1}:`);
  console.log(`Full Selected Answers:`, selectedAnswers);
  console.log(`Correct: ${correctAnswer}, Selected: ${selectedAnswer}`);
  console.log(`Checking Option: ${option}`);

  return (
    <TouchableOpacity
      key={option}
      style={[
        styles.optionButton,
        isCorrect ? styles.correctOption : null, // Highlight correct answer in green
        isWrongSelected ? styles.wrongOption : null, // Highlight wrong selected answer in red
      ]}
      disabled
    >
      <Text style={styles.optionText}>{currentQuestion.options[option]}</Text>
    </TouchableOpacity>
  );
})}

        {/* Explanation Section */}
        <ScrollView style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </ScrollView>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
          <Text
            style={[
              styles.navButton,
              { opacity: currentIndex === 0 ? 0.5 : 1 }, // Disable effect
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Text
            style={[
              styles.navButton,
              { opacity: currentIndex === questions.length - 1 ? 0.5 : 1 }, // Disable effect
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  chapterText: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  questionText: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#d3d3d3", // Default background
  },
  correctOption: { backgroundColor: "green" }, // Green for correct
  wrongOption: { backgroundColor: "red" }, // Red for wrong
  optionText: { fontSize: 16, color: "white" },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  explanationTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  explanationText: { fontSize: 16, color: "#333" },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: { fontSize: 18, color: "#007BFF", fontWeight: "bold" },
});

export default SolutionScreen;
