import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const TrainerDashboard = ({ navigation }: any) => {
  return (
    <View style={[styles.dashboardContainer, { backgroundColor: '#EFF6FF' }]}>
      <Text style={styles.dashboardTitle}>Trainer Dashboard</Text>
      <Text style={styles.dashboardSubtitle}>Manage Clients & Sessions</Text>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => navigation.navigate('ClientList')}
      >
        <Text style={styles.actionButtonText}>View Clients</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, { marginTop: 16 }]} 
        onPress={() => navigation.navigate('QRGenerator')}
      >
        <Text style={styles.actionButtonText}>Generate Session QR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: 200,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
