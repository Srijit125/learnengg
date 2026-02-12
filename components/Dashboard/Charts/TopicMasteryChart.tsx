import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type TopicStats = {
  topic: string;
  accuracy: number;
  attempts: number;
  improvement_pct_points: number;
};

type TopicMasteryChartProps = {
  data: TopicStats[];
  title?: string;
  topN?: number;
};

const TopicMasteryChart = ({
  data,
  title = "Weak vs Strong Topics",
  topN = 5,
}: TopicMasteryChartProps) => {
  if (!data || data.length === 0) return null;

  // Process data similarly to Streamlit implementation
  const sortedByAccuracy = [...data].sort((a, b) => a.accuracy - b.accuracy);

  const weakest = sortedByAccuracy.slice(0, topN);
  const strongest = [...sortedByAccuracy].reverse().slice(0, topN);

  const chartData = [
    ...weakest.map((item) => ({
      value: item.accuracy * 100,
      label: item.topic,
      frontColor: "#e45756", // Weak (Red)
      topLabelComponent: () => (
        <Text style={styles.barLabel}>{Math.round(item.accuracy * 100)}%</Text>
      ),
    })),
    ...strongest.reverse().map((item) => ({
      value: item.accuracy * 100,
      label: item.topic,
      frontColor: "#4caf50", // Strong (Green)
      topLabelComponent: () => (
        <Text style={styles.barLabel}>{Math.round(item.accuracy * 100)}%</Text>
      ),
    })),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          horizontal={false}
          data={chartData}
          barWidth={22}
          spacing={20}
          noOfSections={4}
          maxValue={100}
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          // showYAxisIndices={false}
          // yAxisTextStyle={styles.yAxisText}
          // xAxisLabelTextStyle={styles.xAxisLabel}
          height={300}
          width={Dimensions.get("window").width * 0.4}
          isAnimated
          animationDuration={1000}
          barBorderRadius={4}
        />
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#e45756" }]} />
          <Text style={styles.legendText}>Needs Attention</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#4caf50" }]} />
          <Text style={styles.legendText}>Strong Topics</Text>
        </View>
      </View>
    </View>
  );
};

export default TopicMasteryChart;

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
    marginBottom: 24,
  },
  chartWrapper: {
    alignItems: "center",
    paddingLeft: 2,
  },
  barLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 2,
  },
  xAxisLabel: {
    fontSize: 11,
    color: "#64748b",
    width: 120,
    textAlign: "right",
    marginRight: 10,
  },
  yAxisText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
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
