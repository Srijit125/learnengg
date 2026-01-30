import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'expo-router';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  badge?: number;
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation, state } = props;
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const mainMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Dashboard', icon: 'view-dashboard-outline', route: 'Dashboard' },
    { id: 'quiz', label: 'Quiz', icon: 'clipboard-text-outline', route: 'Quiz' },
    { id: 'performance', label: 'Performance', icon: 'chart-line', route: 'Performance' },
    { id: 'progress', label: 'Progress', icon: 'trending-up', route: 'Progress' },
    { id: 'activity', label: 'Activity', icon: 'history', route: 'Activity' },
  ];

  const insightsMenuItems: MenuItem[] = [
    { id: 'reports', label: 'Reports', icon: 'file-chart-outline', route: 'Reports' },
    { id: 'strengths', label: 'Strengths', icon: 'shield-check-outline', route: 'Strengths' },
    { id: 'weaknesses', label: 'Weaknesses', icon: 'alert-circle-outline', route: 'Weaknesses' },
  ];

  const settingsMenuItems: MenuItem[] = [
    { id: 'preferences', label: 'Preferences', icon: 'cog-outline', route: 'Preferences' },
    { id: 'export', label: 'Export Data', icon: 'download-outline', route: 'Export' },
    { id: 'help', label: 'Help', icon: 'help-circle-outline', route: 'Help' },
  ];

  const handleMenuItemPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const handleLogout = () => {
    setShowLogoutMenu(false);
    logout();
    router.replace('/login');
  };

  const isActive = (routeName: string) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.name === routeName;
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.route);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.menuItem, active && styles.menuItemActive]}
        onPress={() => handleMenuItemPress(item.route)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={active ? '#667eea' : '#64748b'}
          />
        </View>
        <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
          {item.label}
        </Text>
        {item.badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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

        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MAIN MENU</Text>
            <View style={styles.menuList}>
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INSIGHTS</Text>
            <View style={styles.menuList}>
              {insightsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            <View style={styles.menuList}>
              {settingsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>
        </DrawerContentScrollView>

        {/* User Profile Section */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <View style={styles.userProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SW'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Sam Wheeler'}</Text>
              <Text style={styles.userEmail}>{user?.role === 'admin' ? 'Administrator' : 'Student'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => setShowLogoutMenu(!showLogoutMenu)}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Menu */}
        {showLogoutMenu && (
          <>
            <TouchableOpacity 
              style={styles.menuOverlay} 
              activeOpacity={1} 
              onPress={() => setShowLogoutMenu(false)}
            />
            <View style={styles.logoutMenu}>
              <TouchableOpacity 
                style={styles.logoutMenuItem}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
                <Text style={styles.logoutMenuText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </View>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
  scrollContent: {
    paddingBottom: 20,
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
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  logoutMenu: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    zIndex: 11,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
