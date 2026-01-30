import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
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
          <Text style={styles.topLabel}>
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
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartWrapper}>
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
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
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
  topLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
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
