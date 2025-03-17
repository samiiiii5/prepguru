import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const subjects = ['Yearwise', 'Chapterwise'];

const PYP = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      Animated.timing(slideAnim, {
        toValue: 0, 
        duration: 0, 
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  const handleSubjectSelect = (subject) => {
    Animated.timing(slideAnim, {
      toValue: -1000, 
      duration: 950,
      useNativeDriver: true,
    }).start(() => {
      if (subject === 'Yearwise') {
        navigation.navigate('YearwiseScreen');
      } else {
        navigation.navigate('ChapterwiseScreen');
      }
    });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />

      <View style={styles.headerContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginTop: -219, marginRight:150, fontSize: 25 }]}>
          Pervious Year Papers
        </Text>
      </View>
      <Text style={styles.subHeading}>Select a Category</Text>

      <View style={styles.subjectContainer}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={styles.subjectButton}
            onPress={() => handleSubjectSelect(subject)}
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

export default PYP;
