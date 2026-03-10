import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

type ActivityItem = {
  id: string;
  difficulty?: string;
  correct?: boolean;
  timestamp: string;
  topic?: string;
};

type ActivityFeedProps = {
  activities: ActivityItem[];
  maxItems?: number;
};

const ActivityFeed = ({ activities, maxItems = 10 }: ActivityFeedProps) => {
  const displayActivities = activities.slice(0, maxItems);

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return '#6b7280';
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins || 0}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <View className="flex-1 bg-card-light dark:bg-card-dark rounded-2xl p-5 m-2.5 shadow-md shadow-[#000]/10 border border-border-light dark:border-border-dark min-h-[400px] max-h-[500px] elevation-4">
      <View className="flex-row items-center gap-3 mb-5 pb-3 border-b-2 border-b-[#f1f5f9]">
        <MaterialCommunityIcons name="history" size={24} color="#1e293b" />
        <Text className="text-lg font-bold text-text-light dark:text-text-dark">Recent Activity</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {displayActivities.length === 0 ? (
          <View className="justify-center items-center py-15">
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={48}
              color="#cbd5e1"
            />
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3 font-medium">No recent activity</Text>
          </View>
        ) : (
          displayActivities.map((activity, index) => (
            <View key={activity.id || index} className="flex-row items-start gap-3 py-3 border-b border-b-[#f1f5f9]">
              <View
                className="w-8 h-8 rounded-full justify-center items-center mt-0.5"
                style={{
                  backgroundColor: activity.correct === true ? '#10b981' :
                    activity.correct === false ? '#ef4444' : '#64748b',
                }}
              >
                <MaterialCommunityIcons
                  name={activity.correct === true ? 'check' :
                    activity.correct === false ? 'close' : 'circle-outline'}
                  size={16}
                  color="#ffffff"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[15px] font-semibold text-text-light dark:text-text-dark flex-1">
                    {activity.topic || 'Activity'}
                  </Text>
                  {/* {activity.difficulty && (
                    <View
                      className="px-2.5 py-1 rounded-3xl"
                      style={{
                        backgroundColor: getDifficultyColor(activity.difficulty),
                      }}
                    >
                      <Text className="text-[11px] font-bold color-white uppercase">
                        {activity.difficulty}
                      </Text>
                    </View>
                  )} */}
                </View>
                <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-normal">
                  {formatTimestamp(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ActivityFeed;
