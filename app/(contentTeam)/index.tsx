import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth.store';

export default function ContentTeamDashboard() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <LinearGradient colors={["#667eea", "#764ba2"]} className="pt-12 pb-8 px-6">
        <Text className="text-white text-3xl font-bold">LCMS Dashboard</Text>
        <Text className="text-white/80 text-sm mt-1">Welcome back, {user?.full_name}</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
          <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Content Team Overview</Text>
          <Text className="text-textSecondary-light dark:text-textSecondary-dark">
            You have access to manage courses, review MCQs, and edit notes. Use the sidebar to navigate between these tools.
          </Text>
        </View>

        {/* Placeholder cards for quick stats or links */}
        <View className="flex-row gap-4 mt-6">
          <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <Text className="text-blue-600 dark:text-blue-400 font-bold">Pending Reviews</Text>
            <Text className="text-2xl font-bold text-blue-900 dark:text-blue-200">12</Text>
          </View>
          <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
            <Text className="text-purple-600 dark:text-purple-400 font-bold">Courses</Text>
            <Text className="text-2xl font-bold text-purple-900 dark:text-purple-200">8</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
