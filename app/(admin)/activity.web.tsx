import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { getGlobalStudyLogs } from "@/services/analyticsService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function ActivityPage() {
    const [loading, setLoading] = useState(true);
    const [globalLogs, setGlobalLogs] = useState<any[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getGlobalStudyLogs();
            setGlobalLogs(data);
        } catch (error) {
            console.error("Error fetching global logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 pt-10 flex-row justify-between items-center bg-transparent">
                        <View>
                            <Text className="text-[32px] font-bold text-text-light dark:text-text-dark tracking-tight">System Activity</Text>
                            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Real-time audit of study patterns and student interactions across the platform</Text>
                        </View>
                        <TouchableOpacity onPress={fetchLogs} className="p-2.5 rounded-[20px] bg-card-light dark:bg-card-dark shadow-sm shadow-[#000]/10 border border-divider-light dark:border-divider-dark">
                            <Ionicons name="refresh" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View className="px-6 pb-6">
                        {loading ? (
                            <View className="p-15 items-center bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark">
                                <ActivityIndicator size="large" color="#667eea" />
                                <Text className="mt-4 text-[15px] text-textSecondary-light dark:text-textSecondary-dark font-medium">Fetching activity logs...</Text>
                            </View>
                        ) : (
                            <ActivityFeed
                                activities={globalLogs.map(log => ({
                                    id: log.id,
                                    topic: `${log.username || 'User'} - ${log.event_type.replace('_', ' ')}`,
                                    correct: log.metadata?.correct,
                                    difficulty: log.metadata?.difficulty,
                                    timestamp: log.timestamp
                                }))}
                                maxItems={100}
                            />
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
