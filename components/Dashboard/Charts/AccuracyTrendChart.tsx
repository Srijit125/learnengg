import React from "react";
import { Dimensions, Text, View } from "react-native";
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
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm shadow-[#000]/5 border border-transparent elevation-3 mb-5">
      <Text className="text-base font-bold text-text-light dark:text-text-dark mb-6">{title}</Text>
      <View className="items-center">
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
          yAxisTextStyle={{ fontSize: 10, color: "#94a3b8", fontWeight: "500" }}
          xAxisLabelTextStyle={{ fontSize: 10, color: "#94a3b8", fontWeight: "500" }}
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
                <View className="h-10 w-[60px] bg-[#1e293b] rounded-lg justify-center items-center">
                  <Text className="color-white text-xs font-bold">
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
