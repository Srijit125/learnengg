import React from "react";
import { Dimensions, Text, View } from "react-native";
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
        <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">{Math.round(item.accuracy * 100)}%</Text>
      ),
    })),
    ...strongest.reverse().map((item) => ({
      value: item.accuracy * 100,
      label: item.topic,
      frontColor: "#4caf50", // Strong (Green)
      topLabelComponent: () => (
        <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">{Math.round(item.accuracy * 100)}%</Text>
      ),
    })),
  ];

  return (
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm shadow-[#000]/5 border border-transparent elevation-3 mb-5">
      <Text className="text-base font-bold text-text-light dark:text-text-dark mb-6">{title}</Text>
      <View className="items-center pl-0.5">
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
      <View className="flex-row justify-center gap-5 mt-5">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-[#e45756]" />
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">Needs Attention</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-[#4caf50]" />
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">Better Understood</Text>
        </View>
      </View>
    </View>
  );
};

export default TopicMasteryChart;
