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

const EasyTestScreen = ({ route, navigation }) => {
  const { subject, chapter, questions: passedQuestions } = route.params;
  const [questions, setQuestions] = useState(passedQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [changeAttempted, setChangeAttempted] = useState(false);
  const [paused, setPaused] = useState(false); // State for pause/resume
  const fadeAnim = useState(new Animated.Value(1))[0];
  const warningAnim = useState(new Animated.Value(0))[0];
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
  
    return () => backHandler.remove(); // Ensure cleanup on unmount
  }, []);
  
  const handleBackPress = () => {
    Alert.alert(
      "Exit Test",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          onPress: () => {
            setPaused(true); // Pause timer
  
            // Ensure the state reset happens only after navigation
            navigation.replace("Home"); 
  
            setTimeout(() => {
              setElapsedTime(0); 
              setQuestions([]); 
              setCurrentIndex(0); 
              setSelectedAnswers({});
            }, 500); // Small delay to ensure navigation first
          },
        },
      ]
    );
    return true; // Prevent default back action
  };

    useEffect(() => {
      if (chapter) {
        console.log(`Fetching questions for chapter: ${chapter}`);
        fetchQuestions();
      }
    }, [chapter]);

  useEffect(() => {
    if (!passedQuestions) fetchQuestions();
  }, []);

 const fetchQuestions = async () => {
  console.log("fetchQuestions() called");
  try {
    const snapshot = await database()
      .ref(`/test/${subject}/${chapter}/questions`)
      .once("value");

    console.log("Snapshot data:", snapshot.val());

    if (snapshot.exists()) {
      const fetchedQuestions = Object.values(snapshot.val());
      setQuestions(
        fetchedQuestions.map((q) => ({
          ...q,
          correct: q.correct || "",
        }))
      );
    } else {
      console.warn("No questions found for:", chapter);
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
};

useEffect(() => {
  if (paused) return; // Pause the timer when needed

  const timer = setInterval(() => {
    setElapsedTime((prevTime) => prevTime + 1);
  }, 1000);

  return () => {
    clearInterval(timer); // Cleanup timer on unmount
  };
}, [paused]);

  const formatTime = (time) => {
    const hours = String(Math.floor(time / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
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

  const showWarning = () => {
    // Animate the warning message (fade-in and slide-in)
    Animated.timing(warningAnim, {
      toValue: 1, // Fully visible
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Hide the warning message after 2 seconds
      setTimeout(() => {
        Animated.timing(warningAnim, {
          toValue: 0, // Fully hidden
          duration: 600,
          useNativeDriver: true,
        }).start(() => setChangeAttempted(false)); // Reset the warning state
      }, 2000);
    });
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswers[currentIndex]?.userAnswer) {
      setChangeAttempted(true); // Set warning to true
      showWarning(); // Trigger the warning animation
      return; // Prevent changing the answer
    }

    // Allow the selection of the answer
    setChangeAttempted(false); // Reset warning
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
          const userId = auth().currentUser?.uid;
          if (!userId) {
            Alert.alert("Error", "User not logged in");
            return;
          }
  
          const totalQuestions = questions.length;
          let correctCount = 0;
          let skippedCount = 0;
          let incorrectCount = 0;
  
          // Calculate score
          const resultData = questions.map((q, index) => {
            const userAnswer = selectedAnswers[index]?.userAnswer || "skipped";
            const isCorrect = userAnswer === q.correct;
            
            if (userAnswer === "skipped") skippedCount++;
            else if (isCorrect) correctCount++;
            else incorrectCount++;
  
            return {
              question: q.question,
              userAnswer,
              correctAnswer: q.correct,
              isCorrect,
            };
          });
  
          const score = (correctCount / totalQuestions) * 100;
          const testData = {
            subject,
            chapter,
            totalQuestions,
            correctCount,
            incorrectCount,
            skippedCount,
            score: score.toFixed(2),
            timeTaken: formatTime(elapsedTime),
            timestamp: database.ServerValue.TIMESTAMP,
            resultData,
          };
  
          // Store in Firebase under userResults/userId
          await database()
            .ref(`/userResults/${userId}/${subject}/${chapter}`)
            .push(testData)
            .then(() => {
              console.log("Test results saved successfully!");
            })
            .catch((error) => {
              console.error("Error saving test results:", error);
            });
  
          // Navigate to Result Screen
          navigation.navigate("ResultScreen", {
            selectedAnswers,
            questions,
            chapter,
            timeTaken: formatTime(elapsedTime),
            testScreenType: "EasyTestScreen",
          });
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
          Time Elapsed: {formatTime(elapsedTime)}
        </Text>
        <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
          <Text style={styles.pauseText}>{paused ? "Resume" : "Pause"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chapterText}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <Text style={styles.chapterText}>{formatChapterName(chapter)}</Text>

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

        {/* Warning message with smooth animations */}
        {changeAttempted && (
          <Animated.View
            style={[
              styles.warningContainer,
              {
                opacity: warningAnim,
                transform: [
                  {
                    translateY: warningAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0], // Slide in from below
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.warningText}>You cannot change your answer.</Text>
          </Animated.View>
        )}
      </Animated.View>

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
  warningContainer: {
    backgroundColor: "black", 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 5, 
    alignSelf: "center",
    marginTop: 10, 
  },
  warningText: {
    color: "white", 
    fontSize: 14, 
    textAlign: "center", 
  },
});

export default EasyTestScreen;
