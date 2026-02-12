import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type DataPoint = {
  value: number;
  label: string;
};

type AccuracyTrendChartProps = {
  data: DataPoint[];
  title?: string;
};

const AccuracyTrendChart = ({
  data,
  title = "Accuracy Trend",
}: AccuracyTrendChartProps) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={data}
          height={200}
          width={Dimensions.get("window").width * 0.4}
          initialSpacing={20}
          color="#667eea"
          thickness={3}
          startFillColor="rgba(102, 126, 234, 0.3)"
          endFillColor="rgba(102, 126, 234, 0.01)"
          startOpacity={1}
          endOpacity={0.2}
          noOfSections={4}
          maxValue={100}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#e2e8f0"
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          isAnimated
          animationDuration={1200}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: "lightgray",
            pointerStripWidth: 2,
            pointerColor: "#667eea",
            radius: 6,
            pointerLabelComponent: (items: any) => {
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerLabelText}>
                    {Math.round(items[0].value)}%
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>
    </View>
  );
};

export default AccuracyTrendChart;

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
  },
  axisText: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
  pointerLabel: {
    height: 40,
    width: 60,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pointerLabelText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
