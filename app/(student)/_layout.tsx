import CustomStudentDrawerContent from "@/components/Dashboard/CustomStudentDrawerContent";
import Drawer from "expo-router/drawer";
import { useColorScheme } from "nativewind";
import React from "react";

const _layout = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Drawer
      drawerContent={(props) => <CustomStudentDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#334155" : "#E2E8F0",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? "#F8FAFC" : "#0F172A",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: isDark ? "#F8FAFC" : "#0F172A",
        },
        drawerActiveTintColor: "#6366F1",
        drawerInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
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
