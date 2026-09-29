import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

import { QRGeneratorScreen } from '../screens/QRGeneratorScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { TrainerDashboard } from '../screens/TrainerDashboard';
import { ClientListScreen } from '../screens/ClientListScreen';
import { ClientDetailScreen } from '../screens/ClientDetailScreen';
import { ClientDashboard } from '../screens/ClientDashboard';
import { MyMetricsScreen } from '../screens/MyMetricsScreen';
import { DailyWorkoutScreen } from '../screens/DailyWorkoutScreen';
import { DietTrackerScreen } from '../screens/DietTrackerScreen';
import { ProgressGalleryScreen } from '../screens/ProgressGalleryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ClientTabNavigator = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Workout') iconName = focused ? 'barbell' : 'barbell-outline';
            else if (route.name === 'Diet') iconName = focused ? 'restaurant' : 'restaurant-outline';
            else if (route.name === 'Analytics') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: isDark ? '#6B7280' : 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 5,
            paddingTop: 5,
          }
        })}
      >
        <Tab.Screen name="Home" component={ClientDashboard} />
        <Tab.Screen name="Workout" component={DailyWorkoutScreen} />
        <Tab.Screen name="Diet" component={DietTrackerScreen} />
        <Tab.Screen name="Analytics" component={ProgressGalleryScreen} />
        <Tab.Screen name="Profile" component={MyMetricsScreen} />
      </Tab.Navigator>
    </View>
  );
};

import { ThemeProvider, useTheme } from '../context/ThemeContext';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = React.useState('trainer@example.com');
  const [password, setPassword] = React.useState('password123');
  const { isDark, toggleTheme, colors } = useTheme();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    
    // Pure Mock Login for Demo
    if (email.toLowerCase().includes('trainer')) {
      navigation.navigate('TrainerHub');
    } else {
      navigation.navigate('ClientHub');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <TouchableOpacity 
        style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: colors.card, borderRadius: 20 }}
        onPress={toggleTheme}
      >
        <Text style={{ fontSize: 16 }}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.logoIcon}>💪</Text>
            <Text style={[styles.title, { color: colors.text }]}>PT-Connect</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to your account</Text>
          </View>
          
          <View style={styles.authContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                placeholder="trainer@example.com" 
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                placeholder="••••••••" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={[styles.loginButton, { backgroundColor: isDark ? '#3B82F6' : '#111827' }]} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoDivider}>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
            <Text style={styles.demoText}>OR DEMO MODE</Text>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.cardsContainerFixed}>
            <TouchableOpacity 
              style={[styles.card, styles.trainerCard, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => navigation.navigate('TrainerHub')}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>Trainer Portal</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, styles.clientCard, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => navigation.navigate('ClientHub')}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>Client Portal</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>v1.0 (MVP) • Engineered by Jarvis Swarm</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const AppNavigator = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TrainerHub" component={TrainerDashboard} options={{ title: 'Trainer Hub', headerStyle: { backgroundColor: '#EFF6FF' }, headerShadowVisible: false }} />
          <Stack.Screen name="ClientList" component={ClientListScreen} options={{ title: 'Client List' }} />
          <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Client Detail' }} />
          
          <Stack.Screen name="ClientHub" component={ClientTabNavigator} options={{ headerShown: false }} />
          
          <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} options={{ title: 'Generate QR' }} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  cardsContainerFixed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  trainerCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6',
  },
  clientCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#10B981',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  authContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  loginButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  demoLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  demoText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  }
});
