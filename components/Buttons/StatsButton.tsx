import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface StatsButtonProps {
  state: (typeof StatsButtonVariants.state)[number];

  onPress?: () => void;
}

export const StatsButtonVariants = {
  state: ["Default", "Pressed"],
} as const;

export function StatsButton(props: StatsButtonProps) {
  const { state } = props;
  const isPressed = state === "Pressed";

  return (
    <TouchableOpacity
      className="w-28 h-10"
      disabled={isPressed}
      onPress={props.onPress}
      activeOpacity={0.7}
    >
      <View
        className={`flex-row w-[100px] h-[30px] justify-center items-center rounded border-4 border-solid border-[#594A16] bg-[#F2CA3C] ${isPressed ? "bg-[#BFA02F]" : ""
          }`}
        style={!isPressed ? { shadowColor: "rgba(89,74,22,1)", shadowOffset: { height: 4, width: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 } : {}}
      >
        <Text className="text-[#594A16] text-base font-bold">Stats</Text>
      </View>
    </TouchableOpacity>
  );
}

