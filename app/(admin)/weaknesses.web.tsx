import { getGlobalStudyLogs } from "@/services/analyticsService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

            // Group by Chapter
            const counts: Record<string, { correct: number, total: number }> = {};
            logs.forEach((log: any) => {
                const chapter = log.reference?.Chapter || "General Concepts";
                if (!counts[chapter]) counts[chapter] = { correct: 0, total: 0 };
                counts[chapter].total++;
                if (log.correct) counts[chapter].correct++;
            });

            // Convert to array and sort (lowest accuracy first)
            const aggregated = Object.entries(counts)
                .map(([name, stat]) => ({
                    name,
                    accuracy: (stat.correct / stat.total) * 100,
                    attempts: stat.total,
                    correct: stat.correct
                }))
                .filter(item => item.attempts >= 1)
                .sort((a, b) => a.accuracy - b.accuracy);

            setWeaknesses(aggregated.slice(0, 10)); // Bottom 10 weaknesses
        } catch (error) {
            console.error("Error fetching weaknesses data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#fef2f2"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>System Weaknesses</Text>
                            <Text style={styles.subtitle}>Critical chapters where students are struggling the most</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#dc2626" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ef4444" />
                            <Text style={styles.loadingText}>Identifying critical gaps...</Text>
                        </View>
                    ) : (
                        <View style={styles.mainContent}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryLabel}>Total Activities</Text>
                                    <Text style={styles.summaryValue}>{totalLogs}</Text>
                                </View>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryLabel}>Critical Areas</Text>
                                    <Text style={styles.summaryValue}>{weaknesses.length}</Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>10 Chapters Needing Attention</Text>
                                <View style={styles.listContainer}>
                                    {weaknesses.map((item, index) => (
                                        <View key={index} style={styles.weaknessCard}>
                                            <View style={styles.rankBadge}>
                                                <Text style={styles.rankText}>#{index + 1}</Text>
                                            </View>
                                            <View style={styles.weaknessInfo}>
                                                <Text style={styles.weaknessName}>{item.name}</Text>
                                                <Text style={styles.weaknessMeta}>{item.attempts} attempts • {item.correct} correct</Text>

                                                <View style={styles.progressRow}>
                                                    <View style={styles.progressBarBg}>
                                                        <View style={[styles.progressBarFill, { width: `${item.accuracy}%` }]} />
                                                    </View>
                                                    <Text style={styles.accuracyText}>{Math.round(item.accuracy)}%</Text>
                                                </View>
                                            </View>
                                            <View style={styles.iconContainer}>
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    scrollView: { flex: 1 },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
    },
    title: { fontSize: 32, fontWeight: "700", color: "#450a0a", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#991b1b", marginTop: 4 },
    refreshBtn: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#fee2e2',
        elevation: 2,
    },
    mainContent: { padding: 24, paddingTop: 0, gap: 24 },
    summaryRow: { flexDirection: 'row', gap: 16 },
    summaryCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    summaryLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    summaryValue: { fontSize: 24, fontWeight: '700', color: '#ef4444', marginTop: 4 },
    section: { gap: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    listContainer: { gap: 12 },
    weaknessCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: { color: '#dc2626', fontWeight: '800', fontSize: 14 },
    weaknessInfo: { flex: 1 },
    weaknessName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    weaknessMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#ef4444', borderRadius: 3 },
    accuracyText: { fontSize: 14, fontWeight: '700', color: '#ef4444', width: 40 },
    iconContainer: { marginLeft: 16 },
    loadingContainer: { padding: 80, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 15, color: "#ef4444", fontWeight: "500" },
});
