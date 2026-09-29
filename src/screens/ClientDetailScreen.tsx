import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, TextInput } from 'react-native';

const WORKOUT_TYPES = [
  'Hypertrophy (Push/Pull/Legs)',
  'Strength (5x5 Powerlifting)',
  'Endurance (HIIT & Cardio)',
  'Mobility & Yoga',
  'Fat Loss Circuit'
];

const DIET_TYPES = [
  'High Protein / Low Carb',
  'Ketogenic',
  'Intermittent Fasting (16:8)',
  'Balanced Macros (Zone)',
  'Vegan / Plant-Based'
];

export const ClientDetailScreen = ({ route, navigation }: any) => {
  const { client } = route.params;

  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleAssign = (type: string, item: string) => {
    Alert.alert('Success', `${type} assigned: ${item}`);
    setWorkoutModalVisible(false);
    setDietModalVisible(false);
    setCustomText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text style={styles.clientGoal}>Primary Goal: {client.goal}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Recent Metrics</Text>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Weight</Text>
          <Text style={styles.metricValue}>75 kg</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Body Fat</Text>
          <Text style={styles.metricValue}>18%</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => setWorkoutModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Assign Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => setDietModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Assign Diet</Text>
        </TouchableOpacity>
      </View>

      {/* Workout Modal */}
      <Modal visible={workoutModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Workout Program</Text>
            <ScrollView>
              {WORKOUT_TYPES.map(w => (
                <TouchableOpacity key={w} style={styles.modalOption} onPress={() => handleAssign('Workout', w)}>
                  <Text style={styles.modalOptionText}>{w}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.customLabel}>Or enter custom workout:</Text>
              <TextInput style={styles.customInput} placeholder="Custom workout..." value={customText} onChangeText={setCustomText} />
              <TouchableOpacity style={styles.customSubmitBtn} onPress={() => handleAssign('Workout', customText || 'Custom Workout')}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Assign Custom</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setWorkoutModalVisible(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Diet Modal */}
      <Modal visible={dietModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Diet Plan</Text>
            <ScrollView>
              {DIET_TYPES.map(d => (
                <TouchableOpacity key={d} style={styles.modalOption} onPress={() => handleAssign('Diet', d)}>
                  <Text style={styles.modalOptionText}>{d}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.customLabel}>Or enter custom diet:</Text>
              <TextInput style={styles.customInput} placeholder="Custom diet..." value={customText} onChangeText={setCustomText} />
              <TouchableOpacity style={[styles.customSubmitBtn, { backgroundColor: '#10B981' }]} onPress={() => handleAssign('Diet', customText || 'Custom Diet')}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Assign Custom</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDietModalVisible(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  clientName: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  clientGoal: { fontSize: 16, color: '#4B5563' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  metricsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  metricCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginHorizontal: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  metricLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  actionsContainer: { gap: 16 },
  actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1F2937' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionText: { fontSize: 16, color: '#4B5563' },
  customLabel: { marginTop: 20, marginBottom: 8, fontSize: 14, color: '#6B7280' },
  customInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 },
  customSubmitBtn: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  closeModalBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  closeModalText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
