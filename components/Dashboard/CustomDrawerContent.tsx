import { useAuthStore } from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
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

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation, state } = props;
  const { signOut, user } = useAuthStore();
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  // ... (mainMenuItems, insightsMenuItems, settingsMenuItems)
  const mainMenuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Dashboard",
      icon: "view-dashboard-outline",
      route: "index",
    },
    {
      id: "review",
      label: "AI MCQ Review",
      icon: "clipboard-check-outline",
      route: "review",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "book-open-variant",
      route: "courses",
    },
    {
      id: "course-mcq",
      label: "Course MCQ Management",
      icon: "frequently-asked-questions",
      route: "course-mcq",
    },
    {
      id: "notes-builder",
      label: "Notes Builder",
      icon: "file-document-edit-outline",
      route: "notes/builder",
    },
    {
      id: "notes-editor",
      label: "Notes Editor",
      icon: "file-document-edit",
      route: "notes/editor",
    },
    { id: "activity", label: "Activity", icon: "history", route: "activity" },
  ];

  const insightsMenuItems: MenuItem[] = [
    {
      id: "reports",
      label: "Reports",
      icon: "file-chart-outline",
      route: "reports",
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: "preferences",
      label: "Preferences",
      icon: "cog-outline",
      route: "Preferences",
    },
    {
      id: "export",
      label: "Export Data",
      icon: "download-outline",
      route: "Export",
    },
    { id: "help", label: "Help", icon: "help-circle-outline", route: "Help" },
  ];

  const handleMenuItemPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const handleLogout = async () => {
    setShowLogoutMenu(false);
    await signOut();
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
        className={`flex-row items-center py-3 px-3 rounded-lg gap-3 ${active ? 'bg-[#f0f4ff]' : ''}`}
        onPress={() => handleMenuItemPress(item.route)}
        activeOpacity={0.7}
      >
        <View
          className={`w-9 h-9 rounded-lg justify-center items-center ${active ? 'bg-[#e0e7ff]' : 'bg-background-light dark:bg-background-dark'}`}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={active ? "#667eea" : "#64748b"}
          />
        </View>
        <Text
          className={`flex-1 text-sm ${active ? 'font-semibold color-[#667eea]' : 'font-medium text-textSecondary-light dark:text-textSecondary-dark'}`}
        >
          {item.label}
        </Text>
        {item.badge !== undefined && (
          <View className="bg-[#ef4444] rounded-full px-2 py-0.5 min-w-[20px] justify-center items-center">
            <Text className="text-[11px] font-bold color-white">{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={["#ffffff", "#f8fafc"]} className="flex-1">
        {/* Header */}
        <View className="pt-8 pb-6 px-5 items-center border-b border-border-light dark:border-border-dark">
          <View className="mb-4">
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              className="w-14 h-14 rounded-2xl justify-center items-center shadow-md shadow-[#667eea]/30"
            >
              <MaterialCommunityIcons
                name="chart-box"
                size={24}
                color="#ffffff"
              />
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
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">MAIN MENU</Text>
            <View className="gap-1">
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Insights Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">INSIGHTS</Text>
            <View className="gap-1">
              {insightsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>

          {/* Settings Section */}
          <View className="pt-6 px-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] mb-3 px-2 uppercase">SETTINGS</Text>
            <View className="gap-1">
              {settingsMenuItems.map((item) => renderMenuItem(item))}
            </View>
          </View>
        </DrawerContentScrollView>

        {/* User Profile Section */}
        <View className="pt-4 pb-5 px-4">
          <View className="h-[1px] bg-[#e2e8f0] mb-4" />
          <View className="flex-row items-center gap-3 px-2">
            <View className="w-10 h-10 rounded-xl bg-[#667eea] justify-center items-center">
              <Text className="text-sm font-bold color-white">
                {user?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text-light dark:text-text-dark mb-0.5">{user?.full_name || "User"}</Text>
              <Text className="text-xs font-normal text-textSecondary-light dark:text-textSecondary-dark">
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
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Menu */}
        {showLogoutMenu && (
          <>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              className="bg-transparent z-10"
              activeOpacity={1}
              onPress={() => setShowLogoutMenu(false)}
            />
            <View className="absolute bottom-20 right-4 bg-card-light dark:bg-card-dark rounded-xl p-2 w-[140px] shadow-lg shadow-[#000]/10 border border-border-light dark:border-border-dark z-20">
              <TouchableOpacity
                className="flex-row items-center gap-2.5 py-2.5 px-3 rounded-lg"
                onPress={handleLogout}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={18}
                  color="#ef4444"
                />
                <Text className="text-sm font-semibold color-[#ef4444]">Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </View>
  );
};

export default CustomDrawerContent;
