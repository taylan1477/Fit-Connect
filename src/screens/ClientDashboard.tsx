import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ClientDashboard = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#064E3B', '#047857'] : ['#0F766E', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.appTitle}>PT-Connect Pro</Text>
            <Text style={styles.screenTitle}>Home</Text>
            <Text style={styles.dateText}>📅 {today}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>Welcome back, Athlete! 🏃‍♂️</Text>
            <Text style={[styles.summaryText, { color: colors.textMuted }]}>You have 1 workout and 3 meals planned for today. Keep up the great work!</Text>
          </View>

          <View style={[styles.actionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Gym Check-in</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Ready for your session? Scan your trainer's QR code to deduct a session.</Text>
            
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Text style={styles.scanButtonText}>📸 Scan Session QR</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  headerTextContainer: { marginBottom: 24 },
  appTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  screenTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  dateText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  card: { borderRadius: 24, padding: 24, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  summaryText: { fontSize: 16, lineHeight: 24 },
  actionCard: { borderRadius: 24, padding: 24, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, alignItems: 'center', marginBottom: 20 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  actionSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  scanButton: { backgroundColor: '#10B981', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
