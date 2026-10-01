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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { UserProfile, Package } from '../types';

interface ClientItemData {
  client: UserProfile;
  package: Package | null;
}

const STATUS_FILTERS = ['Tümü', 'Aktif', 'Az Kaldı', 'Bitti'];

export const ClientListScreen = ({ navigation }: any) => {
  const { colors, radius, getStatusColor } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientData, setClientData] = useState<ClientItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');

  const fetchClients = async () => {
    try {
      const data = await api.getClientsWithPackages();
      setClientData(data);
    } catch (error) {
      console.warn('Error fetching clients with packages:', error);
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

  const filteredClients = clientData.filter(item => {
    const c = item.client;
    const nameMatch = (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    if (!matchesSearch) return false;

    if (activeFilter === 'Tümü') return true;

    const remaining = item.package ? item.package.remaining_sessions : -1;
    if (activeFilter === 'Aktif') return remaining > 3;
    if (activeFilter === 'Az Kaldı') return remaining > 0 && remaining <= 3;
    if (activeFilter === 'Bitti') return remaining === 0;

    return true;
  });

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderClientItem = ({ item }: { item: ClientItemData }) => {
    const { client, package: pkg } = item;
    const initials = getInitials(client.full_name);
    const hasPackage = Boolean(pkg);
    const totalSessions = pkg?.total_sessions || 20;
    const remainingSessions = pkg?.remaining_sessions ?? 0;
    const completedSessions = Math.max(0, totalSessions - remainingSessions);
    const progressPercent = totalSessions > 0 ? Math.min(100, Math.round((completedSessions / totalSessions) * 100)) : 0;
    const statusInfo = hasPackage
      ? getStatusColor(remainingSessions)
      : { color: colors.textMuted, label: 'Paketsiz', bg: 'rgba(158, 158, 158, 0.15)' };

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
        onPress={() => navigation.navigate('ClientDetail', { client })}
        activeOpacity={0.8}
      >
        {/* Top Section: Avatar, Info, Status Badge */}
        <View style={styles.cardTopRow}>
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
                {client.full_name || 'Danışan'}
              </Text>
              <Text style={[styles.clientContact, { color: colors.textMuted }]} numberOfLines={1}>
                {client.phone || client.email}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Bottom Section: Sessions Counter & 6px Linear Progress Bar */}
        {hasPackage ? (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.sessionText, { color: colors.textMuted }]}>
                Kalan: <Text style={{ color: colors.text, fontWeight: '700' }}>{remainingSessions}</Text> / {totalSessions} Seans
              </Text>
              <Text style={[styles.percentText, { color: colors.primary }]}>
                %{progressPercent}
              </Text>
            </View>

            {/* PT-App 6px Linear Progress Bar */}
            <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={styles.noPackageRow}>
            <Text style={[styles.noPackageText, { color: colors.textMuted }]}>
              Aktif seans paketi tanımlanmadı
            </Text>
          </View>
        )}
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
          placeholder="İsim, e-posta veya telefon ile ara..."
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

      {/* Status Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Header Count */}
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderTitle, { color: colors.textMuted }]}>
          Danışanlar ({filteredClients.length})
        </Text>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.client.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Danışan bulunamadı</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              {activeFilter === 'Tümü'
                ? 'Arama kriterinize uygun danışan kaydı mevcut değil.'
                : `"${activeFilter}" durumunda danışan kaydı bulunmuyor.`}
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
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
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
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    marginBottom: 2,
  },
  clientContact: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionText: {
    fontSize: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  noPackageRow: {
    marginTop: 10,
    paddingTop: 8,
  },
  noPackageText: {
    fontSize: 12,
    fontStyle: 'italic',
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
