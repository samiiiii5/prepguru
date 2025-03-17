import React, { useState, useEffect } from "react";
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

const HardTestScreen = ({ route, navigation }) => {
  const { questions: passedQuestions, chapter, mode, subject } = route.params || {};
  const [questions, setQuestions] = useState(passedQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [remainingTime, setRemainingTime] = useState(null);
  const [totalTime, setTotalTime] = useState(20 * 60); // Default total time (20 minutes)
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false); // New state for pause/start

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    Alert.alert("Exit Test", "Are you sure you want to exit? Your progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Exit",
        onPress: () => {
          setPaused(true); // Stop the timer
          navigation.replace("Home");
        },
      },
    ]);
    return true;
  };

  useEffect(() => {
    if (!passedQuestions || passedQuestions.length === 0) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      const snapshot = await database()
        .ref(`/test/${subject}/${chapter}/questions`)
        .once("value");

      if (snapshot.exists()) {
        const fetchedQuestions = Object.values(snapshot.val());
        if (fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      initializeTimer();
    }
  }, [questions]);

  const initializeTimer = () => {
    let timeLimit = 20 * 60; // Default for hard mode
    if (mode === "intermediate") timeLimit = 15 * 60;
    else if (mode === "advance") timeLimit = 10 * 60;
  
    setTotalTime(timeLimit);
    setRemainingTime(timeLimit); // Ensure remainingTime starts with the correct value
  };

  useEffect(() => {
    if (remainingTime === null || paused) return; // Pause timer if paused is true

    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleTimeUp();
    }
  }, [remainingTime, paused]);

  const handleTimeUp = () => {
    Alert.alert("Time's Up!", "Your test time is over.", [
      {
        text: "OK",
        onPress: () =>
          navigation.navigate("ResultScreen", {
            selectedAnswers,
            questions,
            chapter,
            timeTaken: formatTime(0),
            testScreenType: "HardTestScreen",
            mode,
          }),
      },
    ]);
  };

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const animateTransition = (nextIndex) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setCurrentIndex(nextIndex));
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
  
            const timeTakenInSeconds = totalTime - (remainingTime || 0);
          const formattedTimeTaken = formatTime(timeTakenInSeconds > 0 ? timeTakenInSeconds : 0);
  
            const score = (correctCount / questions.length) * 100;
            const testData = {
              subject,
              chapter,
              mode,
              totalQuestions: questions.length,
              correctCount,
              incorrectCount,
              skippedCount,
              score: score.toFixed(2),
              timeTaken: formattedTimeTaken ,
              timestamp: database.ServerValue.TIMESTAMP,
            };
  
            // Store results in Firebase
            await database().ref(`/userResults/${userId}/${subject}`).push(testData);
  
            console.log("Test submitted successfully. Navigating to ResultScreen...");
            
            // Navigate to Result Screen with updated parameters
            navigation.navigate("ResultScreen", {
              selectedAnswers,
              questions,
              chapter,
              correctCount,
              incorrectCount,
              skippedCount,
              timeTaken: formattedTimeTaken , // Send formatted time
              testScreenType: "HardTestScreen",
              mode,
            });
          } catch (error) {
            console.error("Error during submission:", error);
            Alert.alert("Error", "Something went wrong during submission. Please try again.");
          }
        },
      },
    ]);
  };
  
  
  
  

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const formatChapterName = (chapter) => {
    return chapter
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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
        <Text>No questions available.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Time Remaining: {remainingTime !== null ? formatTime(remainingTime) : "Loading..."}
        </Text>
      </View>

      <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
        <Text style={styles.pauseText}>{paused ? "Resume" : "Pause"}</Text>
      </TouchableOpacity>

      <Text style={styles.chapterText}>Question {currentIndex + 1} of {questions.length}</Text>
      <Text style={styles.chapterText}>{formatChapterName(chapter)}</Text>

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

      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
          <Image source={require("./assets/left-arrow.png")} style={[styles.arrow, { opacity: currentIndex === 0 ? 0.5 : 1 }]} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitButton}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} disabled={currentIndex === questions.length - 1}>
          <Image source={require("./assets/right-arrow.png")} style={styles.rightArrow} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  timerContainer: {
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f44336",
  },
  pauseButton: {
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  pauseText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  chapterText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#444",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333", // Dark color for better readability
  },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "lightblue", // Blue for options
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black", // White text on blue buttons
  },
  selectedOption: {
    backgroundColor: "#5cb85c", // Green background for selected option
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  arrow: {
    width: 50,
    height: 40,
    tintColor: "#007BFF",
  },
  rightArrow: {
    width: 60,
    height: 40,
    tintColor: "#007BFF",
  },
  submitButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    padding: 10,
    alignSelf: "center",
    backgroundColor: "#d4edda", // Light green background for submit button
    borderRadius: 8,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HardTestScreen;
