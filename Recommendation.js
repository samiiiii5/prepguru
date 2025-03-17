import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";

const Recommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const snapshot = await database().ref(`/userResults/${userId}`).once("value");

    if (!snapshot.exists()) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const subjectResults = snapshot.val();
    const recommendationList = [];

    Object.keys(subjectResults).forEach((subject) => {
      const chapterResults = subjectResults[subject];
      let subjectAvg = 0;
      let totalTests = 0;
      const weakChapters = [];

      Object.keys(chapterResults).forEach((chapter) => {
        const tests = Object.values(chapterResults[chapter]);
        const chapterAvgScore = tests.reduce((sum, test) => sum + parseFloat(test.score), 0) / tests.length;

        subjectAvg += chapterAvgScore;
        totalTests += tests.length;

        if (chapterAvgScore < 50) {
          weakChapters.push({ chapter, avgScore: chapterAvgScore });
        }
      });

      if (totalTests > 0) {
        subjectAvg /= totalTests;
      }

      if (weakChapters.length > 0) {
        recommendationList.push({ subject, weakChapters });
      }
    });

    setRecommendations(recommendationList);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recommendations</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f44336" />
      ) : recommendations.length === 0 ? (
        <Text style={styles.noData}>You're doing great! No weak subjects or chapters detected.</Text>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.subject}
          renderItem={({ item }) => (
            <View style={styles.recommendationItem}>
              <Text style={styles.subject}>{item.subject}</Text>
              {item.weakChapters.map((chapterItem, index) => (
                <Text key={index} style={styles.suggestion}>
                  ❗ {chapterItem.chapter} - Avg Score: {chapterItem.avgScore.toFixed(2)}%
                </Text>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff3cd", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  noData: { textAlign: "center", fontSize: 16, color: "gray" },
  recommendationItem: { backgroundColor: "#f8d7da", padding: 15, marginVertical: 5, borderRadius: 8 },
  subject: { fontSize: 18, fontWeight: "bold", color: "#721c24" },
  suggestion: { fontSize: 16, color: "#721c24", marginTop: 5 },
});

export default Recommendation;
