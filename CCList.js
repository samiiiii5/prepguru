import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';

const CCList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subject } = route.params;
  const [pdfList, setPdfList] = useState([]);
  const [filteredPdfList, setFilteredPdfList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      try {
        const snapshot = await database().ref(`notes/${subject}`).once('value');
        if (snapshot.exists()) {
          const data = snapshot.val();
          const pdfArray = Object.keys(data).map((key) => ({
            id: data[key].id,
            name: data[key].name,
            url: data[key].url,
          }));
          setPdfList(pdfArray);
          setFilteredPdfList(pdfArray);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [subject]);

  useEffect(() => {
    const filtered = pdfList.filter(pdf =>
      pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPdfList(filtered);
  }, [searchQuery, pdfList]);

  const handlePdfSelection = (url, name) => {
    navigation.navigate('PdfViewer', { pdfUrl: url, subject, name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />
      <Text style={styles.text}>{subject.charAt(0).toUpperCase() + subject.slice(1)} PDFs</Text>
      
      <TextInput
        style={styles.searchBar}
        placeholder="Search PDFs"
        placeholderTextColor="#001F54"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#001F54" />
      ) : (
        <FlatList
          data={filteredPdfList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePdfSelection(item.url, item.name)} style={styles.card}>
              <View style={styles.textContainer}>
                <Text style={styles.pdfName}>{item.name}</Text>
              </View>
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
  text: { fontWeight: 'bold', fontSize: 25, color: '#000000', marginBottom: 20, marginTop: 40, },
  searchBar: { fontSize: 16, borderColor: '#001F54', borderWidth: 1, borderRadius: 5, padding: 10, width: '100%', marginBottom: 20, color: '#001F54' },
  card: { flexDirection: 'row', padding: 15, backgroundColor: '#ffffff', borderRadius: 8, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  textContainer: { flex: 1 },
  pdfName: { fontSize: 18, fontWeight: 'bold', color: '#495057' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default CCList;
