import React from 'react';
import { Text, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import ChartLegend from './ChartLegend';

type EnhancedBarChartProps = {
  data: barDataItem[];
  title?: string;
  showLegend?: boolean;
  barWidth?: number;
  height?: number;
  color?: string;
  gradientColor?: string;
  showValues?: boolean;
};

const EnhancedBarChart = ({
  data,
  title,
  showLegend = false,
  barWidth = 50,
  height = 220,
  color = '#667eea',
  gradientColor = '#764ba2',
  showValues = true,
}: EnhancedBarChartProps) => {
  // Add gradient colors to data if not already present
  const enhancedData = data.map((item) => ({
    ...item,
    frontColor: item.frontColor || color,
    gradientColor: item.gradientColor || gradientColor,
    showGradient: true,
    topLabelComponent: showValues
      ? () => (
        <Text className="text-xs font-semibold text-text-light dark:text-text-dark mb-1">
          {item.value}
        </Text>
      )
      : undefined,
  }));

  const legendItems = showLegend
    ? data.map((item) => ({
      label: item.label || '',
      color: String(item.frontColor || color),
    }))
    : [];

  return (
    <View className="w-full">
      {title && <Text className="text-base font-semibold text-text-light dark:text-text-dark mb-4">{title}</Text>}
      <View className="items-center">
        <BarChart
          data={enhancedData}
          barWidth={barWidth}
          height={height}
          isAnimated
          animationDuration={800}
          barBorderRadius={8}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#e2e8f0"
          hideRules
          noOfSections={4}
          yAxisTextStyle={{ fontSize: 11, color: '#64748b' }}
          xAxisLabelTextStyle={{ fontSize: 12, color: '#64748b', fontWeight: '500' }}
          spacing={barWidth + 20}
        />
      </View>
      {showLegend && legendItems.length > 0 && (
        <ChartLegend items={legendItems} />
      )}
    </View>
  );
};

export default EnhancedBarChart;
