import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
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
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartWrapper}>
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
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
        />
      </View>
    </View>
  );
};

export default TrendLineChart;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  yAxisText: {
    fontSize: 11,
    color: '#64748b',
  },
  xAxisText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});
