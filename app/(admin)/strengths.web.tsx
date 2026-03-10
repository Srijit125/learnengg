import { getGlobalStudyLogs } from "@/services/analyticsService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function StrengthsPage() {
    const [loading, setLoading] = useState(true);
    const [strengths, setStrengths] = useState<any[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const logs = await getGlobalStudyLogs();
            setTotalLogs(logs.length);

            const counts: Record<string, { correct: number, total: number }> = {};
            logs.forEach((log: any) => {
                const chapter = log.reference?.Chapter || "General Concepts";
                if (!counts[chapter]) counts[chapter] = { correct: 0, total: 0 };
                counts[chapter].total++;
                if (log.correct) counts[chapter].correct++;
            });

            const aggregated = Object.entries(counts)
                .map(([name, stat]) => ({
                    name,
                    accuracy: (stat.correct / stat.total) * 100,
                    attempts: stat.total,
                    correct: stat.correct
                }))
                .filter(item => item.attempts >= 1)
                .sort((a, b) => b.accuracy - a.accuracy);

            setStrengths(aggregated.slice(0, 10));
        } catch (error) {
            console.error("Error fetching strengths data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#f0fdf4"]} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 pt-10 flex-row justify-between items-center">
                        <View>
                            <Text className="text-[32px] font-bold color-[#064e3b] tracking-tight">System Strengths</Text>
                            <Text className="text-base color-[#059669] mt-1">Top performing chapters where students excel the most</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="p-2.5 rounded-[20px] bg-card-light dark:bg-card-dark border border-[#dcfce7] shadow-sm">
                            <Ionicons name="refresh" size={20} color="#059669" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-20 items-center">
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text className="mt-4 text-[15px] color-[#059669] font-medium">Analyzing performance...</Text>
                        </View>
                    ) : (
                        <View className="px-6 pb-6 gap-6">
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#dcfce7]">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Total Activities</Text>
                                    <Text className="text-2xl font-bold color-[#10b981] mt-1">{totalLogs}</Text>
                                </View>
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#dcfce7]">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Identified Strengths</Text>
                                    <Text className="text-2xl font-bold color-[#10b981] mt-1">{strengths.length}</Text>
                                </View>
                            </View>

                            <View className="gap-4">
                                <Text className="text-lg font-bold text-text-light dark:text-text-dark">Top 10 Performant Chapters</Text>
                                <View className="gap-3">
                                    {strengths.map((item, index) => (
                                        <View key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl flex-row items-center border border-border-light dark:border-border-dark shadow-sm shadow-[#10b981]/5">
                                            <View className="w-10 h-10 rounded-[20px] bg-[#dcfce7] justify-center items-center mr-4">
                                                <Text className="color-[#059669] font-extrabold text-sm">#{index + 1}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-bold text-text-light dark:text-text-dark">{item.name}</Text>
                                                <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{item.attempts} attempts • {item.correct} correct</Text>

                                                <View className="flex-row items-center mt-2 gap-2.5">
                                                    <View className="flex-1 h-1.5 bg-background-light dark:bg-background-dark rounded-[3px] overflow-hidden">
                                                        <View className="h-full bg-[#10b981] rounded-[3px]" style={{ width: `${item.accuracy}%` }} />
                                                    </View>
                                                    <Text className="text-sm font-bold color-[#10b981] w-10">{Math.round(item.accuracy)}%</Text>
                                                </View>
                                            </View>
                                            <View className="ml-4">
                                                <MaterialCommunityIcons name="shield-check" size={28} color="#10b981" />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
