import { StyleSheet } from "react-native-unistyles";
import { View, Text, TouchableOpacity } from "react-native";
// import ToDoListIcon from './assets/todolisticon.svg';

import React from "react";

export interface StatsButtonProps {
  state: (typeof StatsButtonVariants.state)[number];
  
  onPress?: ()=>void;
}

export const StatsButtonVariants = {
  state: ["Default", "Pressed"],
} as const;

export function StatsButton(props: StatsButtonProps) {
  const { state } = props;
  styles.useVariants({
    state: state!,
  });

  return (
    <TouchableOpacity style={[styles.root]} disabled={state == "Pressed"} onPress={props.onPress}>
      <View style={styles.button}>
        {/* <ToDoListIcon/> */}
        <Text style={styles.label}>{`Stats`}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    width: 112,
    height: 42,
  },
  label: {
    color: "rgba(89, 74, 22, 1)",
    fontFamily: "Cabinet Grotesk Variable",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "700",
  },
  button: {
    variants: {
      state: {
        Default: {
          flexDirection: "row",
          width: 100,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
          rowGap: 2,
          columnGap: 2,
          borderRadius:4,
          borderWidth: 4,
          borderStyle: "solid",
          borderColor: "rgba(89, 74, 22, 1)",
          backgroundColor: "rgba(242, 202, 60, 1)",
          shadowColor: "rgba(89,74,22,1)",
          shadowRadius: 4,
          shadowOffset: {height: 4, width: 4}
        },
        Pressed: {
          flexDirection: "row",
          width: 100,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
          rowGap: 2,
          columnGap: 2,
          borderRadius: 4,
          borderWidth: 4,
          borderStyle: "solid",
          borderColor: "rgba(89, 74, 22, 1)",
          backgroundColor: "rgba(242, 202, 60, 1)",
        },
      },
    },
  },
  buttonStatePressed: {
    backgroundColor: "rgba(191, 160, 47, 1)",
  },
}));
