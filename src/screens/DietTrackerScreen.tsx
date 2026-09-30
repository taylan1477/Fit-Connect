import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTodayDisplayDate } from '../utils/date';

interface Meal {
  id: string;
  name: string;
  calories: string;
  uri: string | null;
}
interface LoggedDay {
  id: string;
  meals: Meal[];
}

export const DietTrackerScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [mealPool, setMealPool] = useState<Meal[]>([]);
  const [loggedDays, setLoggedDays] = useState<LoggedDay[]>([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSaveMeal = () => {
    if (!foodName) return Alert.alert('Eksik Bilgi', 'Lütfen yiyecek veya öğün adını girin.');
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: foodName,
      calories: calories || '0 kcal',
      uri: imageUri || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
    };
    setMealPool([newMeal, ...mealPool]);
    setFoodName(''); setCalories(''); setImageUri(null);
  };

  const handleCallItADay = () => {
    const newDay = { id: `Gün ${loggedDays.length + 1}`, meals: [...mealPool] };
    setLoggedDays([newDay, ...loggedDays]);
    setMealPool([]);
  };

  const today = getTodayDisplayDate();

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#064E3B', '#047857'] : ['#0F766E', '#10B981']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.appTitle}>Fit-Connect Pro</Text>
            <Text style={styles.screenTitle}>Beslenme & Diyet Takibi</Text>
            <Text style={styles.dateText}>📅 Bugün - {today}</Text>
          </View>

          {/* Add Meal Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Yeni Öğün Ekle</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.imagePickerBox} onPress={pickImage}>
                {imageUri ? <Image source={{ uri: imageUri }} style={styles.pickedImage} /> : (
                  <><Text style={styles.cameraIcon}>📷</Text><Text style={styles.addPhotoText}>Fotoğraf Ekle</Text></>
                )}
              </TouchableOpacity>
              
              <View style={styles.textInputsContainer}>
                <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F9FAFB', borderColor: colors.border, color: colors.text }]} placeholder="Yiyecek / Öğün Adı" placeholderTextColor={colors.textMuted} value={foodName} onChangeText={setFoodName} />
                <TextInput style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F9FAFB', borderColor: colors.border, color: colors.text }]} placeholder="🔥 Kalori (örn. 350)" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={calories} onChangeText={setCalories} />
              </View>
            </View>
            <TouchableOpacity style={styles.saveMealBtn} onPress={handleSaveMeal}>
              <Text style={styles.saveMealBtnText}>Öğünü Kaydet</Text>
            </TouchableOpacity>
          </View>

          {/* Meal Pool */}
          <View style={styles.poolSection}>
            <Text style={styles.poolLabel}>GÜNLÜK ÖĞÜN HAVUZU</Text>
            <View style={styles.poolHeaderRow}>
              <Text style={[styles.poolTitle, { color: colors.text }]}>Bugün Kaydedilen Öğünler</Text>
              <Text style={styles.poolCount}>{mealPool.length} öğün</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poolScroll}>
              {mealPool.length === 0 ? (
                <View style={[styles.emptyPoolBox, { borderColor: colors.border, backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}><Text style={styles.emptyPoolText}>Henüz kaydedilmiş öğün yok.</Text></View>
              ) : mealPool.map((meal, index) => (
                <View key={meal.id} style={[styles.poolItemCard, { backgroundColor: colors.card }]}>
                  <Image source={{ uri: meal.uri as string }} style={styles.poolItemImage} />
                  <View style={styles.poolItemInfo}>
                    <Text style={styles.poolItemSubtitle}>Öğün {mealPool.length - index}</Text>
                    <Text style={[styles.poolItemName, { color: colors.text }]} numberOfLines={1}>{meal.name}</Text>
                    <Text style={styles.poolItemCalories}>{meal.calories} kcal</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* History */}
          {loggedDays.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyLabel}>GEÇMİŞ</Text>
              <Text style={[styles.poolTitle, { color: colors.text, marginBottom: 12 }]}>Geçmiş Günler</Text>
              {loggedDays.map((day) => (
                <View key={day.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.historyDayTitle, { color: colors.text }]}>{day.id}</Text>
                  <Text style={styles.historySubtitle}>{day.meals.length} Öğün Kaydedildi</Text>
                  <View style={styles.historyImagesRow}>
                    {day.meals.map((m, idx) => (
                      <Image key={idx} source={{ uri: m.uri as string }} style={[styles.historyThumbnail, { left: idx * -15, zIndex: 10 - idx, borderColor: colors.card }]} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomFixedArea}>
          <TouchableOpacity style={[styles.callItADayBtn, mealPool.length === 0 && styles.callItADayBtnDisabled]} disabled={mealPool.length === 0} onPress={handleCallItADay}>
            <Text style={styles.callItADayText}>GÜNÜ TAMAMLA!</Text>
          </TouchableOpacity>
        </View>
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
  card: { borderRadius: 24, padding: 20, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  imagePickerBox: { width: 100, height: 100, borderWidth: 2, borderColor: '#34D399', borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5', overflow: 'hidden' },
  pickedImage: { width: '100%', height: '100%' },
  cameraIcon: { fontSize: 24, marginBottom: 4 },
  addPhotoText: { fontSize: 12, color: '#059669', textAlign: 'center', fontWeight: '600' },
  textInputsContainer: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 46, fontSize: 14 },
  saveMealBtn: { backgroundColor: '#059669', borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  saveMealBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  poolSection: { marginBottom: 20 },
  poolLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  poolHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  poolTitle: { fontSize: 20, fontWeight: 'bold' },
  poolCount: { fontSize: 14, color: '#059669', fontWeight: '600' },
  poolScroll: { paddingVertical: 8 },
  emptyPoolBox: { height: 120, width: 300, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1 },
  emptyPoolText: { color: '#9CA3AF', fontStyle: 'italic' },
  poolItemCard: { width: 140, borderRadius: 16, marginRight: 12, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  poolItemImage: { width: '100%', height: 100, backgroundColor: '#F3F4F6' },
  poolItemInfo: { padding: 12 },
  poolItemSubtitle: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  poolItemName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  poolItemCalories: { fontSize: 12, color: '#059669', fontWeight: '600' },
  historySection: { marginTop: 10, marginBottom: 20 },
  historyLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  historyCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDayTitle: { fontSize: 16, fontWeight: 'bold' },
  historySubtitle: { fontSize: 12, color: '#6B7280' },
  historyImagesRow: { flexDirection: 'row', paddingLeft: 30 },
  historyThumbnail: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, position: 'relative' },
  bottomFixedArea: { padding: 20 },
  callItADayBtn: { backgroundColor: '#10B981', borderRadius: 30, paddingVertical: 18, alignItems: 'center', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, marginBottom: 12 },
  callItADayBtnDisabled: { backgroundColor: '#A7F3D0', shadowOpacity: 0, elevation: 0 },
  callItADayText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
