import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Drawer from "expo-router/drawer";
import CustomStudentDrawerContent from "@/components/Dashboard/CustomStudentDrawerContent";
import { useAuthStore } from "@/store/auth.store";

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
          drawerLabel: "Dashboard",
          title: "Analytics Dashboard",
        }}
      />
      <Drawer.Screen
        name="courses"
        options={{
          drawerLabel: "Courses",
          title: "Available Courses",
        }}
      />
      <Drawer.Screen
        name="quiz"
        options={{
          drawerLabel: "Quiz",
          title: "Quiz",
        }}
      />
    </Drawer>
  );
};

export default _layout;

const styles = StyleSheet.create({});
