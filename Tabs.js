import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import VideoScreen from './VideoScreen';
import GamesScreen from './GamesScreen';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          elevation: 0,
          height: 80, // Increased height for better spacing
          backgroundColor: '#FFF', // White background
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Homes"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon
              source={require('./assets/home.png')}
              label="Home"
              focused={focused}
              size={40} // Larger size for Home icon
            />
          ),
        }}
      />

      {/* Games Tab */}
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon
              source={require('./assets/games.png')}
              label="Games"
              focused={focused}
              size={40} // Default size
            />
          ),
        }}
      />

      {/* Videos Tab */}
      <Tab.Screen
        name="Video"
        component={VideoScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon
              source={require('./assets/videos.png')}
              label="Video"
              focused={focused}
              size={40} // Default size
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon
              source={require('./assets/profile.png')}
              label="Profile"
              focused={focused}
              size={40} // Smaller size for Profile icon
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AnimatedIcon = ({ source, label, focused, size }) => {
  const scaleValue = new Animated.Value(focused ? 1.2 : 1);

  // Animation for scaling
  Animated.timing(scaleValue, {
    toValue: focused ? 1.2 : 1,
    duration: 200,
    useNativeDriver: true,
  }).start();

  return (
    <View style={styles.iconContainer}>
      <Animated.Image
        source={source}
        style={[
          styles.icon,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleValue }], // Animated scaling
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: focused ? '#001F54' : '#B0B0B0' }, // Highlight text color on focus
        ]}
        numberOfLines={1} // Ensures text is on a single line
      >
        {label}
      </Text>
  
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70, // Fixed width for alignment
    position: 'relative', // Required for bottom line
  },
  icon: {
    resizeMode: 'contain',
  },
  label: {
    fontSize: 10, // Adjusted font size
    fontWeight: '600',
    marginTop: 4, // Space between icon and text
    textAlign: 'center', // Align label to center
  },
});

export default Tabs;
