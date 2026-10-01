import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { ProgressPhoto } from '../types';
import { formatDisplayDate } from '../utils/date';

export const ProgressGalleryScreen = ({ route, navigation }: any) => {
  const { clientId = '1' } = route.params || {};
  const { colors, radius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'gallery' | 'compare'>('gallery');
  const [selectedPose, setSelectedPose] = useState<'front' | 'side' | 'back'>('front');

  useEffect(() => {
    fetchPhotos();
  }, [clientId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await api.getProgressPhotos(clientId);
      setPhotos(data);
    } catch (e) {
      console.warn(e);
      Alert.alert('Hata', 'Fotoğraflar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        setLoading(true);
        // For demonstration, saving to the 'front' image URL of a new progress record.
        // In a real app, you'd upload this to a storage bucket and show a form for weight/notes.
        const uri = result.assets[0].uri;
        await api.addProgressPhoto({
          client_id: clientId,
          week_label: `Hafta ${photos.length + 1} (Yeni Eklendi)`,
          front_image_url: selectedPose === 'front' ? uri : undefined,
          side_image_url: selectedPose === 'side' ? uri : undefined,
          back_image_url: selectedPose === 'back' ? uri : undefined,
          weight_kg: 80.0,
          notes: 'Yeni eklenen görsel',
        });
        await fetchPhotos();
      } catch (e) {
        Alert.alert('Hata', 'Fotoğraf kaydedilemedi.');
        setLoading(false);
      }
    }
  };

  const renderGallery = () => {
    if (photos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz fotoğraf bulunmuyor.</Text>
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {photos.map((photo) => {
          let uri = photo.front_image_url;
          if (selectedPose === 'side') uri = photo.side_image_url || photo.front_image_url;
          if (selectedPose === 'back') uri = photo.back_image_url || photo.front_image_url;

          return (
            <View key={photo.id} style={[styles.photoCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
              {uri ? (
                <Image source={{ uri }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.noImageContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="image-outline" size={32} color={colors.border} />
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={[styles.weekLabel, { color: colors.text }]} numberOfLines={1}>
                  {photo.week_label}
                </Text>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  {formatDisplayDate(photo.created_at)}
                </Text>
                {photo.weight_kg && (
                  <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{photo.weight_kg} kg</Text>
                  </View>
                )}
                {photo.notes && (
                  <Text style={[styles.notesText, { color: colors.textMuted }]} numberOfLines={2}>
                    {photo.notes}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderCompare = () => {
    if (photos.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="git-compare-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Kıyaslama yapmak için en az 2 fotoğraf eklenmiş olmalı.
          </Text>
        </View>
      );
    }

    // Default compare first and last
    const firstPhoto = photos[photos.length - 1]; // oldest
    const lastPhoto = photos[0]; // newest

    const getUri = (p: ProgressPhoto) => {
      if (selectedPose === 'side') return p.side_image_url || p.front_image_url;
      if (selectedPose === 'back') return p.back_image_url || p.front_image_url;
      return p.front_image_url;
    };

    return (
      <View style={styles.compareContainer}>
        <View style={styles.compareHeader}>
          <Text style={[styles.compareTitle, { color: colors.text }]}>Öncesi / Sonrası</Text>
        </View>
        <View style={styles.compareRow}>
          {/* Before */}
          <View style={[styles.compareCard, { backgroundColor: colors.card }]}>
            <View style={styles.compareLabelBadge}>
              <Text style={styles.compareLabelText}>ÖNCESİ</Text>
            </View>
            {getUri(firstPhoto) ? (
              <Image source={{ uri: getUri(firstPhoto) }} style={styles.compareImage} />
            ) : (
              <View style={[styles.compareImage, styles.noImageContainer, { backgroundColor: colors.background }]} />
            )}
            <View style={styles.compareInfo}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDisplayDate(firstPhoto.created_at)}</Text>
              {firstPhoto.weight_kg && (
                <Text style={[styles.compareWeight, { color: colors.text }]}>{firstPhoto.weight_kg} kg</Text>
              )}
            </View>
          </View>

          <View style={styles.compareDivider}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>

          {/* After */}
          <View style={[styles.compareCard, { backgroundColor: colors.card }]}>
            <View style={[styles.compareLabelBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.compareLabelText}>SONRASI</Text>
            </View>
            {getUri(lastPhoto) ? (
              <Image source={{ uri: getUri(lastPhoto) }} style={styles.compareImage} />
            ) : (
              <View style={[styles.compareImage, styles.noImageContainer, { backgroundColor: colors.background }]} />
            )}
            <View style={styles.compareInfo}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDisplayDate(lastPhoto.created_at)}</Text>
              {lastPhoto.weight_kg && (
                <Text style={[styles.compareWeight, { color: colors.text }]}>{lastPhoto.weight_kg} kg</Text>
              )}
            </View>
          </View>
        </View>

        {firstPhoto.weight_kg && lastPhoto.weight_kg && (
          <View style={[styles.summaryBox, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="trending-down" size={24} color={colors.success} style={{ marginRight: 12 }} />
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Toplam Değişim: <Text style={{ color: colors.success, fontWeight: '700' }}>
                {(firstPhoto.weight_kg - lastPhoto.weight_kg).toFixed(1)} kg
              </Text> azaldı.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gelişim Galerisi</Text>
        <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'gallery' && [styles.activeTab, { backgroundColor: colors.primary }]]}
          onPress={() => setViewMode('gallery')}
        >
          <Ionicons name="grid-outline" size={18} color={viewMode === 'gallery' ? '#fff' : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, { color: viewMode === 'gallery' ? '#fff' : colors.textMuted }]}>Galeri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'compare' && [styles.activeTab, { backgroundColor: colors.primary }]]}
          onPress={() => setViewMode('compare')}
        >
          <Ionicons name="git-compare-outline" size={18} color={viewMode === 'compare' ? '#fff' : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, { color: viewMode === 'compare' ? '#fff' : colors.textMuted }]}>Kıyasla</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.poseFilter}>
        {['front', 'side', 'back'].map((pose) => (
          <TouchableOpacity
            key={pose}
            style={[
              styles.posePill,
              { backgroundColor: selectedPose === pose ? colors.primary + '20' : colors.card },
              selectedPose === pose && { borderColor: colors.primary, borderWidth: 1 }
            ]}
            onPress={() => setSelectedPose(pose as any)}
          >
            <Text style={[
              styles.posePillText,
              { color: selectedPose === pose ? colors.primary : colors.textMuted }
            ]}>
              {pose === 'front' ? 'Ön Poz' : pose === 'side' ? 'Yan Poz' : 'Arka Poz'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          {viewMode === 'gallery' ? renderGallery() : renderCompare()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  addButton: { padding: 4 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  activeTab: {},
  tabText: { fontSize: 14, fontWeight: '600' },
  poseFilter: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  posePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  posePillText: { fontSize: 13, fontWeight: '600' },
  scrollContainer: { flex: 1, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '500' },
  
  // Gallery
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoCard: { width: '48%', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  image: { width: '100%', height: 200 },
  noImageContainer: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 12 },
  weekLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  dateText: { fontSize: 12, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  notesText: { fontSize: 11, fontStyle: 'italic', lineHeight: 16 },

  // Compare
  compareContainer: { alignItems: 'center', paddingVertical: 10 },
  compareHeader: { marginBottom: 20 },
  compareTitle: { fontSize: 18, fontWeight: '700' },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  compareCard: { width: '45%', borderRadius: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, position: 'relative' },
  compareLabelBadge: { position: 'absolute', top: 8, left: 8, zIndex: 10, backgroundColor: '#4B5563', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  compareLabelText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  compareImage: { width: '100%', height: 220 },
  compareInfo: { padding: 12, alignItems: 'center' },
  compareWeight: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  compareDivider: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  summaryBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, width: '100%' },
  summaryText: { fontSize: 14, fontWeight: '600' }
});
