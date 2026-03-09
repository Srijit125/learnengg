import { getUserCPI, getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { downloadCSV } from "@/utils/csvExport";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function ExportDataPage() {
    const { user } = useAuthStore();
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type: "full" | "summary") => {
        if (!user?.id) return;
        setExporting(true);
        try {
            const logsData = await getUserLogsData(user.id);
            const cpiData = await getUserCPI(user.id);

            if (type === "full") {
                const reportData = logsData.map(log => ({
                    Date: new Date(log.timestamp).toLocaleString(),
                    Chapter: log.reference?.Chapter || "General Concepts",
                    Section: log.reference?.Section || "N/A",
                    Difficulty: log.difficulty,
                    Question: log.question,
                    "User Answer": log.user_answer,
                    Correct: log.correct ? "Yes" : "No"
                }));
                downloadCSV(reportData, `${user.full_name}_Detailed_Activity`);
            } else {
                // Topic summary
                const counts: Record<string, { correct: number, total: number }> = {};
                logsData.forEach((log: any) => {
                    const chapter = log.reference?.Chapter || "General Concepts";
                    if (!counts[chapter]) counts[chapter] = { correct: 0, total: 0 };
                    counts[chapter].total++;
                    if (log.correct) counts[chapter].correct++;
                });

                const summaryData = Object.entries(counts).map(([name, stat]) => ({
                    Chapter: name,
                    "Total Questions": stat.total,
                    "Correct Answers": stat.correct,
                    Accuracy: `${((stat.correct / stat.total) * 100).toFixed(1)}%`
                }));

                // Add overall stats
                summaryData.push({
                    Chapter: "OVERALL",
                    "Total Questions": logsData.length,
                    "Correct Answers": logsData.filter(l => l.correct).length,
                    Accuracy: `${((logsData.filter(l => l.correct).length / logsData.length) * 100).toFixed(1)}%`
                } as any);

                downloadCSV(summaryData, `${user.full_name}_Performance_Summary`);
            }
        } catch (error) {
            console.error("Error exporting data:", error);
        } finally {
            setExporting(false);
        }
    };

    const ExportOption = ({ icon, title, description, onPress, color }: any) => (
        <TouchableOpacity style={styles.optionCard} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
                <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionDescription}>{description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Export My Data</Text>
                        <Text style={styles.subtitle}>Download your learning history and performance metrics</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#0369a1" />
                        <Text style={styles.infoText}>
                            Your data will be exported in CSV format, which can be opened in Excel, Google Sheets, or any text editor.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <ExportOption
                            icon="file-table-outline"
                            title="Detailed Activity Log"
                            description="Every question you've answered, including correct/incorrect status and difficulty."
                            color="#4f46e5"
                            onPress={() => handleExport("full")}
                        />

                        <ExportOption
                            icon="chart-areaspline"
                            title="Performance Summary"
                            description="An aggregated report showing accuracy and total questions per chapter."
                            color="#10b981"
                            onPress={() => handleExport("summary")}
                        />
                    </View>

                    {exporting && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#6366f1" />
                            <Text style={styles.loadingText}>Preparing your data...</Text>
                        </View>
                    )}
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
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#e0f2fe",
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#bae6fd",
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#0369a1",
        lineHeight: 20,
    },
    section: {
        gap: 16,
    },
    optionCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
    },
    loadingOverlay: {
        marginTop: 40,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6366f1",
        fontWeight: "600",
    },
});
