import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

type UnitData = {
  value: number;
  label: string;
  color: string;
};

type UnitProgressChartProps = {
  data: UnitData[];
  title?: string;
};

const UnitProgressChart = ({
  data,
  title = "Progress by Unit",
}: UnitProgressChartProps) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          data={data}
          donut
          showGradient
          sectionAutoFocus
          radius={80}
          innerRadius={55}
          innerCircleColor={"#ffffff"}
          centerLabelComponent={() => {
            return (
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelText}>Units</Text>
              </View>
            );
          }}
        />
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default UnitProgressChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  legendContainer: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
