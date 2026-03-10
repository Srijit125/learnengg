import React, { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
  height?: number;
};

const ChartCard = ({
  title,
  subtitle,
  children,
  loading = false,
  height = 320,
}: ChartCardProps) => {
  return (
    <View
      className="flex-1 min-w-[320px] bg-card-light dark:bg-card-dark rounded-2xl m-2.5 p-5 shadow-sm border border-border-light dark:border-border-dark"
      style={{ minHeight: height }}
    >
      <View className="mb-5 pb-3 border-b-2 border-border-light dark:border-border-dark">
        <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-1">{title}</Text>
        {subtitle && <Text className="text-[13px] font-normal text-textSecondary-light dark:text-textSecondary-dark">{subtitle}</Text>}
      </View>

      <View className="flex-1 justify-center items-center min-h-[200px]">
        {loading ? (
          <View className="justify-center items-center gap-3">
            <ActivityIndicator size="large" color="#667eea" />
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">Loading chart data...</Text>
          </View>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

export default ChartCard;
