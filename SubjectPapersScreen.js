import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';

const SubjectPapersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subject } = route.params;
  const [subjectPdfs, setSubjectPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectPdfs = async () => {
      setLoading(true);
      try {
        const snapshot = await database().ref(`pyp/chapterwise/${subject}`).once('value');
        if (snapshot.exists()) {
          const data = snapshot.val();
          const pdfArray = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            url: data[key].url,
          }));
          setSubjectPdfs(pdfArray);
        }
      } catch (error) {
        console.error(`Error fetching ${subject} PDFs:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectPdfs();
  }, [subject]);

  const handlePdfSelection = (url, name) => {
    navigation.navigate('PdfViewer', { pdfUrl: url, subject, name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />
      <Text style={styles.text}>{subject.charAt(0).toUpperCase() + subject.slice(1)} Papers</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#001F54" />
      ) : (
        <FlatList
          data={subjectPdfs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePdfSelection(item.url, item.name)} style={styles.card}>
              <Text style={styles.pdfName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  topLine: { position: 'absolute', left: 0, top: 20, width: '76%', height: 10, backgroundColor: '#001F54' },
  smallLine: { position: 'absolute', left: 0, top: 40, width: '55%', height: 10, backgroundColor: '#001F54' },
  text: { fontWeight: 'bold', fontSize: 25, color: '#000000', marginBottom: 20, marginTop: 40 },
  card: { padding: 15, backgroundColor: '#ffffff', borderRadius: 8, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  pdfName: { fontSize: 18, fontWeight: 'bold', color: '#495057' },
});

export default SubjectPapersScreen;
