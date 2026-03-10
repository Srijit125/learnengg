import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSettingsStore } from "../../store/settings.store";

export default function PreferencesPage() {
    const { preferences, setPreference } = useSettingsStore();
    const isDark = preferences.themeMode === 'dark';
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            if (typeof window !== 'undefined') {
                window.alert("Preferences saved successfully!");
            } else {
                Alert.alert("Success", "Preferences saved successfully!");
            }
        }, 500);
    };

    const PreferenceItem = ({ icon, label, description, value, onValueChange, type = "switch" }: any) => (
        <View className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-primary/10 justify-center items-center mr-4">
                <MaterialCommunityIcons name={icon} size={24} color="#6366F1" />
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-text-light dark:text-text-dark">{label}</Text>
                <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{description}</Text>
            </View>
            {type === "switch" && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#E5E7EB", true: "#6366F180" }}
                    thumbColor={value ? "#6366F1" : "#f4f3f4"}
                />
            )}
            {type === "chevron" && (
                <Ionicons name="chevron-forward" size={20} className="text-textSecondary-light dark:text-textSecondary-dark" />
            )}
        </View>
    );

    const bgGradient = (isDark ? ["#0F172A", "#1E293B"] : ["#F8FAFC", "#F1F5F9"]) as readonly [string, string, ...string[]];

    return (
        <View className="flex-1">
            <LinearGradient colors={bgGradient} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                    <View className="mb-8 pt-3">
                        <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark tracking-tight">Preferences</Text>
                        <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Customize your learning experience</Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-widest mb-3 ml-1">Appearance</Text>
                        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-2 shadow-sm border border-border-light dark:border-border-dark">
                            <PreferenceItem
                                icon="weather-night"
                                label="Dark Mode"
                                description="Enable dark theme for better night viewing"
                                value={isDark}
                                onValueChange={(val: boolean) => setPreference('themeMode', val ? "dark" : "light")}
                            />
                            <View className="h-[1px] bg-border-light dark:bg-border-dark mx-4" />
                            <PreferenceItem
                                icon="format-font"
                                label="Font Size"
                                description="Current: Medium"
                                type="chevron"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-widest mb-3 ml-1">Notifications</Text>
                        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-2 shadow-sm border border-border-light dark:border-border-dark">
                            <PreferenceItem
                                icon="bell-outline"
                                label="Push Notifications"
                                description="Get alerts for quizzes and reminders"
                                value={notifications}
                                onValueChange={setNotifications}
                            />
                            <View className="h-[1px] bg-border-light dark:bg-border-dark mx-4" />
                            <PreferenceItem
                                icon="email-outline"
                                label="Email Updates"
                                description="Receive weekly performance summaries"
                                value={emailUpdates}
                                onValueChange={setEmailUpdates}
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-widest mb-3 ml-1">Learning Settings</Text>
                        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-2 shadow-sm border border-border-light dark:border-border-dark">
                            <PreferenceItem
                                icon="play-circle-outline"
                                label="Auto-play Content"
                                description="Automatically start next lesson or video"
                                value={autoPlay}
                                onValueChange={setAutoPlay}
                            />
                            <View className="h-[1px] bg-border-light dark:bg-border-dark mx-4" />
                            <PreferenceItem
                                icon="translate"
                                label="Language"
                                description="Current: English"
                                type="chevron"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`bg-primary py-4 rounded-2xl items-center mt-3 shadow-lg shadow-primary/20 ${saving ? "bg-textSecondary-light dark:bg-textSecondary-dark" : ""}`}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text className="text-white text-base font-bold">
                            {saving ? "Saving..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
