import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Speed = () => {
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const translateYAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubjectSelect = (subject) => {
    navigation.navigate('ChapterAndConfigScreen', { subject});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Subject</Text>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] }}>
        {['Biology', 'Chemistry', 'Physics'].map((subject, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.button} 
            onPress={() => handleSubjectSelect(subject.toLowerCase())}
          >
            <Text style={styles.buttonText}>{subject}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#001F54' },
  button: { 
    backgroundColor: '#001F54', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 10, 
    width: 200, 
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default Speed;
