import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import { BarChart } from "react-native-chart-kit";

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;
  
    const snapshot = await database().ref(`/userResults/${userId}`).once("value");
  
    if (!snapshot.exists()) {
      setProgressData([]);
      setLoading(false);
      return;
    }
  
    const subjectResults = snapshot.val();
    const processedData = Object.keys(subjectResults).map((subject) => {
      const tests = Object.values(subjectResults[subject]).filter((test) => test.score !== undefined);
  
      if (tests.length === 0) {
        return { subject, avgScore: 0 }; // Prevent NaN values
      }
  
      const totalTests = tests.length;
      const totalScore = tests.reduce((sum, test) => sum + Number(test.score), 0);
      const avgScore = totalScore / totalTests; // Now it's always a valid number
  
      return { subject, avgScore };
    });
  
    setProgressData(processedData);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : progressData.length === 0 ? (
        <Text style={styles.noData}>No progress data available.</Text>
      ) : (
        <>
          <BarChart
  data={{
    labels: progressData.map((item) => item.subject),
    datasets: [{ data: progressData.map((item) => item.avgScore || 0) }],
  }}
  width={350}
  height={220}
  yAxisSuffix="%"
  chartConfig={{
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  }}
  style={{ marginVertical: 10 }}
/>

          <FlatList
            data={progressData}
            keyExtractor={(item) => item.subject}
            renderItem={({ item }) => (
              <View style={styles.progressItem}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.score}>Avg Score: {item.avgScore.toFixed(2)}%</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  noData: { textAlign: "center", fontSize: 16, color: "gray" },
  progressItem: { backgroundColor: "#d4edda", padding: 15, marginVertical: 5, borderRadius: 8 },
  subject: { fontSize: 18, fontWeight: "bold" },
  score: { fontSize: 16, color: "#007BFF" },
});

export default Progress;
