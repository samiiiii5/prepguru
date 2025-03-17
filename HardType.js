import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const HardType = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { subject, chapter } = route.params;

  const handleModeSelect = (mode) => {
    // Navigate to the next screen with the selected mode and subject
    navigation.navigate('HardTestScreen', { subject, chapter,mode, testScreenType: "HardTestScreen" }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Mode for {subject.charAt(0).toUpperCase() + subject.slice(1)}</Text>
      {['Beginner', 'Intermediate', 'Advance'].map((mode, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleModeSelect(mode.toLowerCase())}
        >
          <Text style={styles.buttonText}>{mode}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#001F54', textAlign: 'center' },
  button: { 
    backgroundColor: '#001F54', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 10, 
    width: 220, 
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default HardType;
