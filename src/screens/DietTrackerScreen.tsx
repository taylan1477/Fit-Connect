import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Diet, MealItem } from '../types';
import { getTodayDisplayDate } from '../utils/date';

export const DietTrackerScreen = () => {
  const { colors, isDark, radius } = useTheme();
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientId, setClientId] = useState('1');

  const today = getTodayDisplayDate();

  const loadDiet = useCallback(async () => {
    try {
      setLoading(true);
      let activeClientId = '1';
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) activeClientId = user.id;
      }
      setClientId(activeClientId);

      const latestDiet = await api.getLatestDiet(activeClientId);
      setDiet(latestDiet);
    } catch (error) {
      console.warn('Error loading diet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDiet();
  }, [loadDiet]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDiet();
  };

  const handleToggleMeal = async (index: number) => {
    if (!diet || !diet.meals) return;

    const currentMeal = diet.meals[index];
    const newCompleted = !currentMeal.is_completed;

    // Optimistic UI update
    const updatedMeals = [...diet.meals];
    updatedMeals[index] = { ...currentMeal, is_completed: newCompleted };
    setDiet({ ...diet, meals: updatedMeals });

    try {
      await api.toggleMealCompleted(diet.id, index, newCompleted, currentMeal.photo_uri);
    } catch (error) {
      console.warn('Error toggling meal completion:', error);
      // Revert if error
      loadDiet();
    }
  };

  const handlePickMealPhoto = async (index: number) => {
    if (!diet || !diet.meals) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;

        // Optimistic UI update
        const updatedMeals = [...diet.meals];
        updatedMeals[index] = {
          ...updatedMeals[index],
          photo_uri: photoUri,
          is_completed: true, // auto-mark completed when plate photo is uploaded
        };
        setDiet({ ...diet, meals: updatedMeals });

        await api.toggleMealCompleted(diet.id, index, true, photoUri);
      }
    } catch (error: any) {
      console.warn('Error picking image:', error);
      Alert.alert('Fotoğraf Hatası', 'Fotoğraf seçilirken bir sorun oluştu.');
    }
  };

  // Calculations
  const totalMeals = diet?.meals?.length || 0;
  const completedMeals = diet?.meals?.filter(m => m.is_completed).length || 0;
  const completionPercentage = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Beslenme Takibi</Text>
          <Text style={[styles.headerDate, { color: colors.textMuted }]}>📅 Bugün • {today}</Text>
        </View>
        {diet && (
          <View style={[styles.completionBadge, { backgroundColor: completionPercentage === 100 ? 'rgba(76, 175, 80, 0.15)' : colors.primaryGlow }]}>
            <Ionicons
              name={completionPercentage === 100 ? 'checkmark-circle' : 'restaurant'}
              size={14}
              color={completionPercentage === 100 ? colors.success : colors.primary}
            />
            <Text
              style={[
                styles.completionBadgeText,
                { color: completionPercentage === 100 ? colors.success : colors.primary },
              ]}
            >
              %{completionPercentage}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !diet ? (
          /* Empty State: No Diet Assigned */
          <View style={[styles.restDayCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
            <View style={[styles.restDayIconBadge, { backgroundColor: colors.primaryGlow }]}>
              <Ionicons name="nutrition-outline" size={44} color={colors.primary} />
            </View>
            <Text style={[styles.restDayTitle, { color: colors.text }]}>Aktif Beslenme Planı Yok</Text>
            <Text style={[styles.restDayDesc, { color: colors.textMuted }]}>
              Antrenörünüz henüz bugüne özel bir makro veya saatli beslenme reçetesi tanımlamadı.
            </Text>

            <View style={[styles.tipsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.tipRow}>
                <Ionicons name="water-outline" size={18} color="#3B82F6" />
                <Text style={[styles.tipText, { color: colors.text }]}>Günde en az 3 - 3.5 litre su tüketmeyi unutmayın.</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="barbell-outline" size={18} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.text }]}>Öğünlerinizde temiz protein ve lifli sebzelere öncelik verin.</Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="moon-outline" size={18} color="#8B5CF6" />
                <Text style={[styles.tipText, { color: colors.text }]}>Gece geç saatlerde ağır karbonhidrat tüketiminden kaçının.</Text>
              </View>
            </View>
          </View>
        ) : (
          /* Active Diet View */
          <View>
            {/* Macro Goals Card */}
            <View
              style={[
                styles.macroCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card },
              ]}
            >
              <View style={styles.macroCardHeader}>
                <View>
                  <Text style={[styles.macroCardTitle, { color: colors.text }]}>Günlük Makro Hedefleri</Text>
                  <Text style={[styles.macroCardSubtitle, { color: colors.textMuted }]}>
                    Antrenörünüzün belirlediği günlük besin reçetesi
                  </Text>
                </View>

                <View style={[styles.caloriesBadge, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
                  <Ionicons name="flame" size={18} color="#FF6B00" />
                  <Text style={styles.caloriesBadgeText}>{diet.target_calories} kcal</Text>
                </View>
              </View>

              {/* Macro Pills Row */}
              <View style={styles.macroPillsRow}>
                <View style={[styles.macroPill, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Text style={[styles.macroPillLabel, { color: '#3B82F6' }]}>PROTEİN</Text>
                  <Text style={[styles.macroPillValue, { color: '#3B82F6' }]}>{diet.target_protein_g}g</Text>
                </View>

                <View style={[styles.macroPill, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Text style={[styles.macroPillLabel, { color: '#10B981' }]}>KARB</Text>
                  <Text style={[styles.macroPillValue, { color: '#10B981' }]}>{diet.target_carbs_g}g</Text>
                </View>

                <View style={[styles.macroPill, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Text style={[styles.macroPillLabel, { color: '#F59E0B' }]}>YAĞ</Text>
                  <Text style={[styles.macroPillValue, { color: '#F59E0B' }]}>{diet.target_fat_g}g</Text>
                </View>
              </View>

              {/* Macro Distribution Ratio Bar */}
              {(() => {
                const pCal = (diet.target_protein_g || 0) * 4;
                const cCal = (diet.target_carbs_g || 0) * 4;
                const fCal = (diet.target_fat_g || 0) * 9;
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

              {/* Progress Summary Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    Öğün İlerlemesi: {completedMeals} / {totalMeals} Tamamlandı
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.primary }]}>
                    %{completionPercentage}
                  </Text>
                </View>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${completionPercentage}%`,
                        backgroundColor: completionPercentage === 100 ? colors.success : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Trainer Note Banner */}
              {diet.trainer_notes ? (
                <View style={[styles.noteBanner, { backgroundColor: isDark ? '#1C1917' : '#FFFBEB', borderColor: colors.border }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
                  <Text style={[styles.noteText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>Antrenör Notu: </Text>
                    {diet.trainer_notes}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Scheduled Meals Stream */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              Saatli Öğünler ({totalMeals})
            </Text>

            {diet.meals?.map((meal: MealItem, idx: number) => {
              const isDone = Boolean(meal.is_completed);

              return (
                <View
                  key={idx}
                  style={[
                    styles.mealCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDone ? colors.success : colors.border,
                      borderRadius: radius.card,
                    },
                    isDone && { borderLeftWidth: 4, borderLeftColor: colors.success },
                  ]}
                >
                  {/* Top row: Time + Name + Checkbox */}
                  <View style={styles.mealTopRow}>
                    <View style={styles.mealTitleGroup}>
                      <View style={[styles.timeBadge, { backgroundColor: isDone ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 107, 0, 0.15)' }]}>
                        <Ionicons name="time-outline" size={13} color={isDone ? colors.success : colors.primary} />
                        <Text style={[styles.timeText, { color: isDone ? colors.success : colors.primary }]}>
                          {meal.time || '08:00'}
                        </Text>
                      </View>
                      <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        {
                          backgroundColor: isDone ? colors.success : 'transparent',
                          borderColor: isDone ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => handleToggleMeal(idx)}
                    >
                      {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  </View>

                  {/* Meal description & ingredients */}
                  <Text style={[styles.mealDesc, { color: colors.textMuted }]}>{meal.desc}</Text>

                  {/* Calories badge if present */}
                  {meal.calories ? (
                    <Text style={[styles.mealCalorieTag, { color: colors.primary }]}>
                      🔥 Yaklaşık {meal.calories} kcal
                    </Text>
                  ) : null}

                  {/* Photo area */}
                  {meal.photo_uri ? (
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: meal.photo_uri }} style={styles.uploadedPhoto} />
                      <TouchableOpacity
                        style={[styles.changePhotoBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                        onPress={() => handlePickMealPhoto(idx)}
                      >
                        <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
                        <Text style={styles.changePhotoText}>Değiştir</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.addPhotoBtn, { borderColor: colors.border }]}
                      onPress={() => handlePickMealPhoto(idx)}
                    >
                      <Ionicons name="camera-outline" size={16} color={colors.textMuted} />
                      <Text style={[styles.addPhotoBtnText, { color: colors.textMuted }]}>
                        Öğün Tabağı Fotoğrafı Ekle
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerDate: {
    fontSize: 12,
    marginTop: 2,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  completionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  centered: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDayCard: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    marginTop: 10,
  },
  restDayIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  restDayDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  tipsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 12,
    flex: 1,
  },
  macroCard: {
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  macroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  macroCardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  macroCardSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  caloriesBadgeText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '800',
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  macroPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  macroPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  macroPillValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ratioSegment: {
    height: '100%',
  },
  progressContainer: {
    marginTop: 2,
    marginBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  mealCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  mealTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mealName: {
    fontSize: 15,
    fontWeight: '700',
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  mealCalorieTag: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  addPhotoBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
