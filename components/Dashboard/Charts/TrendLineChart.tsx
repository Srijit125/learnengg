import React from 'react';
import { Text, View } from 'react-native';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';

type TrendLineChartProps = {
  data: lineDataItem[];
  title?: string;
  height?: number;
  color?: string;
  areaChart?: boolean;
  curved?: boolean;
  showDataPoints?: boolean;
};

const TrendLineChart = ({
  data,
  title,
  height = 200,
  color = '#667eea',
  areaChart = false,
  curved = true,
  showDataPoints = true,
}: TrendLineChartProps) => {
  return (
    <View className="w-full">
      {title && <Text className="text-base font-semibold text-text-light dark:text-text-dark mb-4">{title}</Text>}
      <View className="items-center">
        <LineChart
          data={data}
          height={height}
          width={300}
          curved={curved}
          isAnimated
          animationDuration={800}
          color={color}
          thickness={3}
          startFillColor={areaChart ? color : undefined}
          endFillColor={areaChart ? 'rgba(102, 126, 234, 0.1)' : undefined}
          startOpacity={areaChart ? 0.4 : undefined}
          endOpacity={areaChart ? 0.1 : undefined}
          areaChart={areaChart}
          hideDataPoints={!showDataPoints}
          dataPointsColor={color}
          dataPointsRadius={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#e2e8f0"
          hideRules
          noOfSections={4}
          yAxisTextStyle={{ fontSize: 11, color: '#64748b' }}
          xAxisLabelTextStyle={{ fontSize: 12, color: '#64748b', fontWeight: '500' }}
        />
      </View>
    </View>
  );
};

export default TrendLineChart;
