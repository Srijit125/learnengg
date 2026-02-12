import { StyleSheet, Text, View } from "react-native";
import React from "react";
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
    <View style={styles.container}>
      <PieChart
        data={data}
        donut
        radius={size / 2}
        innerRadius={size / 2 - strokeWidth}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={styles.centerValue}>{displayValue}</Text>
            <Text style={styles.centerText}>{centerLabel}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default DonutChart;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  centerText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
});
