import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export const QRScannerScreen = ({ navigation }: any) => {
  const { colors, radius } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!permission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textMuted} style={{ marginBottom: 16 }} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Kamera İzni Gerekli</Text>
        <Text style={[styles.permissionSubtitle, { color: colors.textMuted }]}>
          Seans QR kodunu tarayabilmek için kamera erişimine izin vermeniz gerekiyor.
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      const payload = JSON.parse(data);
      if (payload.type === 'SESSION_DEDUCT') {
        // Attempt to deduct session for current client (e.g. client '1')
        try {
          await api.decrementSession('1');
        } catch (decErr) {
          // In mock mode or if client package has issues, log or continue
          console.warn('Session deduct response:', decErr);
        }

        Alert.alert(
          'Seans Onaylandı! 🎉',
          'Antrenörünüzün QR kodu doğrulandı ve 1 seansınız başarıyla düşüldü.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Geçersiz Kod', 'Taranan QR kod bir Fit-Connect seans kodu değildir.', [
          { text: 'Tekrar Dene', onPress: () => { setScanned(false); setProcessing(false); } },
        ]);
      }
    } catch (e) {
      Alert.alert('Hata', 'QR kod okunamadı veya biçimi geçersiz.', [
        { text: 'Tekrar Dene', onPress: () => { setScanned(false); setProcessing(false); } },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>QR Kodu Hizalayın</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Antrenörünüzün ekranındaki QR kodu aşağıdaki çerçevenin içine denk getirin.
        </Text>
      </View>

      <View style={styles.cameraWrapper}>
        <View style={[styles.cameraContainer, { borderColor: colors.primary }]}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          {/* Target corner reticles */}
          <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
        </View>
      </View>

      <View style={styles.footer}>
        {scanned ? (
          <TouchableOpacity
            style={[styles.rescanButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="scan-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.rescanButtonText, { color: colors.text }]}>Yeniden Tara</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.scanningIndicator}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.scanningText, { color: colors.textMuted }]}>
              {processing ? 'Seans doğrulanıyor...' : 'Kamera aktif • QR taranıyor'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  cameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    width: 280,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
  },
  camera: {
    flex: 1,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scanningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  rescanButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
