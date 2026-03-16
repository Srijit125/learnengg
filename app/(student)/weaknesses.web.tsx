import { getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StudentWeaknessesPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [weaknesses, setWeaknesses] = useState<any[]>([]);
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
                .filter(item => item.accuracy < 70)
                .sort((a, b) => a.accuracy - b.accuracy);

            setWeaknesses(aggregated);
        } catch (error) {
            console.error("Error fetching student weaknesses:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 flex-row justify-between items-center">
                        <View>
                            <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark tracking-tight">Your Weaknesses</Text>
                            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Chapters where you need more practice</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="p-2.5 rounded-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
                            <Ionicons name="refresh" size={20} color={isDark ? "#f87171" : "#dc2626"} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-20 items-center">
                            <ActivityIndicator size="large" color={isDark ? "#f87171" : "#ef4444"} />
                            <Text className="mt-4 text-[15px] text-error dark:text-error-light font-medium">Analyzing your results...</Text>
                        </View>
                    ) : (
                        <View className="px-6 pb-6 gap-6">
                            <View className="flex-row gap-4 mb-2">
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Total Attempts</Text>
                                    <Text className="text-2xl font-bold text-error dark:text-error-light mt-1">{totalAttempts}</Text>
                                </View>
                                <View className="flex-1 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                                    <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase">Weak Areas</Text>
                                    <Text className="text-2xl font-bold text-error dark:text-error-light mt-1">{weaknesses.length}</Text>
                                </View>
                            </View>

                            {weaknesses.length > 0 ? (
                                <View className="gap-4">
                                    <Text className="text-lg font-bold text-text-light dark:text-text-dark">Priority Focus Areas</Text>
                                    <View className="gap-3">
                                        {weaknesses.map((item, index) => (
                                            <View key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl flex-row items-center border border-border-light dark:border-border-dark shadow-sm">
                                                <View className="w-10 h-10 rounded-full bg-error/10 dark:bg-error/20 justify-center items-center mr-4">
                                                    <Text className="text-error dark:text-error-light font-extrabold text-sm">#{index + 1}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-text-light dark:text-text-dark">{item.name}</Text>
                                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{item.attempts} attempts • {item.correct} correct</Text>

                                                    <View className="flex-row items-center mt-2 gap-2.5">
                                                        <View className="flex-1 h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                                                            <View className="h-full bg-error dark:bg-error-light rounded-full" style={{ width: `${item.accuracy}%` }} />
                                                        </View>
                                                        <Text className="text-sm font-bold text-error dark:text-error-light w-10">{Math.round(item.accuracy)}%</Text>
                                                    </View>
                                                </View>
                                                <View className="ml-4">
                                                    <MaterialCommunityIcons name="alert-circle" size={28} color={isDark ? "#f87171" : "#ef4444"} />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center justify-center p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark">
                                    <MaterialCommunityIcons name="check-circle" size={64} color={isDark ? "#34d399" : "#10b981"} />
                                    <Text className="text-xl font-bold text-text-light dark:text-text-dark mt-4">Looking Good!</Text>
                                    <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark text-center mt-2">You don't have any major weak areas yet. Keep it up!</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
