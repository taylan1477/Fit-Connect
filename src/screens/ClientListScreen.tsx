import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { UserProfile } from '../types';

export const ClientListScreen = ({ navigation }: any) => {
  const { colors, radius, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.warn('Error fetching clients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const filteredClients = clients.filter(c => {
    const nameMatch = (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderClientItem = ({ item }: { item: UserProfile }) => {
    const initials = getInitials(item.full_name);

    return (
      <TouchableOpacity
        style={[
          styles.clientCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.card,
          },
        ]}
        onPress={() => navigation.navigate('ClientDetail', { client: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.clientName, { color: colors.text }]}>
              {item.full_name || 'Danışan'}
            </Text>
            <Text style={[styles.clientGoal, { color: colors.textMuted }]} numberOfLines={1}>
              {item.email || 'Aktif Danışan'}
            </Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            borderRadius: radius.button,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Danışan veya e-posta ara..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Header Count */}
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderTitle, { color: colors.textMuted }]}>
          Kayıtlı Danışanlar ({filteredClients.length})
        </Text>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Danışan bulunamadı</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Arama kriterinize uygun danışan kaydı mevcut değil.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  clientGoal: {
    fontSize: 13,
  },
  cardRight: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
