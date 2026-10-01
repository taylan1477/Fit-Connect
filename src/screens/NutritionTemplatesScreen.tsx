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
import { NutritionTemplate, MealItem, UserProfile } from '../types';
import { getTodayDisplayDate } from '../utils/date';

const CATEGORY_FILTERS = ['Tümü', 'Definisyon', 'Bulk', 'Keto', 'Dengeli'];

export const NutritionTemplatesScreen = ({ navigation }: any) => {
  const { colors, isDark, radius } = useTheme();
  const [trainerId, setTrainerId] = useState<string>('trainer-1');
  const [templates, setTemplates] = useState<NutritionTemplate[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  // Modals
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NutritionTemplate | null>(null);

  // Add Template Form State
  const [newTitle, setNewTitle] = useState('');
  const [newProtein, setNewProtein] = useState('180');
  const [newCarbs, setNewCarbs] = useState('160');
  const [newFat, setNewFat] = useState('50');
  const [newCalories, setNewCalories] = useState('1810');
  const [autoCalculateCalories, setAutoCalculateCalories] = useState(true);
  const [newMeals, setNewMeals] = useState<MealItem[]>([
    { id: '1', time: '08:30', name: 'Kahvaltı', desc: '4 yumurta beyazı, 1 tam yumurta, 60g yulaf, 1 muz', calories: 480 },
    { id: '2', time: '12:30', name: 'Öğle Yemeği', desc: '200g tavuk göğsü, 150g basmati pirinç, yeşillik', calories: 580 },
    { id: '3', time: '16:00', name: 'Ara Öğün', desc: '1 ölçek Whey protein, 1 elma, 15 badem', calories: 310 },
    { id: '4', time: '19:30', name: 'Akşam Yemeği', desc: '200g somon veya hindi, fırın sebze, 100g patates', calories: 580 },
  ]);

  // Assign Modal State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [assignDate, setAssignDate] = useState(getTodayDisplayDate());
  const [trainerNotes, setTrainerNotes] = useState('Bol su tüketmeyi ve öğün saatlerine uymayı unutma.');

  useEffect(() => {
    loadData();
  }, []);

  // Update calculated calories dynamically when 4-4-9 macros change
  useEffect(() => {
    if (autoCalculateCalories) {
      const p = parseFloat(newProtein) || 0;
      const c = parseFloat(newCarbs) || 0;
      const f = parseFloat(newFat) || 0;
      const calc = Math.round((p * 4) + (c * 4) + (f * 9));
      setNewCalories(calc > 0 ? calc.toString() : '');
    }
  }, [newProtein, newCarbs, newFat, autoCalculateCalories]);

  const loadData = async () => {
    try {
      setLoading(true);
      let currentTrainerId = 'trainer-1';
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) currentTrainerId = user.id;
      }
      setTrainerId(currentTrainerId);

      const data = await api.getNutritionTemplates(currentTrainerId);
      setTemplates(data);
      const cls = await api.getClients(currentTrainerId);
      setClients(cls);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Beslenme şablonları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = activeFilter === 'Tümü'
    ? templates
    : templates.filter(t => {
        const titleLower = t.title.toLowerCase();
        if (activeFilter === 'Definisyon') return titleLower.includes('definisyon') || titleLower.includes('cut');
        if (activeFilter === 'Bulk') return titleLower.includes('bulk') || titleLower.includes('hipertrofi');
        if (activeFilter === 'Keto') return titleLower.includes('keto') || titleLower.includes('low');
        if (activeFilter === 'Dengeli') return titleLower.includes('dengeli') || titleLower.includes('fit');
        return true;
      });

  const handleAddMealRow = () => {
    const nextIndex = newMeals.length + 1;
    setNewMeals([
      ...newMeals,
      {
        id: Date.now().toString(),
        time: '16:00',
        name: `Öğün ${nextIndex}`,
        desc: '',
        calories: 300,
      },
    ]);
  };

  const handleUpdateMealRow = (index: number, field: keyof MealItem, value: any) => {
    const updated = [...newMeals];
    updated[index] = { ...updated[index], [field]: value };
    setNewMeals(updated);
  };

  const handleRemoveMealRow = (index: number) => {
    if (newMeals.length <= 1) {
      Alert.alert('Uyarı', 'En az 1 öğün kalmalıdır.');
      return;
    }
    setNewMeals(newMeals.filter((_, idx) => idx !== index));
  };

  const handleSaveTemplate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen şablon başlığını girin.');
      return;
    }

    try {
      setLoading(true);
      const targetCalories = parseInt(newCalories, 10) || 2000;
      const targetProtein = parseInt(newProtein, 10) || 150;
      const targetCarbs = parseInt(newCarbs, 10) || 200;
      const targetFat = parseInt(newFat, 10) || 60;

      await api.createNutritionTemplate({
        trainer_id: trainerId,
        title: newTitle.trim(),
        target_calories: targetCalories,
        target_protein_g: targetProtein,
        target_carbs_g: targetCarbs,
        target_fat_g: targetFat,
        meals: newMeals,
      });

      setIsAddModalVisible(false);
      setNewTitle('');
      await loadData();
      Alert.alert('Başarılı', 'Beslenme şablonu oluşturuldu.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Hata', error.message || 'Şablon kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template: NutritionTemplate) => {
    Alert.alert(
      'Şablonu Sil',
      `"${template.title}" adlı beslenme şablonunu silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteNutritionTemplate(template.id);
              await loadData();
              Alert.alert('Başarılı', 'Şablon silindi.');
            } catch (error) {
              console.error(error);
              Alert.alert('Hata', 'Şablon silinemedi.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAssignTemplate = async () => {
    if (!selectedClientId) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir danışan seçin.');
      return;
    }
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await api.assignNutritionPlan(selectedClientId, {
        trainer_id: trainerId,
        date: assignDate,
        target_calories: selectedTemplate.target_calories,
        target_protein_g: selectedTemplate.target_protein_g,
        target_carbs_g: selectedTemplate.target_carbs_g,
        target_fat_g: selectedTemplate.target_fat_g,
        meals: selectedTemplate.meals.map(m => ({ ...m, is_completed: false })),
        trainer_notes: trainerNotes.trim() || undefined,
      });

      setIsAssignModalVisible(false);
      setSelectedTemplate(null);
      Alert.alert('Başarılı', `"${selectedTemplate.title}" planı danışana başarıyla atandı.`);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Hata', error.message || 'Plan danışana atanamadı.');
    } finally {
      setLoading(false);
    }
  };

  const calculatedFormulaCalories = Math.round(
    ((parseFloat(newProtein) || 0) * 4) +
    ((parseFloat(newCarbs) || 0) * 4) +
    ((parseFloat(newFat) || 0) * 9)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Beslenme Şablonları</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Diyet & Makro Reçeteleri Kütüphanesi
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Yeni Şablon</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORY_FILTERS.map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#FFFFFF' : colors.textMuted, fontWeight: isActive ? '700' : '500' },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredTemplates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Şablon Bulunamadı</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {activeFilter === 'Tümü'
              ? 'Henüz bir beslenme şablonu oluşturmadınız.'
              : `"${activeFilter}" kategorisinde şablon bulunmuyor.`}
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.emptyBtnText}>İlk Şablonu Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredTemplates.map(template => {
            const isExpanded = expandedTemplateId === template.id;
            const mealsCount = template.meals?.length || 0;
            const totalMealCalories = template.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || template.target_calories;

            return (
              <View
                key={template.id}
                style={[
                  styles.templateCard,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card },
                ]}
              >
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateTitle, { color: colors.text }]}>{template.title}</Text>
                    <View style={styles.calorieRow}>
                      <View style={[styles.badgeCalories, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
                        <Ionicons name="flame" size={14} color="#FF6B00" />
                        <Text style={styles.badgeCaloriesText}>{template.target_calories} kcal</Text>
                      </View>
                      <Text style={[styles.mealsCountText, { color: colors.textMuted }]}>
                        • {mealsCount} Öğün
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={() => handleDeleteTemplate(template)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Macro Badges Grid */}
                <View style={styles.macroBadgesContainer}>
                  <View style={[styles.macroBadge, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                    <Text style={[styles.macroLabel, { color: '#3B82F6' }]}>PROTEİN</Text>
                    <Text style={[styles.macroValue, { color: '#3B82F6' }]}>{template.target_protein_g}g</Text>
                  </View>
                  <View style={[styles.macroBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Text style={[styles.macroLabel, { color: '#10B981' }]}>KARB</Text>
                    <Text style={[styles.macroValue, { color: '#10B981' }]}>{template.target_carbs_g}g</Text>
                  </View>
                  <View style={[styles.macroBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Text style={[styles.macroLabel, { color: '#F59E0B' }]}>YAĞ</Text>
                    <Text style={[styles.macroValue, { color: '#F59E0B' }]}>{template.target_fat_g}g</Text>
                  </View>
                </View>

                {/* Macro Ratio Bar */}
                {(() => {
                  const pCal = (template.target_protein_g || 0) * 4;
                  const cCal = (template.target_carbs_g || 0) * 4;
                  const fCal = (template.target_fat_g || 0) * 9;
                  const total = (pCal + cCal + fCal) || 1;
                  const pPct = Math.round((pCal / total) * 100);
                  const cPct = Math.round((cCal / total) * 100);
                  const fPct = 100 - pPct - cPct;

                  return (
                    <View style={styles.ratioBarContainer}>
                      <View style={[styles.ratioSegment, { flex: pPct, backgroundColor: '#3B82F6' }]} />
                      <View style={[styles.ratioSegment, { flex: cPct, backgroundColor: '#10B981' }]} />
                      <View style={[styles.ratioSegment, { flex: fPct, backgroundColor: '#F59E0B' }]} />
                    </View>
                  );
                })()}

                {/* Expand / Collapse Meals List */}
                {isExpanded && (
                  <View style={[styles.expandedMealsSection, { borderTopColor: colors.border }]}>
                    <Text style={[styles.expandedHeader, { color: colors.text }]}>Öğün Dağılımı ve İçerikler</Text>
                    {template.meals?.map((meal, idx) => (
                      <View key={idx} style={[styles.mealItemRow, { borderBottomColor: colors.border }]}>
                        <View style={styles.mealTimeBadge}>
                          <Ionicons name="time-outline" size={12} color="#FF6B00" />
                          <Text style={styles.mealTimeText}>{meal.time || '08:00'}</Text>
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 8 }}>
                          <Text style={[styles.mealItemName, { color: colors.text }]}>{meal.name}</Text>
                          <Text style={[styles.mealItemDesc, { color: colors.textMuted }]}>{meal.desc}</Text>
                        </View>
                        {meal.calories ? (
                          <Text style={[styles.mealCaloriesBadge, { color: colors.primary }]}>{meal.calories} kcal</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}

                {/* Card Action Footer */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                  >
                    <Text style={[styles.expandText, { color: colors.textMuted }]}>
                      {isExpanded ? 'Detayları Gizle' : `Öğünleri Gör (${mealsCount})`}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.assignButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}
                    onPress={() => {
                      setSelectedTemplate(template);
                      setIsAssignModalVisible(true);
                    }}
                  >
                    <Ionicons name="person-add" size={16} color="#FFFFFF" />
                    <Text style={styles.assignButtonText}>Danışana Ata</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ================= MODAL: YENİ BESLENME ŞABLONU ================= */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Beslenme Şablonu</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  4-4-9 Makro Oranları & Saatli Öğünler
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Template Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Şablon Başlığı *</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                      borderRadius: radius.button,
                    },
                  ]}
                  placeholder="örn. High Protein Definasyon (1950 kcal)"
                  placeholderTextColor={colors.textMuted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              {/* Macro Inputs Row */}
              <Text style={[styles.formLabel, { color: colors.text, marginTop: 4 }]}>Hedef Makrolar (Gramajlar)</Text>
              <View style={styles.macrosInputRow}>
                <View style={styles.macroInputBox}>
                  <Text style={[styles.macroInputLabel, { color: '#3B82F6' }]}>🥩 Protein (g)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: '#3B82F6',
                        color: colors.text,
                        borderRadius: radius.button,
                        textAlign: 'center',
                      },
                    ]}
                    keyboardType="numeric"
                    value={newProtein}
                    onChangeText={setNewProtein}
                  />
                </View>

                <View style={styles.macroInputBox}>
                  <Text style={[styles.macroInputLabel, { color: '#10B981' }]}>🍚 Karb (g)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: '#10B981',
                        color: colors.text,
                        borderRadius: radius.button,
                        textAlign: 'center',
                      },
                    ]}
                    keyboardType="numeric"
                    value={newCarbs}
                    onChangeText={setNewCarbs}
                  />
                </View>

                <View style={styles.macroInputBox}>
                  <Text style={[styles.macroInputLabel, { color: '#F59E0B' }]}>🥑 Yağ (g)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: '#F59E0B',
                        color: colors.text,
                        borderRadius: radius.button,
                        textAlign: 'center',
                      },
                    ]}
                    keyboardType="numeric"
                    value={newFat}
                    onChangeText={setNewFat}
                  />
                </View>
              </View>

              {/* 4-4-9 Formula Live Banner */}
              <View style={[styles.formulaBanner, { backgroundColor: isDark ? '#1C1917' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Ionicons name="calculator-outline" size={18} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.formulaText, { color: colors.text }]}>
                    4-4-9 Formül Önerisi:{' '}
                    <Text style={{ fontWeight: '800', color: colors.primary }}>
                      {calculatedFormulaCalories} kcal
                    </Text>
                  </Text>
                  <Text style={[styles.formulaSubtext, { color: colors.textMuted }]}>
                    (P: {newProtein}g × 4) + (C: {newCarbs}g × 4) + (F: {newFat}g × 9)
                  </Text>
                </View>
              </View>

              {/* Target Calories Input */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Toplam Günlük Kalori (kcal) *</Text>
                  <TouchableOpacity onPress={() => setAutoCalculateCalories(!autoCalculateCalories)}>
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      {autoCalculateCalories ? '✓ Otomatik Hesaplanıyor' : 'Manuel Düzenleme'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                      borderRadius: radius.button,
                    },
                  ]}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor={colors.textMuted}
                  value={newCalories}
                  onChangeText={(val) => {
                    setAutoCalculateCalories(false);
                    setNewCalories(val);
                  }}
                />
              </View>

              {/* Dynamic Meals Builder */}
              <View style={styles.mealsBuilderHeader}>
                <Text style={[styles.formLabel, { color: colors.text, marginBottom: 0 }]}>Saatli Öğünler ({newMeals.length})</Text>
                <TouchableOpacity
                  style={[styles.addMealBtn, { borderColor: colors.primary }]}
                  onPress={handleAddMealRow}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={[styles.addMealBtnText, { color: colors.primary }]}>Öğün Ekle</Text>
                </TouchableOpacity>
              </View>

              {newMeals.map((meal, index) => (
                <View
                  key={index}
                  style={[
                    styles.mealEditCard,
                    { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.button },
                  ]}
                >
                  <View style={styles.mealEditTopRow}>
                    <TextInput
                      style={[
                        styles.mealTimeInput,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      placeholder="08:30"
                      placeholderTextColor={colors.textMuted}
                      value={meal.time}
                      onChangeText={(val) => handleUpdateMealRow(index, 'time', val)}
                    />
                    <TextInput
                      style={[
                        styles.mealNameInput,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      placeholder="Öğün Adı (örn. Kahvaltı)"
                      placeholderTextColor={colors.textMuted}
                      value={meal.name}
                      onChangeText={(val) => handleUpdateMealRow(index, 'name', val)}
                    />
                    <TouchableOpacity
                      style={styles.mealRemoveBtn}
                      onPress={() => handleRemoveMealRow(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[
                      styles.mealDescInput,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="İçerik ve Gramajlar (örn. 4 yumurta beyazı, 60g yulaf, 1 muz)"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={meal.desc}
                    onChangeText={(val) => handleUpdateMealRow(index, 'desc', val)}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Modal Footer Submit */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}
                onPress={handleSaveTemplate}
              >
                <Text style={styles.modalSubmitText}>Şablonu Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL: DANIŞANA ŞABLON ATA ================= */}
      <Modal
        visible={isAssignModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAssignModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.assignModalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Danışana Diyet Ata</Text>
                    <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                      {selectedTemplate?.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.assignBody}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Danışan Seçin *</Text>
                  <ScrollView style={styles.clientPickerList}>
                    {clients.map(c => {
                      const isSelected = selectedClientId === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.clientPickerItem,
                            {
                              backgroundColor: isSelected ? colors.primaryGlow : colors.background,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedClientId(c.id)}
                        >
                          <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isSelected ? colors.primary : colors.textMuted}
                          />
                          <Text
                            style={[
                              styles.clientPickerText,
                              { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '500' },
                            ]}
                          >
                            {c.full_name || c.email}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Başlangıç Tarihi</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border,
                          color: colors.text,
                          borderRadius: radius.button,
                        },
                      ]}
                      value={assignDate}
                      onChangeText={setAssignDate}
                      placeholder="GG-AA-YYYY"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Antrenör Notu</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border,
                          color: colors.text,
                          borderRadius: radius.button,
                          height: 60,
                        },
                      ]}
                      multiline
                      value={trainerNotes}
                      onChangeText={setTrainerNotes}
                      placeholder="Danışan için su, vitamin vb. önerileri..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.assignSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]}
                    onPress={handleAssignTemplate}
                  >
                    <Text style={styles.assignSubmitText}>Planı Danışana Ata</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  templateCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  badgeCalories: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeCaloriesText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  mealsCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroBadgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  macroBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 6,
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ratioSegment: {
    height: '100%',
  },
  expandedMealsSection: {
    borderTopWidth: 1,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  expandedHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mealTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
  },
  mealItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealItemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  mealCaloriesBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  macrosInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  macroInputBox: {
    flex: 1,
  },
  macroInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  formulaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  formulaText: {
    fontSize: 13,
  },
  formulaSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  mealsBuilderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addMealBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mealEditCard: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  mealEditTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mealTimeInput: {
    width: 65,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  mealNameInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
  },
  mealRemoveBtn: {
    padding: 2,
  },
  mealDescInput: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 12,
    minHeight: 45,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  modalSubmitButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  assignModalContainer: {
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  assignBody: {
    padding: 20,
  },
  clientPickerList: {
    maxHeight: 140,
  },
  clientPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  clientPickerText: {
    fontSize: 14,
  },
  assignSubmitBtn: {
    marginTop: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  assignSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
