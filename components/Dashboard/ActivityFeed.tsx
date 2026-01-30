import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ActivityItem = {
  id: string;
  difficulty: string;
  correct: boolean;
  timestamp: string;
  topic?: string;
};

type ActivityFeedProps = {
  activities: ActivityItem[];
  maxItems?: number;
};

const ActivityFeed = ({ activities, maxItems = 10 }: ActivityFeedProps) => {
  const displayActivities = activities.slice(0, maxItems);

  const getDifficultyColor = (difficulty: string) => {
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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="history" size={24} color="#1e293b" />
        <Text style={styles.headerTitle}>Recent Activity</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {displayActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={48}
              color="#cbd5e1"
            />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        ) : (
          displayActivities.map((activity, index) => (
            <View key={activity.id || index} style={styles.activityItem}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: activity.correct ? '#10b981' : '#ef4444',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={activity.correct ? 'check' : 'close'}
                  size={16}
                  color="#ffffff"
                />
              </View>

              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>
                    {activity.topic || 'Quiz Attempt'}
                  </Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(activity.difficulty),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {activity.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityTime}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 400,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  activityTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
  },
});
