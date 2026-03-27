import React, { useState, useRef } from "react";
import { Text, View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CPI_WEIGHTS = [
  { label: "Accuracy", weight: 0.4, color: "#6366f1", icon: "checkmark-circle" as const },
  { label: "Difficulty Mastery", weight: 0.2, color: "#10b981", icon: "trophy" as const },
  { label: "Consistency", weight: 0.2, color: "#f59e0b", icon: "calendar" as const },
  { label: "Speed Score", weight: 0.1, color: "#3b82f6", icon: "speedometer" as const },
  { label: "Improvement", weight: 0.1, color: "#ec4899", icon: "trending-up" as const },
];

type CPITooltipProps = {
  iconSize?: number;
  iconColor?: string;
};

const CPITooltip = ({ iconSize = 16, iconColor = "#94a3b8" }: CPITooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="ml-1.5"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        // @ts-ignore - web-only hover props
        style={{ cursor: "pointer" }}
      >
        <Ionicons name="information-circle-outline" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-card-light dark:bg-card-dark rounded-2xl p-6 mx-6 shadow-xl border border-border-light dark:border-border-dark"
            style={{ maxWidth: 380, width: "90%" }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-text-light dark:text-text-dark">
                How CPI is Calculated
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-4 leading-5">
              Your CPI (Cumulative Performance Index) is a weighted score combining five performance factors:
            </Text>

            <View className="gap-3">
              {CPI_WEIGHTS.map((item) => (
                <View key={item.label} className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-lg justify-center items-center mr-3"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text className="flex-1 text-sm font-semibold text-text-light dark:text-text-dark">
                    {item.label}
                  </Text>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: item.color + "15" }}
                  >
                    <Text className="text-xs font-bold" style={{ color: item.color }}>
                      {(item.weight * 100).toFixed(0)}%
                    </Text>
                  </View>
                  {/* Weight bar */}
                  <View className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 ml-2 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${item.weight * 100}%`, backgroundColor: item.color }}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark leading-4 italic">
                CPI = (Accuracy × 40%) + (Difficulty Mastery × 20%) + (Consistency × 20%) + (Speed Score × 10%) + (Improvement × 10%)
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default CPITooltip;
