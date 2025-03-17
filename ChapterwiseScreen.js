import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const subjects = ['Physics', 'Chemistry', 'Biology'];

const ChapterwiseScreen = () => {
  const navigation = useNavigation();

  const handleSubjectSelect = (subject) => {
    navigation.navigate('SubjectPapersScreen', { subject: subject.toLowerCase() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Subject</Text>
      {subjects.map((subject) => (
        <TouchableOpacity key={subject} style={styles.subjectButton} onPress={() => handleSubjectSelect(subject)}>
          <Text style={styles.subjectText}>{subject}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#001F54' },
  subjectButton: { backgroundColor: '#001F54', padding: 15, width: '80%', borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  subjectText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ChapterwiseScreen;
