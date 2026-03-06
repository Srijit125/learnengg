import { getUserLogsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
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

            // Group by Chapter
            const counts: Record<string, { correct: number, total: number }> = {};
            logs.forEach((log: any) => {
                const chapter = log.reference?.Chapter || "General Concepts";
                if (!counts[chapter]) counts[chapter] = { correct: 0, total: 0 };
                counts[chapter].total++;
                if (log.correct) counts[chapter].correct++;
            });

            // Convert to array and sort (highest accuracy first)
            const aggregated = Object.entries(counts)
                .map(([name, stat]) => ({
                    name,
                    accuracy: (stat.correct / stat.total) * 100,
                    attempts: stat.total,
                    correct: stat.correct
                }))
                .filter(item => item.accuracy >= 80) // Threshold for strength
                .sort((a, b) => b.accuracy - a.accuracy);

            setStrengths(aggregated);
        } catch (error) {
            console.error("Error fetching student strengths:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f0fdf4"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Your Strengths</Text>
                            <Text style={styles.subtitle}>Chapters where you are excelling</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#059669" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text style={styles.loadingText}>Analyzing your success...</Text>
                        </View>
                    ) : (
                        <View style={styles.mainContent}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryLabel}>Total Attempts</Text>
                                    <Text style={styles.summaryValue}>{totalAttempts}</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryLabel}>Mastered Areas</Text>
                                    <Text style={styles.summaryValue}>{strengths.length}</Text>
                                </View>
                            </View>

                            {strengths.length > 0 ? (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Top Performing Chapters</Text>
                                    <View style={styles.listContainer}>
                                        {strengths.map((item, index) => (
                                            <View key={index} style={styles.strengthCard}>
                                                <View style={styles.rankBadge}>
                                                    <Text style={styles.rankText}>#{index + 1}</Text>
                                                </View>
                                                <View style={styles.strengthInfo}>
                                                    <Text style={styles.strengthName}>{item.name}</Text>
                                                    <Text style={styles.strengthMeta}>{item.attempts} attempts • {item.correct} correct</Text>

                                                    <View style={styles.progressRow}>
                                                        <View style={styles.progressBarBg}>
                                                            <View style={[styles.progressBarFill, { width: `${item.accuracy}%` }]} />
                                                        </View>
                                                        <Text style={styles.accuracyText}>{Math.round(item.accuracy)}%</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.iconContainer}>
                                                    <MaterialCommunityIcons name="shield-check" size={28} color="#10b981" />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={64} color="#f59e0b" />
                                    <Text style={styles.emptyTitle}>Keep Pushing!</Text>
                                    <Text style={styles.emptySubtitle}>Start mastering chapters and they will appear here as your strengths.</Text>
                                </View>
                            )}
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
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 32, fontWeight: "800", color: "#064e3b", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#059669", marginTop: 4 },
    refreshBtn: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dcfce7',
        elevation: 2,
    },
    mainContent: { padding: 24, paddingTop: 0, gap: 24 },
    summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    summaryCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dcfce7',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    summaryLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    summaryValue: { fontSize: 24, fontWeight: '700', color: '#10b981', marginTop: 4 },
    section: { gap: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    listContainer: { gap: 12 },
    strengthCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: { color: '#059669', fontWeight: '800', fontSize: 14 },
    strengthInfo: { flex: 1 },
    strengthName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    strengthMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
    accuracyText: { fontSize: 14, fontWeight: '700', color: '#10b981', width: 40 },
    iconContainer: { marginLeft: 16 },
    loadingContainer: { padding: 80, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 15, color: "#059669", fontWeight: "500" },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
});
