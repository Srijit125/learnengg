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
    StyleSheet,
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

        // Prepare data for CSV
        const reportData = logs.map(log => ({
            Date: new Date(log.timestamp).toLocaleString(),
            Chapter: log.reference?.Chapter || "General Concepts",
            Section: log.reference?.Section || "N/A",
            Difficulty: log.difficulty,
            Question: log.question,
            Result: log.correct ? "Correct" : "Incorrect"
        }));

        // Add a summary row at the end (optional, but helpful)
        const summaryData = [
            {}, // Empty row
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Generating your report...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Native Web Print Styles */}
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
            <LinearGradient colors={["#f8fafc", "#f5f3ff"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Learning Report</Text>
                            <Text style={styles.subtitle}>Comprehensive overview of your progress</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} style={[styles.refreshBtn, { className: 'no-print' } as any]}>
                            <Ionicons name="refresh" size={20} color="#6366f1" />
                        </TouchableOpacity>
                    </View>

                    {stats ? (
                        <>
                            <View style={styles.mainCard}>
                                <View style={styles.accuracySection}>
                                    <DonutChart
                                        percentage={stats.accuracy}
                                        size={120}
                                        strokeWidth={12}
                                        centerLabel="Accuracy"
                                        centerValue={`${stats.accuracy}%`}
                                    />
                                    <View style={styles.quickStats}>
                                        <View style={styles.quickStatItem}>
                                            <Text style={styles.quickStatLabel}>Total Questions</Text>
                                            <Text style={styles.quickStatValue}>{stats.total}</Text>
                                        </View>
                                        <View style={styles.quickStatDivider} />
                                        <View style={styles.quickStatItem}>
                                            <Text style={styles.quickStatLabel}>Correct Answers</Text>
                                            <Text style={styles.quickStatValue}>{stats.correct}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.grid}>
                                <View style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#e0f2fe' }]}>
                                        <MaterialCommunityIcons name="star-circle" size={24} color="#0284c7" />
                                    </View>
                                    <Text style={styles.gridLabel}>Top Strength</Text>
                                    <Text style={styles.gridValue} numberOfLines={2}>{stats.topStrength}</Text>
                                </View>

                                <View style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#fef2f2' }]}>
                                        <MaterialCommunityIcons name="alert-octagon" size={24} color="#dc2626" />
                                    </View>
                                    <Text style={styles.gridLabel}>Focus Needed</Text>
                                    <Text style={styles.gridValue} numberOfLines={2}>{stats.primaryWeakness}</Text>
                                </View>

                                <View style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#f0fdf4' }]}>
                                        <MaterialCommunityIcons name="calendar-check" size={24} color="#16a34a" />
                                    </View>
                                    <Text style={styles.gridLabel}>Learning Days</Text>
                                    <Text style={styles.gridValue}>{stats.activeDays} Days</Text>
                                </View>

                                <View style={styles.gridCard}>
                                    <View style={[styles.gridIcon, { backgroundColor: '#fff7ed' }]}>
                                        <MaterialCommunityIcons name="gauge" size={24} color="#ea580c" />
                                    </View>
                                    <Text style={styles.gridLabel}>Current CPI</Text>
                                    <Text style={styles.gridValue}>{cpi?.toFixed(1) || "0.0"}</Text>
                                </View>
                            </View>

                            <View style={styles.recommendationSection}>
                                <Text style={styles.sectionTitle}>Performance Insights</Text>
                                <View style={styles.infoBox}>
                                    <Ionicons name="bulb-outline" size={24} color="#8b5cf6" />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoTitle}>Expert Recommendation</Text>
                                        <Text style={styles.infoText}>
                                            Your overall accuracy is {stats.accuracy}%.
                                            You are performing remarkably well in "{stats.topStrength}".
                                            To improve your overall score, consider dedicating more time to "{stats.primaryWeakness}"
                                            where your accuracy is currently lower.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.downloadBtn, { className: 'no-print' } as any]}
                                onPress={handleDownload}
                            >
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text style={styles.downloadBtnText}>Download CSV Report</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Data Available</Text>
                            <Text style={styles.emptySubtitle}>Complete more quizzes to generate your learning report.</Text>
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
    scrollContent: { padding: 24, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { marginTop: 16, fontSize: 16, color: "#6366f1", fontWeight: "600" },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: { fontSize: 32, fontWeight: "800", color: "#1e293b", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
    refreshBtn: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
    },
    mainCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    accuracySection: {
        alignItems: 'center',
    },
    quickStats: {
        flexDirection: 'row',
        marginTop: 32,
        width: '100%',
        justifyContent: 'center',
        gap: 40,
    },
    quickStatItem: {
        alignItems: 'center',
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    quickStatDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        height: '100%',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    gridCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        minHeight: 140,
    },
    gridIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 4,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        lineHeight: 22,
    },
    recommendationSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f5f3ff',
        padding: 20,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: '#ddd6fe',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5b21b6',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#6d28d9',
        lineHeight: 20,
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    downloadBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        backgroundColor: 'white',
        borderRadius: 24,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
});
