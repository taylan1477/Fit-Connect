import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const mockClients = [
  { id: '1', name: 'John Doe', goal: 'Weight Loss' },
  { id: '2', name: 'Jane Smith', goal: 'Muscle Gain' },
  { id: '3', name: 'Bob Johnson', goal: 'Endurance' },
];

export const ClientListScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.clientCard} 
      onPress={() => navigation.navigate('ClientDetail', { client: item })}
    >
      <View>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientGoal}>Goal: {item.goal}</Text>
      </View>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockClients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clientGoal: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
  }
});
