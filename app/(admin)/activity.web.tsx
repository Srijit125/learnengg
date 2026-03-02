import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { getGlobalStudyLogs } from "@/services/analyticsService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
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
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>System Activity</Text>
                            <Text style={styles.subtitle}>Real-time audit of study patterns and student interactions across the platform</Text>
                        </View>
                        <TouchableOpacity onPress={fetchLogs} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainContent}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#667eea" />
                                <Text style={styles.loadingText}>Fetching activity logs...</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    gradientBackground: {
        flex: 1
    },
    scrollView: {
        flex: 1
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1e293b",
        letterSpacing: -0.5
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
        marginTop: 4
    },
    refreshBtn: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    mainContent: {
        padding: 24,
        paddingTop: 0
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: "#64748b",
        fontWeight: "500"
    },
});
