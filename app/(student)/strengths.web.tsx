import { getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StudentStrengthsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [strengths, setStrengths] = useState<any[]>([]);
    const [totalAttempts, setTotalAttempts] = useState(0);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const logs = await getUserLogsData(user.id);
            setTotalAttempts(logs.length);

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
                .filter(item => item.accuracy >= 80)
                .sort((a, b) => b.accuracy - a.accuracy);

            setStrengths(aggregated);
        } catch (error) {
            console.error("Error fetching student strengths:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#f0fdf4"]} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 flex-row justify-between items-center">
                        <View>
                            <Text className="text-3xl font-extrabold text-[#064e3b] tracking-tight">Your Strengths</Text>
                            <Text className="text-base text-[#059669] mt-1">Chapters where you are excelling</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="p-2.5 rounded-full bg-card-light dark:bg-card-dark border border-[#dcfce7] shadow-sm">
                            <Ionicons name="refresh" size={20} color="#059669" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-20 items-center">
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text className="mt-4 text-[15px] color-[#059669] font-medium">Analyzing your success...</Text>
                        </View>
                    ) : (
                        <View className="px-6 pb-6 gap-6">
                            <View className="flex-row gap-4 mb-2">
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#dcfce7] shadow-sm">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Total Attempts</Text>
                                    <Text className="text-2xl font-bold color-[#10b981] mt-1">{totalAttempts}</Text>
                                </View>
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#dcfce7] shadow-sm">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Mastered Areas</Text>
                                    <Text className="text-2xl font-bold color-[#10b981] mt-1">{strengths.length}</Text>
                                </View>
                            </View>

                            {strengths.length > 0 ? (
                                <View className="gap-4">
                                    <Text className="text-lg font-bold text-text-light dark:text-text-dark">Top Performing Chapters</Text>
                                    <View className="gap-3">
                                        {strengths.map((item, index) => (
                                            <View key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl flex-row items-center border border-border-light dark:border-border-dark shadow-sm shadow-[#10b981]/5">
                                                <View className="w-10 h-10 rounded-full bg-[#dcfce7] justify-center items-center mr-4">
                                                    <Text className="color-[#059669] font-extrabold text-sm">#{index + 1}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-text-light dark:text-text-dark">{item.name}</Text>
                                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{item.attempts} attempts • {item.correct} correct</Text>

                                                    <View className="flex-row items-center mt-2 gap-2.5">
                                                        <View className="flex-1 h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                                                            <View className="h-full bg-[#10b981] rounded-full" style={{ width: `${item.accuracy}%` }} />
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
                            ) : (
                                <View className="items-center justify-center p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark">
                                    <MaterialCommunityIcons name="lightning-bolt" size={64} color="#f59e0b" />
                                    <Text className="text-xl font-bold text-text-light dark:text-text-dark mt-4">Keep Pushing!</Text>
                                    <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark text-center mt-2">Start mastering chapters and they will appear here as your strengths.</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
