import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image, TextInput } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth"; // Import Firebase Auth

const Class11 = () => {
  const [pdfList, setPdfList] = useState([]);
  const [pdfReads, setPdfReads] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const userId = auth().currentUser?.uid; // Get current user ID
  
  // Safely handle `subject`
  const subject = route.params?.subject || "";
  const subjectFormatted = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "Subject";

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      setError(null);

      try {
        const snapshot = await database().ref(`content/class11/${subject}/theory`).once("value");
        if (snapshot.exists()) {
          const data = snapshot.val();
          const pdfArray = Object.keys(data).map((key) => ({
            id: data[key]?.id || key, 
            name: data[key]?.name || "Untitled",
            url: data[key]?.url || "",
          }));
          setPdfList(pdfArray);
        } else {
          setPdfList([]);
        }
      } catch (error) {
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (subject) {
      fetchPdfs();
    }
  }, [subject]);

  useEffect(() => {
    const fetchPdfReads = async () => {
      if (!userId) return;

      try {
        const snapshot = await database().ref(`pdfReads/${userId}/${subject}`).once("value");
        if (snapshot.exists()) {
          setPdfReads(snapshot.val());
        } else {
          setPdfReads({});
        }
      } catch (error) {
        console.error("Error fetching PDF reads:", error);
      }
    };

    fetchPdfReads();
  }, [userId, subject]);

  const handlePdfSelection = (url, name, chapter) => {
    if (!url) {
      alert("PDF URL not available");
      return;
    }

    // Increment the read count in the database
    if (userId) {
      const chapterPath = `pdfReads/${userId}/${subject}/${chapter}`;
      database().ref(chapterPath).transaction((count) => (count || 0) + 1);
    }

    navigation.navigate('PdfViewer', { pdfUrl: url, subject, name });
  };

  const filteredPdfList = pdfList.filter((item) => 
    item.name && searchQuery 
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true
  );

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />
      
      <View style={styles.heading}>
        <Text style={styles.title}>Class 11 {subjectFormatted} PDFs</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.searchBarContainer}>
        <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search PDFs"
          placeholderTextColor="#001F54"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {!loading && (
        <FlatList
          data={filteredPdfList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const readCount = pdfReads[item.id] || 0; // Get read count from database
            return (
              <TouchableOpacity onPress={() => handlePdfSelection(item.url, item.name, item.id)} style={styles.card}>
                <View style={styles.textContainer}>
                  <Text style={styles.pdfName}>{item.name}</Text>
                  <Text style={styles.readCount}>Views: {readCount}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  pdfName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  readCount: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 40,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchBar: {
    fontSize: 16,
    flex: 1,
    color: '#001F54',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  topLine: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: '76%',
    height: 10,
    backgroundColor: '#001F54',
  },
  smallLine: {
    position: 'absolute',
    left: 0,
    top: 40,
    width: '55%',
    height: 10,
    backgroundColor: '#001F54',
  },
});

export default Class11;
