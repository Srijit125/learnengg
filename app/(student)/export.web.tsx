import { getUserCPI, getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { downloadCSV } from "@/utils/csvExport";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function ExportDataPage() {
    const { user } = useAuthStore();
    const [exporting, setExporting] = useState(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

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
        <TouchableOpacity className="bg-card-light dark:bg-card-dark rounded-[20px] p-5 flex-row items-center border border-border-light dark:border-border-dark shadow-sm mb-4" onPress={onPress}>
            <View className="w-14 h-14 rounded-2xl justify-center items-center mr-5" style={{ backgroundColor: `${color}10` }}>
                <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-1">{title}</Text>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-5">{description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? "#94a3b8" : "#cbd5e1"} />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                    <View className="mb-8 pt-3">
                        <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark tracking-tight">Export My Data</Text>
                        <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Download your learning history and performance metrics</Text>
                    </View>

                    <View className="flex-row bg-primary/10 dark:bg-primary/20 p-4 rounded-2xl mb-8 items-center gap-3 border border-primary/20">
                        <MaterialCommunityIcons name="information-outline" size={20} color={isDark ? "#818cf8" : "#0369a1"} />
                        <Text className="flex-1 text-sm text-primary dark:text-primary-light leading-5">
                            Your data will be exported in CSV format, which can be opened in Excel, Google Sheets, or any text editor.
                        </Text>
                    </View>

                    <View className="gap-4">
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
                        <View className="mt-10 items-center">
                            <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#6366f1"} />
                            <Text className="mt-3 text-sm text-primary dark:text-primary-light font-semibold">Preparing your data...</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
