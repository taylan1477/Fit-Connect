import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';

export const QRGeneratorScreen = () => {
  const { colors, radius, isDark } = useTheme();
  const [timestamp, setTimestamp] = useState(Date.now());

  const refreshQR = () => {
    setTimestamp(Date.now());
  };

  const payload = JSON.stringify({
    type: 'SESSION_DEDUCT',
    trainerId: 'trainer-123',
    timestamp,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header & Description */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Seans QR Kodu</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Danışanınız kendi uygulamasından bu QR kodu okuttuğunda paketinden 1 seans otomatik olarak düşülecektir.
          </Text>
        </View>

        {/* QR Code Presentation Card */}
        <View
          style={[
            styles.qrCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.card * 1.5,
              shadowColor: isDark ? '#000000' : '#000000',
            },
          ]}
        >
          {/* Inner clean white surface for barcode contrast readability */}
          <View style={styles.qrInnerFrame}>
            <QRCode
              value={payload}
              size={220}
              backgroundColor="#FFFFFF"
              color="#000000"
            />
          </View>

          <View style={styles.qrMetaContainer}>
            <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.qrStatusText, { color: colors.textMuted }]}>
              Dinamik QR Aktif • Her 15 dk yenilenir
            </Text>
          </View>
        </View>

        {/* Refresh Action */}
        <TouchableOpacity
          style={[
            styles.refreshButton,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.button,
            },
          ]}
          onPress={refreshQR}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.refreshButtonText}>Kodu Yenile</Text>
        </TouchableOpacity>

        {/* Tip Box */}
        <View style={[styles.infoBanner, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            QR kod sahteciliği önlemek için zaman damgalı üretilmektedir.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  qrCard: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 28,
  },
  qrInnerFrame: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  qrMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  qrStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});
