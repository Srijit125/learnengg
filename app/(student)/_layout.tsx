import CustomStudentDrawerContent from "@/components/Dashboard/CustomStudentDrawerContent";
import Drawer from "expo-router/drawer";
import React from "react";
import { StyleSheet } from "react-native";

const _layout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomStudentDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="recommendations"
        options={{
          drawerLabel: "Recommendations",
          title: "AI Recommendations",
        }}
      />
      <Drawer.Screen
        name="quiz/index"
        options={{
          drawerLabel: "Quiz",
          title: "Adaptive Quiz",
        }}
      />
    </Drawer>
  );
};

export default _layout;

const styles = StyleSheet.create({});
