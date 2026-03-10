import React from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

type DonutChartProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  centerLabel?: string;
  centerValue?: string;
};

const DonutChart = ({
  percentage,
  size = 160,
  strokeWidth = 20,
  color = "#667eea",
  backgroundColor = "#e5e7eb",
  centerLabel = "Accuracy",
  centerValue,
}: DonutChartProps) => {
  const value = Math.min(Math.max(percentage, 0), 100);
  const displayValue = centerValue || `${value.toFixed(1)}%`;

  const data = [
    {
      value: value,
      color: color,
    },
    {
      value: 100 - value,
      color: backgroundColor,
    },
  ];

  return (
    <View className="items-center justify-center">
      <PieChart
        data={data}
        donut
        radius={size / 2}
        innerRadius={size / 2 - strokeWidth}
        centerLabelComponent={() => (
          <View className="items-center justify-center">
            <Text className="text-base font-bold text-text-light dark:text-text-dark">{displayValue}</Text>
            <Text className="text-[10px] font-medium text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{centerLabel}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default DonutChart;
