import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DailyWorkoutScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Barbell Squat', sets: '4', reps: '10-12', completed: false },
    { id: 2, name: 'Leg Press', sets: '3', reps: '15', completed: false },
    { id: 3, name: 'Walking Lunges', sets: '3', reps: '20 steps', completed: false },
  ]);

  const toggleComplete = (id: number) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Workout</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Leg Day (Hypertrophy)</Text>
        </View>

        {exercises.map((ex) => (
          <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: colors.card }]}>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: ex.completed ? colors.textMuted : colors.text, textDecorationLine: ex.completed ? 'line-through' : 'none' }]}>{ex.name}</Text>
              <Text style={styles.exerciseDetails}>{ex.sets} sets x {ex.reps}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkbox, ex.completed && styles.checkboxActive]} 
              onPress={() => toggleComplete(ex.id)}
            >
              {ex.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.finishButton}>
          <Text style={styles.finishButtonText}>Complete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  exerciseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 18, fontWeight: 'bold' },
  exerciseDetails: { fontSize: 14, color: '#059669', marginTop: 4, fontWeight: '500' },
  checkbox: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  checkboxActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  finishButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
