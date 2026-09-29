import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.root}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
