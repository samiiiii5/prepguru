import React, { useRef } from 'react';
import {
SafeAreaView,
StyleSheet,
ScrollView,
View,
Text,
StatusBar,
Animated,
TouchableOpacity,
} from 'react-native';

const BANNER_H = 460;

const Py = ({ navigation }) => {
const scrollA = useRef(new Animated.Value(0)).current;

return (
<>
<StatusBar barStyle="dark-content" />
<Animated.ScrollView
showsVerticalScrollIndicator={false}
onScroll={Animated.event(
[{ nativeEvent: { contentOffset: { y: scrollA } } }],
{ useNativeDriver: true }
)}
style={styles.scrollView}
>
<View style={styles.container}>
{/* Animated Image Banner */}
<Animated.Image
style={styles.banner(scrollA)}
width="100%"
height={BANNER_H}
source={require('./assets/animate1.png')} // Ensure correct path to asset
/>

{/* Title Section */}
<View style={styles.TextView}>
<Text style={styles.title}>Physics</Text>

{/* Description */}
<Text style={styles.footer}>
Physics is the key to understanding the fundamental principles that govern our universe.Consistent study and practice not only strengthen your grasp of the subject but also bring you closer to achieving your academic and personal goals. Every dedicated hour of study propels you further toward realizing your aspirations and mastering the subject.
</Text>

{/* Buttons */}
<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate('Class11', { subject: 'physics'})}
>
<Text style={styles.buttonText}>Class 11th</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => navigation.navigate('Class12', { subject: 'physics'})}
>
<Text style={styles.buttonText}>Class 12th</Text>
</TouchableOpacity>
</View>
</View>
</Animated.ScrollView>
</>
);
};

const styles = StyleSheet.create({
scrollView: {
backgroundColor: '#fff',
flex: 1,
},
title: {
color: '#000',
fontSize: 24,
fontWeight: '600',
lineHeight: 26,
padding: 20,
paddingBottom: 0,
},
TextView: {
justifyContent: 'center',
backgroundColor: '#fff',
borderTopLeftRadius: 30,
borderTopRightRadius: 30,
top: -30,
paddingBottom: 50,
},
banner: (scrollA) => ({
height: BANNER_H,
width: '100%',
left:0,
transform: [
{
translateY: scrollA,
},
{
scale: scrollA.interpolate({
inputRange: [-BANNER_H, 5, BANNER_H, BANNER_H + 2],
outputRange: [3, 1, 1.5, 3],
}),
},
],
}),
button: {
backgroundColor: '#001F54',
padding: 15,
borderRadius: 8,
marginBottom: 15,
alignItems: 'center',
marginHorizontal: 20,
},
buttonText: {
color: '#fff',
fontSize: 16,
fontWeight: '500',
},
footer: {
color: '#000',
fontSize: 16,
fontWeight: '400',
lineHeight: 24,
padding: 20,
},
});

export default Py;
