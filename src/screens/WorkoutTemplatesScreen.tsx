import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { WorkoutTemplate, WorkoutTemplateExercise, UserProfile } from '../types';

const FOCUS_OPTIONS = ['Hipertrofi', 'Bacak & Kalça', 'Sırt & Kol', 'Güç', 'Definisyon', 'Full Body'];

export const WorkoutTemplatesScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [trainerId, setTrainerId] = useState<string>('trainer-1');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tümü');

  // Modals
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  // Add Template Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFocus, setNewFocus] = useState('Hipertrofi');
  const [newExercises, setNewExercises] = useState<Omit<WorkoutTemplateExercise, 'id' | 'template_id'>[]>([]);
  
  // Assign Form
  const [selectedClientId, setSelectedClientId] = useState('');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let currentTrainerId = 'trainer-1';
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) currentTrainerId = user.id;
      }
      setTrainerId(currentTrainerId);

      const data = await api.getWorkoutTemplates(currentTrainerId);
      setTemplates(data);
      const cls = await api.getClients(currentTrainerId);
      setClients(cls);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Şablonlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = activeFilter === 'Tümü' 
    ? templates 
    : templates.filter(t => t.target_focus === activeFilter);

  const getFocusColor = (focus?: string) => {
    switch (focus) {
      case 'Hipertrofi': return '#8B5CF6'; // Purple
      case 'Bacak & Kalça': return '#EC4899'; // Pink
      case 'Sırt & Kol': return '#3B82F6'; // Blue
      case 'Güç': return '#FF6B00'; // Orange
      case 'Definisyon': return '#10B981'; // Green
      default: return colors.primary;
    }
  };

  const handleAddExercise = () => {
    setNewExercises(prev => [
      ...prev,
      { exercise_name: '', order_index: prev.length + 1, default_sets: 3, default_reps: 10, default_rest_sec: 60 }
    ]);
  };

  const handleUpdateExercise = (index: number, field: keyof WorkoutTemplateExercise, value: any) => {
    setNewExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setNewExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = async () => {
    if (!newTitle) {
      Alert.alert('Uyarı', 'Lütfen şablon başlığı girin.');
      return;
    }
    try {
      setLoading(true);
      await api.createWorkoutTemplate({
        trainer_id: trainerId,
        title: newTitle,
        description: newDesc,
        target_focus: newFocus,
      }, newExercises);
      
      setIsAddModalVisible(false);
      setNewTitle('');
      setNewDesc('');
      setNewExercises([]);
      loadData();
    } catch (error) {
      Alert.alert('Hata', 'Şablon kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    Alert.alert('Emin misiniz?', 'Bu şablonu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await api.deleteWorkoutTemplate(id);
            loadData();
          } catch (error) {
            Alert.alert('Hata', 'Şablon silinemedi.');
            setLoading(false);
          }
        } 
      }
    ]);
  };

  const handleAssignTemplate = async () => {
    if (!selectedTemplate || !selectedClientId) {
      Alert.alert('Uyarı', 'Lütfen danışan seçin.');
      return;
    }
    try {
      setLoading(true);
      await api.assignTemplateToClient(selectedTemplate.id, selectedClientId, assignDate);
      Alert.alert('Başarılı', 'Şablon danışana başarıyla atandı.');
      setIsAssignModalVisible(false);
      setSelectedTemplate(null);
      setSelectedClientId('');
    } catch (error) {
      Alert.alert('Hata', 'Şablon atanamadı.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['Tümü', ...FOCUS_OPTIONS].map(filter => (
            <TouchableOpacity 
              key={filter}
              style={[
                styles.filterChip, 
                { backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0' },
                activeFilter === filter && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText, 
                { color: colors.text },
                activeFilter === filter && { color: '#FFF', fontWeight: 'bold' }
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredTemplates.map(template => (
          <View key={template.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{template.title}</Text>
                {template.target_focus && (
                  <View style={[styles.badge, { backgroundColor: getFocusColor(template.target_focus) }]}>
                    <Text style={styles.badgeText}>{template.target_focus}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDeleteTemplate(template.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {template.description ? (
              <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{template.description}</Text>
            ) : null}

            <View style={styles.exerciseSummary}>
              <Ionicons name="barbell-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.exerciseSummaryText, { color: colors.textMuted }]}>
                {template.exercises?.length || 0} Egzersiz
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.assignBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setSelectedTemplate(template);
                setIsAssignModalVisible(true);
              }}
            >
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
              <Text style={styles.assignBtnText}>Danışana Ata</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Add Template Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAddModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={[styles.modalContent, { backgroundColor: colors.card }]}
              >
                <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#333' : '#E0E0E0' }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Şablon Oluştur</Text>
                  <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                  <Text style={[styles.label, { color: colors.textMuted }]}>Şablon Başlığı</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC' }]}
                    placeholder="Örn: İleri Seviye Göğüs"
                    placeholderTextColor={colors.textMuted}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>Odak (Hedef)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.focusScroll}>
                    {FOCUS_OPTIONS.map(f => (
                      <TouchableOpacity 
                        key={f}
                        style={[
                          styles.focusChip,
                          { backgroundColor: newFocus === f ? colors.primary : (isDark ? '#2A2A2A' : '#E0E0E0') }
                        ]}
                        onPress={() => setNewFocus(f)}
                      >
                        <Text style={[
                          styles.focusChipText,
                          { color: newFocus === f ? '#FFF' : colors.text }
                        ]}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.label, { color: colors.textMuted }]}>Açıklama</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC', height: 80 }]}
                    placeholder="Şablonun detayları..."
                    placeholderTextColor={colors.textMuted}
                    value={newDesc}
                    onChangeText={setNewDesc}
                    multiline
                  />

                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Egzersizler</Text>
                    <TouchableOpacity onPress={handleAddExercise}>
                      <Text style={[styles.addLink, { color: colors.primary }]}>+ Ekle</Text>
                    </TouchableOpacity>
                  </View>

                  {newExercises.map((ex, index) => (
                    <View key={index} style={[styles.exerciseRow, { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5', borderColor: isDark ? '#333' : '#E0E0E0' }]}>
                      <View style={styles.exerciseRowHeader}>
                        <Text style={[styles.exerciseNumber, { color: colors.textMuted }]}>{index + 1}.</Text>
                        <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                          <Ionicons name="close-circle" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC', marginBottom: 10 }]}
                        placeholder="Hareket Adı (örn. Bench Press)"
                        placeholderTextColor={colors.textMuted}
                        value={ex.exercise_name}
                        onChangeText={(t) => handleUpdateExercise(index, 'exercise_name', t)}
                      />
                      <View style={styles.exerciseMetrics}>
                        <View style={styles.metricInputGroup}>
                          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Set</Text>
                          <TextInput
                            style={[styles.input, styles.metricInput, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC' }]}
                            keyboardType="numeric"
                            value={String(ex.default_sets)}
                            onChangeText={(t) => handleUpdateExercise(index, 'default_sets', Number(t) || 0)}
                          />
                        </View>
                        <View style={styles.metricInputGroup}>
                          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Tekrar</Text>
                          <TextInput
                            style={[styles.input, styles.metricInput, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC' }]}
                            keyboardType="numeric"
                            value={String(ex.default_reps)}
                            onChangeText={(t) => handleUpdateExercise(index, 'default_reps', Number(t) || 0)}
                          />
                        </View>
                        <View style={styles.metricInputGroup}>
                          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Dinlenme (sn)</Text>
                          <TextInput
                            style={[styles.input, styles.metricInput, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC' }]}
                            keyboardType="numeric"
                            value={String(ex.default_rest_sec)}
                            onChangeText={(t) => handleUpdateExercise(index, 'default_rest_sec', Number(t) || 0)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <View style={{ height: 40 }} />
                </ScrollView>
                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveTemplate}
                >
                  <Text style={styles.submitBtnText}>Şablonu Kaydet</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Assign to Client Modal */}
      <Modal
        visible={isAssignModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAssignModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.assignModalContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 20 }]}>
                  {selectedTemplate?.title} Şablonunu Ata
                </Text>

                <Text style={[styles.label, { color: colors.textMuted }]}>Danışan Seçin</Text>
                <ScrollView style={styles.clientScroll}>
                  {clients.map(c => (
                    <TouchableOpacity 
                      key={c.id} 
                      style={[
                        styles.clientOption, 
                        { borderColor: selectedClientId === c.id ? colors.primary : (isDark ? '#333' : '#E0E0E0') }
                      ]}
                      onPress={() => setSelectedClientId(c.id)}
                    >
                      <View style={styles.clientOptionHeader}>
                        <Ionicons name="person-circle-outline" size={24} color={selectedClientId === c.id ? colors.primary : colors.textMuted} />
                        <Text style={[styles.clientOptionText, { color: colors.text }]}>{c.full_name}</Text>
                      </View>
                      {selectedClientId === c.id && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.label, { color: colors.textMuted, marginTop: 15 }]}>Tarih (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: isDark ? '#333' : '#CCC', marginBottom: 20 }]}
                  value={assignDate}
                  onChangeText={setAssignDate}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAssignTemplate}
                >
                  <Text style={styles.submitBtnText}>Ata</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  filterWrapper: { paddingVertical: 10, paddingHorizontal: 5 },
  filterScroll: { paddingHorizontal: 15, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 14, fontWeight: '500' },
  content: { padding: 15, paddingBottom: 100, gap: 15 },
  card: { padding: 15, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, flex: 1 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardDesc: { fontSize: 14, marginBottom: 15 },
  exerciseSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
  exerciseSummaryText: { fontSize: 14 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, gap: 8 },
  assignBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  assignModalContent: { backgroundColor: '#1E1E1E', margin: 20, borderRadius: 16, padding: 20, alignSelf: 'center', width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalScroll: { flex: 1 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
  focusScroll: { marginBottom: 15, flexDirection: 'row' },
  focusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8 },
  focusChipText: { fontSize: 14, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addLink: { fontSize: 16, fontWeight: 'bold' },
  exerciseRow: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  exerciseRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  exerciseNumber: { fontWeight: 'bold', fontSize: 14 },
  exerciseMetrics: { flexDirection: 'row', gap: 10 },
  metricInputGroup: { flex: 1 },
  metricLabel: { fontSize: 12, marginBottom: 4 },
  metricInput: { marginBottom: 0, padding: 8, textAlign: 'center' },
  submitBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  clientScroll: { maxHeight: 200, marginBottom: 15 },
  clientOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  clientOptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clientOptionText: { fontSize: 16, fontWeight: '500' },
});
