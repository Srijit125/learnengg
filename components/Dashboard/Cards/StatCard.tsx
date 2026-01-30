import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradientColors?: string[];
  suffix?: string;
};

const StatCard = ({
  title,
  value,
  icon = 'chart-line',
  trend = 'neutral',
  trendValue,
  gradientColors = ['#667eea', '#764ba2'],
  suffix = '',
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#6b7280';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={28} color="#ffffff" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {value}
            {suffix && <Text style={styles.suffix}>{suffix}</Text>}
          </Text>
        </View>

        {trendValue && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={16}
              color={getTrendColor()}
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 220,
    maxWidth: 280,
    height: 160,
    margin: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.95,
  },
  valueContainer: {
    marginVertical: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  suffix: {
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.9,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
