import { getPercentageColor } from '@/utils/chartColors';
import React from 'react';
import { Text, View } from 'react-native';

type ProgressBarItem = {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
};

type HorizontalProgressBarProps = {
  items: ProgressBarItem[];
  height?: number;
  showPercentage?: boolean;
};

const HorizontalProgressBar = ({
  items,
  height = 32,
  showPercentage = true,
}: HorizontalProgressBarProps) => {
  return (
    <View className="w-full gap-4">
      {items.map((item, index) => {
        const maxValue = item.maxValue || 100;
        const percentage = (item.value / maxValue) * 100;
        const barColor = item.color || getPercentageColor(percentage);

        return (
          <View key={index} className="w-full">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-text-light dark:text-text-dark">{item.label}</Text>
              {showPercentage && (
                <Text className="text-[13px] font-medium text-textSecondary-light dark:text-textSecondary-dark">
                  {item.value} {item.maxValue && `/ ${item.maxValue}`}
                </Text>
              )}
            </View>
            <View className="w-full bg-background-light dark:bg-background-dark rounded-lg overflow-hidden" style={{ height }}>
              <View
                className="h-full rounded-lg"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: barColor,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default HorizontalProgressBar;
