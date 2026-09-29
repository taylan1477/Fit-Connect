import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export const QRScannerScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    try {
      const payload = JSON.parse(data);
      if (payload.type === 'SESSION_DEDUCT') {
        setScanned(true);
        Alert.alert(
          "Success",
          "Session Deducted!",
          [{ text: "OK", onPress: () => { setScanned(false); navigation.goBack(); } }]
        );
      }
    } catch (e) {
      console.log("Error parsing QR payload", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.subtitle}>Align the QR code within the frame to deduct a session.</Text>
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      </View>
      {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: -40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#10B981',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
});
