import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects } from '@/hooks';
import { ProspectList, EmptyState } from '@/components/prospects';

const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useThemeContext();
  const {
    activeProspects,
    isLoading,
    refreshProspects,
  } = useProspects();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleProspectPress = useCallback(
    (id: string) => {
      router.push(`/prospect/${id}`);
    },
    [router]
  );

  const handleAddPress = useCallback(() => {
    router.push('/prospect/add');
  }, [router]);

  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Flika</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleAddPress}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Add prospect"
          >
            <Ionicons name="add" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {!isLoading && activeProspects.length === 0 ? (
        <EmptyState onAddPress={handleAddPress} />
      ) : (
        <ProspectList
          prospects={activeProspects}
          onProspectPress={handleProspectPress}
          onRefresh={refreshProspects}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: theme.colors.primary,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerButton: {
      padding: 8,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default HomeScreen;
