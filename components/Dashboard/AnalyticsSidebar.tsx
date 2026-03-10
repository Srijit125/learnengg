import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
      className={`flex-row items-center py-3 px-3 rounded-lg gap-3 ${isActive ? 'bg-[#f0f4ff]' : ''}`}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View className={`w-9 h-9 rounded-lg justify-center items-center ${isActive ? 'bg-[#e0e7ff]' : 'bg-background-light dark:bg-background-dark'}`}>
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={isActive ? '#667eea' : '#64748b'}
        />
      </View>
      <Text className={`flex-1 text-sm ${isActive ? 'font-semibold color-[#667eea]' : 'font-medium text-textSecondary-light dark:text-textSecondary-dark'}`}>
        {item.label}
      </Text>
      {item.badge !== undefined && (
        <View className="bg-[#ef4444] rounded-full px-2 py-0.5 min-w-[20px] justify-center items-center">
          <Text className="text-[11px] font-bold color-white">{item.badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="w-[280px] h-full shadow-md shadow-[#000]/5 bg-card-light dark:bg-card-dark z-[4] elevation-4">
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        className="flex-1 border-r border-divider-light dark:border-divider-dark"
      >
        {/* Header */}
        <View className="pt-8 pb-6 px-5 items-center border-b border-border-light dark:border-border-dark">
          <View className="mb-4">
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              className="w-14 h-14 rounded-2xl justify-center items-center shadow-md shadow-[#667eea]/30"
            >
              <MaterialCommunityIcons name="chart-box" size={24} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-0.5">Analytics</Text>
          <Text className="text-[13px] font-medium text-textSecondary-light dark:text-textSecondary-dark">Dashboard</Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Menu Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">MAIN MENU</Text>
            <View className="gap-1">
              {mainMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>

          {/* Insights Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">INSIGHTS</Text>
            <View className="gap-1">
              {insightsMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>

          {/* Settings Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">SETTINGS</Text>
            <View className="gap-1">
              {settingsMenuItems.map((item) =>
                renderMenuItem(item, activeMenuItem === item.id)
              )}
            </View>
          </View>
        </ScrollView>

        {/* User Profile Section */}
        <View className="pt-4 pb-5 px-4">
          <View className="h-[1px] bg-[#e2e8f0] mb-4" />
          <View className="flex-row items-center gap-3 px-2">
            <View className="w-10 h-10 rounded-xl bg-[#667eea] justify-center items-center">
              <Text className="text-sm font-bold color-white">SW</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text-light dark:text-text-dark mb-0.5">Sam Wheeler</Text>
              <Text className="text-xs font-normal text-textSecondary-light dark:text-textSecondary-dark">Student</Text>
            </View>
            <TouchableOpacity className="w-8 h-8 rounded-lg justify-center items-center">
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
