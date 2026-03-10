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

export default function WeaknessesPage() {
    const [loading, setLoading] = useState(true);
    const [weaknesses, setWeaknesses] = useState<any[]>([]);
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
                .sort((a, b) => a.accuracy - b.accuracy);

            setWeaknesses(aggregated.slice(0, 10));
        } catch (error) {
            console.error("Error fetching weaknesses data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#fef2f2"]} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 pt-10 flex-row justify-between items-center">
                        <View>
                            <Text className="text-[32px] font-bold text-[#450a0a] tracking-tight">System Weaknesses</Text>
                            <Text className="text-base text-[#991b1b] mt-1">Critical chapters where students are struggling the most</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="p-2.5 rounded-[20px] bg-card-light dark:bg-card-dark border border-[#fee2e2] shadow-sm">
                            <Ionicons name="refresh" size={20} color="#dc2626" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-20 items-center">
                            <ActivityIndicator size="large" color="#ef4444" />
                            <Text className="mt-4 text-[15px] color-[#ef4444] font-medium">Identifying critical gaps...</Text>
                        </View>
                    ) : (
                        <View className="px-6 pb-6 gap-6">
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#fee2e2]">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Total Activities</Text>
                                    <Text className="text-2xl font-bold color-[#ef4444] mt-1">{totalLogs}</Text>
                                </View>
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#fee2e2]">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Critical Areas</Text>
                                    <Text className="text-2xl font-bold color-[#ef4444] mt-1">{weaknesses.length}</Text>
                                </View>
                            </View>

                            <View className="gap-4">
                                <Text className="text-lg font-bold text-text-light dark:text-text-dark">10 Chapters Needing Attention</Text>
                                <View className="gap-3">
                                    {weaknesses.map((item, index) => (
                                        <View key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl flex-row items-center border border-border-light dark:border-border-dark shadow-sm shadow-[#ef4444]/5">
                                            <View className="w-10 h-10 rounded-[20px] bg-[#fee2e2] justify-center items-center mr-4">
                                                <Text className="color-[#dc2626] font-extrabold text-sm">#{index + 1}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-bold text-text-light dark:text-text-dark">{item.name}</Text>
                                                <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{item.attempts} attempts • {item.correct} correct</Text>

                                                <View className="flex-row items-center mt-2 gap-2.5">
                                                    <View className="flex-1 h-1.5 bg-background-light dark:bg-background-dark rounded-[3px] overflow-hidden">
                                                        <View className="h-full bg-[#ef4444] rounded-[3px]" style={{ width: `${item.accuracy}%` }} />
                                                    </View>
                                                    <Text className="text-sm font-bold color-[#ef4444] w-10">{Math.round(item.accuracy)}%</Text>
                                                </View>
                                            </View>
                                            <View className="ml-4">
                                                <MaterialCommunityIcons name="alert-circle" size={28} color="#ef4444" />
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
