import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MyMetricsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [metrics, setMetrics] = useState({
    weight: '75', height: '180', gender: 'Male', name: 'John Doe',
    birthDate: new Date('1990-01-01'), bodyFat: '15'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => Alert.alert('Saved', 'Your metrics have been updated.');
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setMetrics({ ...metrics, birthDate: selectedDate });
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
            <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text, borderColor: colors.border }]} value={metrics.name} onChangeText={(t) => setMetrics({...metrics, name: t})} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Gender</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6', borderColor: colors.border }]}>
              <Picker selectedValue={metrics.gender} onValueChange={(v) => setMetrics({...metrics, gender: v})} style={{ color: colors.text }}>
                <Picker.Item label="Male" value="Male" color={isDark ? '#FFF' : '#000'} />
                <Picker.Item label="Female" value="Female" color={isDark ? '#FFF' : '#000'} />
                <Picker.Item label="Other" value="Other" color={isDark ? '#FFF' : '#000'} />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Birth Date</Text>
            <TouchableOpacity style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 16, color: colors.text }}>{metrics.birthDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={metrics.birthDate} mode="date" display="default" onChange={handleDateChange} />
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Body Metrics</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Weight (kg)</Text>
            <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text, borderColor: colors.border }]} value={metrics.weight} keyboardType="numeric" onChangeText={(t) => setMetrics({...metrics, weight: t})} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Height (cm)</Text>
            <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text, borderColor: colors.border }]} value={metrics.height} keyboardType="numeric" onChangeText={(t) => setMetrics({...metrics, height: t})} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Body Fat (%)</Text>
            <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text, borderColor: colors.border }]} value={metrics.bodyFat} keyboardType="numeric" onChangeText={(t) => setMetrics({...metrics, bodyFat: t})} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Metrics</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, justifyContent: 'center' },
  pickerContainer: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  saveButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
