import { useAuthStore } from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  badge?: number;
};

const CustomStudentDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation, state } = props;
  const { signOut, user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const mainMenuItems: MenuItem[] = [
    { id: "overview", label: "Dashboard", icon: "view-dashboard-outline", route: "index" },
    // { id: "courses", label: "Courses", icon: "book-open-variant", route: "courses" },
    { id: "recommendations", label: "Recommendations", icon: "lightbulb-on-outline", route: "recommendations" },
    { id: "quiz", label: "Quiz", icon: "clipboard-text-outline", route: "quiz" },
    // { id: "performance", label: "Performance", icon: "chart-line", route: "performance" },
    // { id: "progress", label: "Progress", icon: "trending-up", route: "progress" },
    // { id: "search", label: "Search", icon: "magnify", route: "search" },
  ];

  const insightsMenuItems: MenuItem[] = [
    { id: "reports", label: "Reports", icon: "file-chart-outline", route: "reports" },
    { id: "strengths", label: "Strengths", icon: "shield-check-outline", route: "strengths" },
    { id: "weaknesses", label: "Weaknesses", icon: "alert-circle-outline", route: "weaknesses" },
  ];

  const settingsMenuItems: MenuItem[] = [
    { id: "preferences", label: "Preferences", icon: "cog-outline", route: "preferences" },
    { id: "export", label: "Export Data", icon: "download-outline", route: "export" },
    { id: "help", label: "Help", icon: "help-circle-outline", route: "help" },
  ];

  const handleMenuItemPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const handleLogout = () => {
    setShowLogoutMenu(false);
    signOut();
    router.replace("/");
  };

  const isActive = (routeName: string) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.name === routeName;
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.route);

    return (
      <TouchableOpacity
        key={item.id}
        className={`flex-row items-center py-3 px-3 rounded-xl gap-3 ${active ? 'bg-primary/10' : ''}`}
        onPress={() => handleMenuItemPress(item.route)}
        activeOpacity={0.7}
      >
        <View className={`w-9 h-9 rounded-xl justify-center items-center ${active ? 'bg-primary/20' : 'bg-background-light dark:bg-background-dark'}`}>
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={active ? "#6366F1" : (isDark ? "#94A3B8" : "#64748B")}
          />
        </View>
        <Text className={`flex-1 text-sm font-medium ${active ? 'text-primary font-semibold' : 'text-textSecondary-light dark:text-textSecondary-dark'}`}>
          {item.label}
        </Text>
        {item.badge !== undefined && (
          <View className="bg-error rounded-xl px-2 py-0.5 min-w-[20px] justify-center items-center">
            <Text className="text-[11px] font-bold text-white">{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const gradientColors = isDark ? ["#1E293B", "#0F172A"] : ["#FFFFFF", "#F8FAFC"];

  return (
    <View className="flex-1">
      <LinearGradient colors={gradientColors as any} className="flex-1">
        {/* Header */}
        <View className="pt-8 pb-6 px-5 items-center border-b border-border-light dark:border-border-dark">
          <View className="mb-4">
            <LinearGradient
              colors={["#6366F1", "#818CF8"]}
              className="w-14 h-14 rounded-2xl justify-center items-center shadow-lg shadow-primary/30"
            >
              <MaterialCommunityIcons name="chart-box" size={24} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-0.5">Analytics</Text>
          <Text className="text-[13px] font-medium text-textSecondary-light dark:text-textSecondary-dark">Dashboard</Text>
        </View>

        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Menu Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light/50 dark:text-textSecondary-dark/50 tracking-widest mb-3 px-2 uppercase">MAIN MENU</Text>
            <View className="gap-1">
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Insights Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light/50 dark:text-textSecondary-dark/50 tracking-widest mb-3 px-2 uppercase">INSIGHTS</Text>
            <View className="gap-1">
              {insightsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Settings Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light/50 dark:text-textSecondary-dark/50 tracking-widest mb-3 px-2 uppercase">SETTINGS</Text>
            <View className="gap-1">
              {settingsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>
        </DrawerContentScrollView>

        {/* User Profile Section */}
        <View className="pt-4 pb-5 px-4">
          <View className="h-[1px] bg-border-light dark:bg-border-dark mb-4" />
          <View className="flex-row items-center gap-3 px-2">
            <View className="w-10 h-10 rounded-xl bg-primary justify-center items-center">
              <Text className="text-sm font-bold text-white">
                {user?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "SW"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text-light dark:text-text-dark mb-0.5">{user?.full_name}</Text>
              <Text className="text-[12px] font-normal text-textSecondary-light dark:text-textSecondary-dark">
                {user?.role === "admin" ? "Administrator" : "Student"}
              </Text>
            </View>
            <TouchableOpacity
              className="w-8 h-8 rounded-lg justify-center items-center"
              onPress={() => setShowLogoutMenu(!showLogoutMenu)}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Menu */}
        {showLogoutMenu && (
          <View className="absolute bottom-[80px] right-4 bg-card-light dark:bg-card-dark rounded-xl p-2 w-[140px] shadow-xl border border-border-light dark:border-border-dark z-10">
            <TouchableOpacity
              className="flex-row items-center gap-2.5 py-2.5 px-3 rounded-lg"
              onPress={handleLogout}
            >
              <MaterialCommunityIcons
                name="logout"
                size={18}
                color="#EF4444"
              />
              <Text className="text-sm font-semibold text-error">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default CustomStudentDrawerContent;
