import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
  Image,
  BackHandler,
} from "react-native";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
const SpeedTestScreen = ({ route, navigation }) => {
  const { subject, selectedChapters = [], selectedTime, selectedQuestions, questions: passedQuestions = [] } = route.params;

  const [questions, setQuestions] = useState([]); // Questions fetched from Firebase
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [remainingTime, setRemainingTime] = useState(() => selectedTime * 60);
  const [paused, setPaused] = useState(false); // State for pause/resume
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setRemainingTime(selectedTime * 60);
  }, [selectedTime]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (remainingTime === null || paused) return;

    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleTimeUp();
    }
  }, [remainingTime, paused]);

  const handleBackPress = () => {
    Alert.alert(
      "Exit Test",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          onPress: () => {
            setPaused(true);
            navigation.replace("Home");
          },
        },
      ]
    );
    return true;
  };

  const fetchQuestions = async () => {
    try {
      // Use passedQuestions if available
      if (passedQuestions.length > 0) {
        setQuestions(passedQuestions);
        return; // Skip Firebase fetching
      }
  
      // Otherwise, fetch from Firebase
      const fetchedQuestions = [];
      for (const chapter of selectedChapters) {
        const snapshot = await database()
          .ref(`/test/${subject}/${chapter}/questions`)
          .once("value");
  
        if (snapshot.exists()) {
          const chapterQuestions = Object.values(snapshot.val());
          fetchedQuestions.push(...chapterQuestions);
        }
      }
  
      // Shuffle and limit questions
      const shuffledQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions.slice(0, selectedQuestions));
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleTimeUp = () => {
    Alert.alert("Time's Up!", "Your test time is over.", [
      {
        text: "OK",
        onPress: () => handleSubmit(),
      },
    ]);
  };

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: { userAnswer: option },
    }));
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

  const animateTransition = (nextIndex) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setCurrentIndex(nextIndex));
  };

  const handleSubmit = () => {
    Alert.alert("Submit Test", "Are you sure you want to submit?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const userId = auth().currentUser?.uid;
            if (!userId) {
              Alert.alert("Error", "User not logged in");
              return;
            }
  
            let correctCount = 0;
            let skippedCount = 0;
            let incorrectCount = 0; // Track incorrect answers separately
    
            questions.forEach((q, index) => {
              const userAnswer = selectedAnswers[index]?.userAnswer;
    
              if (!userAnswer) {
                skippedCount++; // If no answer is selected, it's a skipped question
              } else if (userAnswer === q.correct) {
                correctCount++;
              } else {
                incorrectCount++; // Count incorrect answers properly
              }
            });
  
            const timeTaken = (route.params.selectedTime * 60) - remainingTime;
  
            const score = (correctCount / questions.length) * 100;
            const testData = {
              subject,
              chapters: selectedChapters || [],
              mode: "speed",
              totalQuestions: questions.length,
              correctCount,
              incorrectCount,
              skippedCount,
              score: score.toFixed(2),
              timeTaken: formatTime(timeTaken),
              timestamp: database.ServerValue.TIMESTAMP,
            };
  
            // Save to Firebase
            await database().ref(`/userResults/${userId}/${subject}`).push(testData);
  
            // Navigate to ResultScreen
            console.log("Navigating to ResultScreen...");
            navigation.navigate("ResultScreen", {
              selectedAnswers,
              selectedTime,
              questions,
              chapter: selectedChapters.join(", "),
              timeTaken: formatTime(timeTaken),
              testScreenType: "SpeedTestScreen",
              mode: "speed",
            });
          } catch (error) {
            console.error("Error during submission:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
          }
        },
      },
    ]);
  };
  

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No questions available for the selected chapters.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Time Remaining: {formatTime(remainingTime)}
        </Text>
      </View>

      {/* Pause Button */}
      <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
        <Text style={styles.pauseText}>{paused ? "Resume" : "Pause"}</Text>
      </TouchableOpacity>

      {/* Question */}
      <Text style={styles.chapterText}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {Object.entries(currentQuestion.options).map(([key, option]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionButton,
              selectedAnswers[currentIndex]?.userAnswer === key && styles.selectedOption,
            ]}
            onPress={() => handleAnswerSelect(key)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
          <Image
            source={require("./assets/left-arrow.png")}
            style={[styles.arrow, { opacity: currentIndex === 0 ? 0.5 : 1 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitButton}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Image
            source={require("./assets/right-arrow.png")}
            style={[
              styles.arrow,
              { opacity: currentIndex === questions.length - 1 ? 0.5 : 1 },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  timerContainer: { alignItems: "center", marginBottom: 10 },
  timerText: { fontSize: 20, fontWeight: "bold", color: "#f44336" },
  pauseButton: {
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  pauseText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  chapterText: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  questionText: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "lightblue",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedOption: { backgroundColor: "#5cb85c" },
  optionText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  arrow: { width: 50, height: 40, tintColor: "#007BFF" },
  submitButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    padding: 10,
    alignSelf: "center",
    backgroundColor: "#d4edda",
    borderRadius: 8,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default SpeedTestScreen;