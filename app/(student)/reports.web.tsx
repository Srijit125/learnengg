import DonutChart from "@/components/Dashboard/Charts/DonutChart";
import { getUserCPI, getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { downloadCSV } from "@/utils/csvExport";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function StudentReportsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [cpi, setCpi] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [logsData, cpiData] = await Promise.all([
                getUserLogsData(user.id),
                getUserCPI(user.id)
            ]);
            setLogs(logsData);
            setCpi(cpiData);
        } catch (error) {
            console.error("Error fetching student reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        if (!logs.length) return null;

        const total = logs.length;
        const correct = logs.filter(l => l.correct).length;
        const accuracy = Math.round((correct / total) * 100);

        const counts: Record<string, { correct: number, total: number }> = {};
        logs.forEach((log: any) => {
            const chapter = log.reference?.Chapter || "General Concepts";
            if (!counts[chapter]) counts[chapter] = { correct: 0, total: 0 };
            counts[chapter].total++;
            if (log.correct) counts[chapter].correct++;
        });

        const sorted = Object.entries(counts)
            .map(([name, stat]) => ({
                name,
                accuracy: (stat.correct / stat.total) * 100,
            }))
            .sort((a, b) => b.accuracy - a.accuracy);

        return {
            total,
            correct,
            accuracy,
            topStrength: sorted[0]?.name || "N/A",
            primaryWeakness: sorted[sorted.length - 1]?.name || "N/A",
            activeDays: new Set(logs.map(l => new Date(l.timestamp).toDateString())).size
        };
    }, [logs]);

    const handleDownload = () => {
        if (!stats || !logs.length) return;

        const reportData = logs.map(log => ({
            Date: new Date(log.timestamp).toLocaleString(),
            Chapter: log.reference?.Chapter || "General Concepts",
            Section: log.reference?.Section || "N/A",
            Difficulty: log.difficulty,
            Question: log.question,
            Result: log.correct ? "Correct" : "Incorrect"
        }));

        const summaryData = [
            {},
            { Date: "SUMMARY STATISTICS" },
            { Date: "Total Questions", Chapter: stats.total },
            { Date: "Correct Answers", Chapter: stats.correct },
            { Date: "Overall Accuracy", Chapter: `${stats.accuracy}%` },
            { Date: "Current CPI", Chapter: cpi?.toFixed(1) || "0.0" },
            { Date: "Top Strength", Chapter: stats.topStrength },
            { Date: "Focus Needed", Chapter: stats.primaryWeakness }
        ];

        downloadCSV([...reportData, ...summaryData], `${user?.full_name || "Student"}_Learning_Report`);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="mt-4 text-base text-[#6366f1] font-semibold">Generating your report...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {typeof window !== 'undefined' && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white !important; padding: 0 !important; margin: 0 !important; }
                        .print-card { border: none !important; shadow: none !important; padding: 0 !important; }
                        .print-grid-card { width: 45% !important; border: 1px solid #eee !important; page-break-inside: avoid; }
                    }
                    .print-only { display: none; }
                `}} />
            )}
            <LinearGradient colors={["#f8fafc", "#f5f3ff"]} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark tracking-tight">Learning Report</Text>
                            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Comprehensive overview of your progress</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="no-print p-2.5 rounded-full bg-card-light dark:bg-card-dark border border-divider-light dark:border-divider-dark shadow-sm">
                            <Ionicons name="refresh" size={20} color="#6366f1" />
                        </TouchableOpacity>
                    </View>

                    {stats ? (
                        <>
                            <View className="print-card bg-card-light dark:bg-card-dark rounded-3xl p-8 mb-6 shadow-sm border border-border-light dark:border-border-dark">
                                <View className="items-center">
                                    <DonutChart
                                        percentage={stats.accuracy}
                                        size={120}
                                        strokeWidth={12}
                                        centerLabel="Accuracy"
                                        centerValue={`${stats.accuracy}%`}
                                    />
                                    <View className="flex-row mt-8 w-full justify-center gap-10">
                                        <View className="items-center">
                                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase mb-1">Total Questions</Text>
                                            <Text className="text-xl font-bold text-text-light dark:text-text-dark">{stats.total}</Text>
                                        </View>
                                        <View className="w-[1px] bg-[#e2e8f0] h-full" />
                                        <View className="items-center">
                                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase mb-1">Correct Answers</Text>
                                            <Text className="text-xl font-bold text-text-light dark:text-text-dark">{stats.correct}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap gap-4 mb-6">
                                <View className="print-grid-card w-[48%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark min-h-[140px]">
                                    <View className="w-10 h-10 rounded-xl justify-center items-center mb-3 bg-[#e0f2fe]">
                                        <MaterialCommunityIcons name="star-circle" size={24} color="#0284c7" />
                                    </View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">Top Strength</Text>
                                    <Text className="text-base font-bold text-text-light dark:text-text-dark leading-tight" numberOfLines={2}>{stats.topStrength}</Text>
                                </View>

                                <View className="print-grid-card w-[48%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark min-h-[140px]">
                                    <View className="w-10 h-10 rounded-xl justify-center items-center mb-3 bg-[#fef2f2]">
                                        <MaterialCommunityIcons name="alert-octagon" size={24} color="#dc2626" />
                                    </View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">Focus Needed</Text>
                                    <Text className="text-base font-bold text-text-light dark:text-text-dark leading-tight" numberOfLines={2}>{stats.primaryWeakness}</Text>
                                </View>

                                <View className="print-grid-card w-[48%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark min-h-[140px]">
                                    <View className="w-10 h-10 rounded-xl justify-center items-center mb-3 bg-[#f0fdf4]">
                                        <MaterialCommunityIcons name="calendar-check" size={24} color="#16a34a" />
                                    </View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">Learning Days</Text>
                                    <Text className="text-base font-bold text-text-light dark:text-text-dark leading-tight">{stats.activeDays} Days</Text>
                                </View>

                                <View className="print-grid-card w-[48%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark min-h-[140px]">
                                    <View className="w-10 h-10 rounded-xl justify-center items-center mb-3 bg-[#fff7ed]">
                                        <MaterialCommunityIcons name="gauge" size={24} color="#ea580c" />
                                    </View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">Current CPI</Text>
                                    <Text className="text-base font-bold text-text-light dark:text-text-dark leading-tight">{cpi?.toFixed(1) || "0.0"}</Text>
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Performance Insights</Text>
                                <View className="flex-row bg-[#f5f3ff] p-5 rounded-2xl gap-4 border border-[#ddd6fe]">
                                    <Ionicons name="bulb-outline" size={24} color="#8b5cf6" />
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-[#5b21b6] mb-1">Expert Recommendation</Text>
                                        <Text className="text-sm text-[#6d28d9] leading-5">
                                            Your overall accuracy is {stats.accuracy}%.
                                            You are performing remarkably well in "{stats.topStrength}".
                                            To improve your overall score, consider dedicating more time to "{stats.primaryWeakness}"
                                            where your accuracy is currently lower.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                className="no-print flex-row bg-[#6366f1] py-4 rounded-2xl justify-center items-center gap-3 shadow-md shadow-[#6366f1]/30"
                                onPress={handleDownload}
                            >
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text className="text-white text-base font-bold">Download CSV Report</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="items-center justify-center p-14 bg-card-light dark:bg-card-dark rounded-3xl">
                            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                            <Text className="text-xl font-bold text-text-light dark:text-text-dark mt-4">No Data Available</Text>
                            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark text-center mt-2">Complete more quizzes to generate your learning report.</Text>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
