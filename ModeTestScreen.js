import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
  Image,
} from "react-native";
import database from "@react-native-firebase/database";
import { BackHandler } from "react-native";
import auth from "@react-native-firebase/auth";

const ModeTestScreen = ({ route, navigation }) => {
  const { subject, chapter, questions: passedQuestions } = route.params;
  const [questions, setQuestions] = useState(passedQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [remainingTime, setRemainingTime] = useState(20 * 60); // 20 minutes in seconds
  const [paused, setPaused] = useState(false); // State for pause/resume functionality

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
    if (!passedQuestions) fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const snapshot = await database()
        .ref(`/test/${subject}/${chapter}/questions`)
        .once("value");

      if (snapshot.exists()) {
        const fetchedQuestions = Object.values(snapshot.val());
        setQuestions(
          fetchedQuestions.map((q) => ({
            ...q,
            correct: q.correct || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (paused || remainingTime <= 0) return;
    if (remainingTime > 0) {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
   }else{
    handleTimeUp();
   } // Cleanup on unmount
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
            timeTaken: "20:00",
            testScreenType: "ModeTestScreen",
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

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const handleSubmit = () => {
    Alert.alert("Submit Test", "Are you sure you want to submit?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
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
  
          const elapsedTime = (20 * 60) - remainingTime; // Correct elapsed time calculation
          const score = (correctCount / questions.length) * 100;
  
          const testData = {
            subject,
            totalQuestions: questions.length,
            correctCount,
            incorrectCount,
            skippedCount,
            score: score.toFixed(2),
            timeTaken: formatTime(elapsedTime), // Properly formatted time
            timestamp: database.ServerValue.TIMESTAMP,
          };
  
          try {
            await database().ref(`/userResults/${userId}/${subject}`).push(testData);
  
            navigation.navigate("ResultScreen", {
              selectedAnswers,
              questions,
              timeTaken: formatTime(elapsedTime),
              testScreenType: "ModeTestScreen",
            });
          } catch (error) {
            console.error("Error submitting test data:", error);
            Alert.alert("Error", "There was a problem submitting your test data.");
          }
        },
      },
    ]);
  };
  
  const formatChapterName = (chapter) => {
    return chapter
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (questions.length === 0) {
    return <Text>Loading questions...</Text>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Timer and Pause Button */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Time Remaining: {formatTime(remainingTime)}
        </Text>
        <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
          <Text style={styles.pauseText}>{paused ? "Resume" : "Pause"}</Text>
        </TouchableOpacity>
      </View>

      {/* Question Information */}
      <Text style={styles.chapterText}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <Text style={styles.chapterText}>{formatChapterName(chapter)}</Text>

      {/* Question and Options */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {Object.keys(currentQuestion.options).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedAnswers[currentIndex]?.userAnswer === option &&
                styles.selectedOption,
            ]}
            onPress={() => handleAnswerSelect(option)}
          >
            <Text style={styles.optionText}>
              {currentQuestion.options[option]}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Navigation and Submit */}
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
            style={styles.rightArrow}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  timerContainer: {
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
  },
  pauseButton: {
    marginTop: 10,
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 8,
  },
  pauseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  chapterText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "lightblue",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "gray",
  },
  optionText: {
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

export default ModeTestScreen;
