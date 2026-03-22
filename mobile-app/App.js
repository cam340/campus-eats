import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, Animated, Easing, TouchableOpacity, Image, Dimensions } from 'react-native';

// Import Screens
import StudentDashboard from './src/screens/StudentDashboard';
import RiderDashboard from './src/screens/RiderDashboard';
import ChatScreen from './src/screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');

// Custom Landing Page with Animations
function LandingScreen({ onSelectRole }) {
    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    
    // Floating orange accent circle
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance Animation
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
        ]).start();

        // Continuous floating animation for background accents
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: 15, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Background Decorations */}
            <View style={styles.bgGreenBlob} />
            <Animated.View style={[styles.bgOrangeBlob, { transform: [{ translateY: floatAnim }] }]} />

            <Animated.View style={[styles.heroContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
                {/* Image */}
                <Image source={require('./assets/hero.png')} style={styles.heroImage} />
                
                <View style={styles.contentOverlay}>
                    <Text style={styles.title}>Campus<Text style={styles.titleAccent}>Eats</Text></Text>
                    <Text style={styles.subtitle}>Fresh food delivered straight to your hall, lightning fast.</Text>
                    
                    <View style={styles.btnGroup}>
                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => onSelectRole('student')} activeOpacity={0.8}>
                            <Text style={styles.btnTextPrimary}>I'm Hungry (Student)</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => onSelectRole('rider')} activeOpacity={0.8}>
                            <Text style={styles.btnTextSecondary}>I want to Deliver (Rider)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

// Main App component
export default function App() {
  const [role, setRole] = useState(null); // 'student' or 'rider'

  if (!role) {
    return <LandingScreen onSelectRole={setRole} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
        {role === 'student' ? (
          <Stack.Screen name="StudentRoot" component={StudentTabs} />
        ) : (
          <Stack.Screen name="RiderRoot" component={RiderTabs} />
        )}
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Live Chat', headerTintColor: '#059669' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder for Navigation
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#059669', tabBarStyle: { backgroundColor: '#ffffff' } }}>
      <Tab.Screen name="Order Food" component={StudentDashboard} options={{ headerTitleStyle: { color: '#059669' } }} />
    </Tab.Navigator>
  );
}

function RiderTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#059669', tabBarStyle: { backgroundColor: '#ffffff' } }}>
      <Tab.Screen name="Deliveries" component={RiderDashboard} options={{ headerTitleStyle: { color: '#059669' } }} />
    </Tab.Navigator>
  );
}

// Styling Theme: Bold Green, White, Subtle Light Orange
const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#ffffff', 
      justifyContent: 'center', 
      alignItems: 'center',
      overflow: 'hidden'
  },
  bgGreenBlob: {
      position: 'absolute',
      width: width * 1.5,
      height: width * 1.5,
      borderRadius: width,
      backgroundColor: 'rgba(5, 150, 105, 0.04)', // extremely subtle green background
      top: -height * 0.2,
      left: -width * 0.5,
  },
  bgOrangeBlob: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: 'rgba(253, 186, 116, 0.15)', // subtle light orange accent
      bottom: height * 0.1,
      right: -100,
  },
  heroContainer: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 30,
      overflow: 'hidden',
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.1,
      shadowRadius: 30,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(5, 150, 105, 0.1)'
  },
  heroImage: {
      width: '100%',
      height: 250,
      resizeMode: 'cover',
  },
  contentOverlay: {
      padding: 30,
      alignItems: 'center',
  },
  title: { 
      fontSize: 36, 
      fontWeight: '900', 
      color: '#059669', // Bold Green
      marginBottom: 10,
      letterSpacing: -1,
  },
  titleAccent: {
      color: '#fb923c' // Light Orange accent in title
  },
  subtitle: { 
      fontSize: 15, 
      color: '#64748b', 
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 35,
      paddingHorizontal: 10
  },
  btnGroup: { 
      width: '100%',
      gap: 15
  },
  btn: {
      width: '100%',
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
  },
  btnPrimary: {
      backgroundColor: '#059669', // Bold Green button
  },
  btnSecondary: {
      backgroundColor: '#ffffff', // White button
      borderWidth: 2,
      borderColor: '#059669',
  },
  btnTextPrimary: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5
  },
  btnTextSecondary: {
      color: '#059669',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5
  }
});
