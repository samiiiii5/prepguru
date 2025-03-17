import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const subjects = ['Physics', 'Chemistry', 'Biology'];

const MM = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Reset the position only when the screen is focused
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0, // Instantly reset
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  const handleSubjectSelect = (subject) => {
    Animated.timing(slideAnim, {
      toValue: -1000, // Move whole screen up
      duration: 950,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('PDFList', { subject });
    });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      {/* Top Blue Line */}
      <View style={styles.topLine} />
      {/* Small Blue Line */}
      <View style={styles.smallLine} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginTop: -189, marginRight: 250, fontSize: 25 }]}>
          Mind Map
        </Text>
      </View>
      <Text style={styles.subHeading}>Select a Category</Text>

      <View style={styles.subjectContainer}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={styles.subjectButton}
            onPress={() => handleSubjectSelect(subject.toLowerCase())}
          >
            <Text style={styles.subjectText}>{subject}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  subHeading: { fontSize: 18, fontWeight: '600', marginBottom: 20, color: '#000', alignSelf: 'center' },
  subjectContainer: { width: '100%', alignItems: 'center' },
  subjectButton: { backgroundColor: '#001F54', padding: 15, width: '80%', borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  subjectText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  topLine: { position: 'absolute', left: 0, top: 20, width: '76%', height: 10, backgroundColor: '#001F54' },
  smallLine: { position: 'absolute', left: 0, top: 40, width: '55%', height: 10, backgroundColor: '#001F54' },
  text: { fontWeight: 'bold', fontSize: 25, color: '#000000', marginBottom: 20 },
});

export default MM;
