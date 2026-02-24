import ChatbotFAB from "@/components/Chatbot/ChatbotFAB";
import ChatbotWindow from "@/components/Chatbot/ChatbotWindow";
import CustomStudentDrawerContent from "@/components/Dashboard/CustomStudentDrawerContent";
import Drawer from "expo-router/drawer";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const _layout = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({});
