import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badge?: number;
};

type AnalyticsSidebarProps = {
  onMenuItemPress?: (itemId: string) => void;
  activeItem?: string;
};

const AnalyticsSidebar = ({
  onMenuItemPress,
  activeItem = 'overview',
}: AnalyticsSidebarProps) => {
  const [activeMenuItem, setActiveMenuItem] = useState(activeItem);

  const mainMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
    { id: 'performance', label: 'Performance', icon: 'chart-line' },
    { id: 'progress', label: 'Progress', icon: 'trending-up' },
    { id: 'activity', label: 'Activity', icon: 'history' },
    { id: 'reports', label: 'Reports', icon: 'file-chart-outline' },
  ];

  const insightsMenuItems: MenuItem[] = [
    { id: 'strengths', label: 'Strengths', icon: 'shield-check-outline' },
    { id: 'weaknesses', label: 'Weaknesses', icon: 'alert-circle-outline' },
    { id: 'recommendations', label: 'Recommendations', icon: 'lightbulb-outline' },
  ];

  const settingsMenuItems: MenuItem[] = [
    { id: 'preferences', label: 'Preferences', icon: 'cog-outline' },
    { id: 'export', label: 'Export Data', icon: 'download-outline' },
    { id: 'help', label: 'Help', icon: 'help-circle-outline' },
  ];

  const handleMenuItemPress = (itemId: string) => {
    setActiveMenuItem(itemId);
    onMenuItemPress?.(itemId);
  };

  const renderMenuItem = (item: MenuItem, isActive: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={isActive ? '#667eea' : '#64748b'}
        />
      </View>
      <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
        {item.label}
      </Text>
      {item.badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="chart-box" size={24} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Dashboard</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MAIN MENU</Text>
            <View style={styles.menuList}>
              {mainMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INSIGHTS</Text>
            <View style={styles.menuList}>
              {insightsMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            <View style={styles.menuList}>
              {settingsMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>
        </ScrollView>

        {/* User Profile Section */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <View style={styles.userProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SW</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Sam Wheeler</Text>
              <Text style={styles.userEmail}>Student</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default AnalyticsSidebar;

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#f0f4ff',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#e0e7ff',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  menuItemTextActive: {
    fontWeight: '600',
    color: '#667eea',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
