import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDisplayDate } from '../utils/date';

const initialPhotos = [
  { id: '1', date: '2023-10-01', uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=500&q=60' },
  { id: '2', date: '2023-11-01', uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=60' },
];

export const ProgressGalleryScreen = () => {
  const [photos, setPhotos] = useState(initialPhotos);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const newPhoto = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], uri: result.assets[0].uri };
      setPhotos([newPhoto, ...photos]);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>İlerleme Galerisi</Text>
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Text style={styles.addButtonText}>+ Fotoğraf Ekle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.grid}>
          {photos.map(photo => (
            <View key={photo.id} style={[styles.photoCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
              <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDisplayDate(photo.date)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoCard: { width: '48%', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: '100%', height: 150, backgroundColor: '#E5E7EB' },
  dateText: { padding: 12, fontSize: 14, fontWeight: '500', textAlign: 'center' }
});
