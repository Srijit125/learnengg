import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

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
    <View className="flex-1 min-w-[220px] max-w-[280px] h-[160px] m-2.5 rounded-2xl shadow-md">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-2xl p-5 justify-between"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-xl bg-white/20 justify-center items-center">
            <MaterialCommunityIcons name={icon} size={28} color="#ffffff" />
          </View>
          <Text className="flex-1 text-sm font-semibold text-white opacity-95">{title}</Text>
        </View>

        <View className="my-2">
          <Text className="text-4xl font-bold text-white tracking-tighter">
            {value}
            {suffix && <Text className="text-2xl font-semibold opacity-90">{suffix}</Text>}
          </Text>
        </View>

        {trendValue && (
          <View className="flex-row items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-xl self-start">
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={16}
              color={getTrendColor()}
            />
            <Text className="text-[13px] font-semibold" style={{ color: getTrendColor() }}>
              {trendValue}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default StatCard;
