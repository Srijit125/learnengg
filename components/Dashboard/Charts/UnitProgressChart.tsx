import React from "react";
import { Text, View } from "react-native";
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
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm shadow-[#000]/5 border border-transparent elevation-3 mb-5">
      <Text className="text-base font-bold text-text-light dark:text-text-dark mb-5">{title}</Text>
      <View className="flex-row items-center justify-around">
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
              <View className="justify-center items-center">
                <Text className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark">Units</Text>
              </View>
            );
          }}
        />
        <View className="gap-2">
          {data.map((item, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default UnitProgressChart;
