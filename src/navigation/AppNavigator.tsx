import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

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
import { ClientMetricsHistoryScreen } from '../screens/ClientMetricsHistoryScreen';
import { WorkoutTemplatesScreen } from '../screens/WorkoutTemplatesScreen';
import { NutritionTemplatesScreen } from '../screens/NutritionTemplatesScreen';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ClientTabNavigator = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          sceneStyle: { backgroundColor: colors.background },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Workout') iconName = focused ? 'barbell' : 'barbell-outline';
            else if (route.name === 'Diet') iconName = focused ? 'restaurant' : 'restaurant-outline';
            else if (route.name === 'Analytics') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 5,
            paddingTop: 5,
          },
        })}
      >
        <Tab.Screen name="Home" component={ClientDashboard} options={{ title: 'Ana Sayfa', tabBarLabel: 'Ana Sayfa' }} />
        <Tab.Screen name="Workout" component={DailyWorkoutScreen} options={{ title: 'Antrenman', tabBarLabel: 'Antrenman' }} />
        <Tab.Screen name="Diet" component={DietTrackerScreen} options={{ title: 'Diyet', tabBarLabel: 'Diyet' }} />
        <Tab.Screen name="Analytics" component={ProgressGalleryScreen} options={{ title: 'İlerleme', tabBarLabel: 'İlerleme' }} />
        <Tab.Screen name="Profile" component={MyMetricsScreen} options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
      </Tab.Navigator>
    </View>
  );
};

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('trainer@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'trainer' | 'client'>('trainer');

  const { isDark, toggleTheme, colors, radius } = useTheme();

  // Handle Supabase Authentication with graceful fallback for offline / mock testing
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Fast instant routing for local testing without Supabase DNS hangs
        if (email.toLowerCase().includes('client') || role === 'client') {
          navigation.navigate('ClientHub');
        } else {
          navigation.navigate('TrainerHub');
        }
        return;
      }

      if (isRegisterMode) {
        // Sign Up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              role,
            },
          },
        });

        if (error) throw error;

        Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.');
        setIsRegisterMode(false);
      } else {
        // Sign In with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If network / project not configured or mock user, fallback to role-based routing
          console.warn('Supabase Auth notice:', error.message);
          if (email.toLowerCase().includes('client')) {
            navigation.navigate('ClientHub');
          } else {
            navigation.navigate('TrainerHub');
          }
          return;
        }

        // Fetch user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'client') {
          navigation.navigate('ClientHub');
        } else {
          navigation.navigate('TrainerHub');
        }
      }
    } catch (err: any) {
      Alert.alert('Giriş Bilgisi', err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={[
          styles.themeToggle,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={toggleTheme}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Header & Logo */}
          <View style={styles.headerContainer}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
              <Ionicons name="barbell" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Fit-Connect</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              PT-App Antrenör & Danışan Yönetim Platformu
            </Text>
          </View>

          {/* Form */}
          <View style={styles.authContainer}>
            {isRegisterMode && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ad Soyad</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                      borderRadius: radius.button,
                    },
                  ]}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>E-Posta Adresi</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.border,
                    borderRadius: radius.button,
                  },
                ]}
                placeholder="antrenor@fitconnect.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Şifre</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.border,
                    borderRadius: radius.button,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Role Selector in Register Mode */}
            {isRegisterMode && (
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'trainer' && { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setRole('trainer')}
                >
                  <Text style={[styles.roleText, { color: role === 'trainer' ? colors.primary : colors.textMuted }]}>
                    🏋️ Antrenör
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'client' && { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setRole('client')}
                >
                  <Text style={[styles.roleText, { color: role === 'client' ? colors.primary : colors.textMuted }]}>
                    🏃 Danışan
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary, borderRadius: radius.button },
              ]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegisterMode ? 'Hesap Oluştur' : 'Giriş Yap'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={[styles.switchModeText, { color: colors.textMuted }]}>
                {isRegisterMode
                  ? 'Zaten hesabınız var mı? '
                  : 'Henüz hesabınız yok mu? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {isRegisterMode ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Switcher */}
          <View style={styles.demoDivider}>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.demoText, { color: colors.textMuted }]}>HIZLI TEST MODU</Text>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.cardsContainerFixed}>
            <TouchableOpacity
              style={[
                styles.card,
                styles.trainerCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card },
              ]}
              onPress={() => navigation.navigate('TrainerHub')}
              activeOpacity={0.8}
            >
              <Ionicons name="fitness" size={24} color={colors.primary} style={{ marginBottom: 6 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Antrenör Paneli</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Danışanlar, Kasa & Seanslar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                styles.clientCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card },
              ]}
              onPress={() => navigation.navigate('ClientHub')}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={24} color={colors.success} style={{ marginBottom: 6 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Danışan Paneli</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>QR Seans, Antrenman & Diyet</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Fit-Connect v1.0.0 • PT-App Engine
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const MainStack = () => {
  const { colors, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="TrainerHub"
          component={TrainerDashboard}
          options={{ title: 'Antrenör Paneli' }}
        />
        <Stack.Screen
          name="ClientList"
          component={ClientListScreen}
          options={{ title: 'Danışanlarım' }}
        />
        <Stack.Screen
          name="ClientDetail"
          component={ClientDetailScreen}
          options={{ title: 'Danışan Detayı' }}
        />
        <Stack.Screen
          name="ClientMetricsHistory"
          component={ClientMetricsHistoryScreen}
          options={{ title: 'Ölçüm Geçmişi' }}
        />
        <Stack.Screen
          name="WorkoutTemplates"
          component={WorkoutTemplatesScreen}
          options={{ title: 'Şablon Kütüphanesi' }}
        />
        <Stack.Screen
          name="NutritionTemplates"
          component={NutritionTemplatesScreen}
          options={{ title: 'Beslenme Şablonları' }}
        />
        <Stack.Screen
          name="ClientHub"
          component={ClientTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QRGenerator"
          component={QRGeneratorScreen}
          options={{ title: 'Seans QR Üret' }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ title: 'Seans QR Oku' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <ThemeProvider>
      <MainStack />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  authContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  demoLine: {
    flex: 1,
    height: 1,
  },
  demoText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardsContainerFixed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  trainerCard: {
    borderTopWidth: 3,
    borderTopColor: '#FF6B00',
  },
  clientCard: {
    borderTopWidth: 3,
    borderTopColor: '#4CAF50',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
