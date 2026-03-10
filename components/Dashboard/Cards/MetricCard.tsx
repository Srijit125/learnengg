import React from 'react';
import { Text, View } from 'react-native';

type MetricCardProps = {
  title: string;
  metric: number;
  color?: string;
  suffix?: string;
};

const MetricCard = ({
  title,
  metric,
  color = '#667eea',
  suffix = '',
}: MetricCardProps) => {
  const formatMetric = (value: number) => {
    if (suffix === '%') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  return (
    <View className="flex-1 min-w-[180px] max-w-[220px] h-[140px] bg-card-light dark:bg-card-dark rounded-xl m-2 shadow-sm border border-border-light dark:border-border-dark">
      <View className="flex-1 p-4 justify-between">
        <Text className="text-[13px] font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">{title}</Text>
        <View className="my-2">
          <Text className="text-4xl font-bold tracking-tighter" style={{ color }}>
            {formatMetric(metric)}
            {suffix && <Text className="text-xl font-semibold opacity-80">{suffix}</Text>}
          </Text>
        </View>
        <View className="h-1 rounded-full w-full" style={{ backgroundColor: color }} />
      </View>
    </View>
  );
};

export default MetricCard;