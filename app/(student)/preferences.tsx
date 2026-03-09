import { useSettingsStore } from "@/store/settings.store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function PreferencesPage() {
    const { preferences, setPreference } = useSettingsStore();
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // Simulate an API call if needed, but Zustand-persist already saved it to storage
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
        <View style={styles.preferenceItem}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={icon} size={24} color="#6366f1" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            {type === "switch" && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#e2e8f0", true: "#c7d2fe" }}
                    thumbColor={value ? "#6366f1" : "#f4f3f4"}
                />
            )}
            {type === "chevron" && (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Preferences</Text>
                        <Text style={styles.subtitle}>Customize your learning experience</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Appearance</Text>
                        <View style={styles.card}>
                            <PreferenceItem
                                icon="weather-night"
                                label="Dark Mode"
                                description="Enable dark theme for better night viewing"
                                value={preferences.darkMode}
                                onValueChange={(val: boolean) => setPreference("darkMode", val)}
                            />
                            <View style={styles.divider} />
                            <PreferenceItem
                                icon="format-font"
                                label="Font Size"
                                description={`Current: ${preferences.fontSize}`}
                                type="chevron"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notifications</Text>
                        <View style={styles.card}>
                            <PreferenceItem
                                icon="bell-outline"
                                label="Push Notifications"
                                description="Get alerts for quizzes and reminders"
                                value={preferences.notifications}
                                onValueChange={(val: boolean) => setPreference("notifications", val)}
                            />
                            <View style={styles.divider} />
                            <PreferenceItem
                                icon="email-outline"
                                label="Email Updates"
                                description="Receive weekly performance summaries"
                                value={preferences.emailUpdates}
                                onValueChange={(val: boolean) => setPreference("emailUpdates", val)}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Learning Settings</Text>
                        <View style={styles.card}>
                            <PreferenceItem
                                icon="play-circle-outline"
                                label="Auto-play Content"
                                description="Automatically start next lesson or video"
                                value={preferences.autoPlay}
                                onValueChange={(val: boolean) => setPreference("autoPlay", val)}
                            />
                            <View style={styles.divider} />
                            <PreferenceItem
                                icon="translate"
                                label="Language"
                                description={`Current: ${preferences.language}`}
                                type="chevron"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 40 },
    header: {
        marginBottom: 32,
        paddingTop: 12,
    },
    title: { fontSize: 32, fontWeight: "800", color: "#1e293b", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    preferenceItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f5f3ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    description: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginHorizontal: 16,
    },
    saveBtn: {
        backgroundColor: "#6366f1",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    saveBtnDisabled: {
        backgroundColor: "#94a3b8",
    },
    saveBtnText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
});