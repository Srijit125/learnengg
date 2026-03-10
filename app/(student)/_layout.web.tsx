import ChatbotFAB from "@/components/Chatbot/ChatbotFAB";
import ChatbotWindow from "@/components/Chatbot/ChatbotWindow";
import CustomStudentDrawerContent from "@/components/Dashboard/CustomStudentDrawerContent";
import Drawer from "expo-router/drawer";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { View } from "react-native";

const _layout = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
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
          name="recommendations"
          options={{
            drawerLabel: "Recommendations",
            title: "AI Recommendations",
          }}
        />
        <Drawer.Screen
          name="quiz"
          options={{
            drawerLabel: "Quiz",
            title: "Quiz",
          }}
        />
        <Drawer.Screen
          name="performance"
          options={{
            drawerLabel: "Performance",
            title: "Performance",
          }}
        />
        <Drawer.Screen
          name="progress"
          options={{
            drawerLabel: "Progress",
            title: "Learning Progress",
          }}
        />
        <Drawer.Screen
          name="search"
          options={{
            drawerLabel: "Search",
            title: "Search",
          }}
        />
        <Drawer.Screen
          name="reports"
          options={{
            drawerLabel: "Reports",
            title: "Learning Reports",
          }}
        />
        <Drawer.Screen
          name="weaknesses"
          options={{
            drawerLabel: "Weaknesses",
            title: "Areas to Improve",
          }}
        />
        <Drawer.Screen
          name="strengths"
          options={{
            drawerLabel: "Strengths",
            title: "Your Strengths",
          }}
        />
        <Drawer.Screen
          name="preferences"
          options={{
            drawerLabel: "Preferences",
            title: "Settings & Preferences",
          }}
        />
        <Drawer.Screen
          name="export"
          options={{
            drawerLabel: "Export Data",
            title: "Data Management",
          }}
        />
        <Drawer.Screen
          name="help"
          options={{
            drawerLabel: "Help",
            title: "Help & Support",
          }}
        />
      </Drawer>
      <ChatbotFAB
        onPress={() => setIsChatbotVisible(!isChatbotVisible)}
        isOpen={isChatbotVisible}
      />
      <ChatbotWindow
        isVisible={isChatbotVisible}
        onClose={() => setIsChatbotVisible(false)}
      />
    </View>
  );
};

export default _layout;
