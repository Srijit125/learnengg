import React from 'react';
import { Text, View } from 'react-native';

type LegendItem = {
  label: string;
  color: string;
};

type ChartLegendProps = {
  items: LegendItem[];
  layout?: 'horizontal' | 'vertical';
};

const ChartLegend = ({ items, layout = 'horizontal' }: ChartLegendProps) => {
  return (
    <View className={`mt-3 ${layout === 'vertical' ? 'flex-col items-start gap-4' : 'flex-row flex-wrap justify-center gap-4'}`}>
      {items.map((item, index) => (
        <View key={index} className="flex-row items-center gap-2">
          <View className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
          <Text className="text-[13px] font-medium text-textSecondary-light dark:text-textSecondary-dark">{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default ChartLegend;
