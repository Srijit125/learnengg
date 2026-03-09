import { getAllCoursesStats, getAllStudentsStats, getGlobalStudyLogs, getSystemOverview } from "@/services/analyticsService";
import { getCourseSummary } from "@/services/course.service";
import { fetchMCQs } from "@/services/mcq.service";
import { downloadCSV } from "@/utils/csvExport";
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

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [systemOverview, setSystemOverview] = useState<any>(null);
    const [studentsData, setStudentsData] = useState<any[]>([]);
    const [coursesStats, setCoursesStats] = useState<any[]>([]);
    const [detailedCourseData, setDetailedCourseData] = useState<any[]>([]);
    const [globalLogs, setGlobalLogs] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overview, students, courses, logs] = await Promise.all([
                getSystemOverview(),
                getAllStudentsStats(),
                getAllCoursesStats(),
                getGlobalStudyLogs()
            ]);
            setSystemOverview(overview);
            setStudentsData(students);
            setCoursesStats(courses);
            setGlobalLogs(logs);

            // Fetch detailed metadata for each course
            const detailed = await Promise.all(courses.map(async (c: any) => {
                const summary = await getCourseSummary(c.id);
                const data = await fetchMCQs(c.id);
                return {
                    course_id: c.id,
                    course_name: c.name,
                    units: summary?.units || 0,
                    chapters: summary?.chapters || 0,
                    topics: summary?.topics || 0,
                    questions: summary?.questions || 0,
                    ai_mcqs: data?.length || 0,
                    students_studying: c.active_students || 0,
                    avg_accuracy: c.avg_accuracy || 0
                };
            }));
            setDetailedCourseData(detailed);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };


    const ReportCard = ({ title, description, icon, data, filename, color }: any) => (
        <View style={styles.reportCard}>
            <View style={[styles.reportIconContainer, { backgroundColor: `${color}10` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{title}</Text>
                <Text style={styles.reportDescription}>{description}</Text>
            </View>
            <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: color }]}
                onPress={() => downloadCSV(data, filename)}
            >
                <MaterialCommunityIcons name="download" size={18} color="white" />
                <Text style={styles.downloadBtnText}>CSV</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>System Reports</Text>
                            <Text style={styles.subtitle}>Generate and download detailed analytics reports for the entire platform</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#667eea" />
                            <Text style={styles.loadingText}>Preparing reports...</Text>
                        </View>
                    ) : (
                        <View style={styles.mainContent}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Available Reports</Text>
                                <View style={styles.reportGrid}>
                                    <ReportCard
                                        title="Student Performance"
                                        description="Detailed metrics for all enrolled students including accuracy and attempts."
                                        icon="account-group-outline"
                                        data={studentsData}
                                        filename="student_performance_report"
                                        color="#4f46e5"
                                    />
                                    <ReportCard
                                        title="Course Engagement"
                                        description="System-wide course statistics, enrollment rates, and average performance."
                                        icon="book-open-variant"
                                        data={coursesStats}
                                        filename="course_engagement_report"
                                        color="#10b981"
                                    />
                                    <ReportCard
                                        title="System Audit Logs"
                                        description="Complete history of system events, study sessions, and user interactions."
                                        icon="history"
                                        data={globalLogs}
                                        filename="system_audit_logs"
                                        color="#f59e0b"
                                    />
                                    <ReportCard
                                        title="Analytics Overview"
                                        description="High-level summary of platform health and engagement trends."
                                        icon="chart-box-outline"
                                        data={systemOverview ? [systemOverview] : []}
                                        filename="analytics_overview_report"
                                        color="#ec4899"
                                    />
                                    <ReportCard
                                        title="Detailed Course Metrics"
                                        description="Full breakdown of units, chapters, topics, AI MCQs and student engagement."
                                        icon="book-multiple"
                                        data={detailedCourseData}
                                        filename="detailed_course_metrics"
                                        color="#8b5cf6"
                                    />
                                </View>
                            </View>

                            <View style={styles.summarySection}>
                                <Text style={styles.sectionTitle}>Report Summaries</Text>
                                <View style={styles.summaryCard}>
                                    <View style={styles.summaryHeader}>
                                        <Text style={styles.summaryLabel}>Total Records Available</Text>
                                    </View>
                                    <View style={styles.summaryGrid}>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryValue}>{studentsData.length}</Text>
                                            <Text style={styles.summaryKey}>Students</Text>
                                        </View>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryValue}>{coursesStats.length}</Text>
                                            <Text style={styles.summaryKey}>Courses</Text>
                                        </View>
                                        <View style={styles.summaryValueSeparator} />
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryValue}>{globalLogs.length}</Text>
                                            <Text style={styles.summaryKey}>Activity Logs</Text>
                                        </View>
                                    </View>
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
    title: { fontSize: 32, fontWeight: "700", color: "#1e293b", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
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
    mainContent: { padding: 24, paddingTop: 0, gap: 24 },
    section: { gap: 16 },
    sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
    reportGrid: { gap: 16 },
    reportCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    reportIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportInfo: { flex: 1 },
    reportTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    reportDescription: { fontSize: 14, color: '#64748b', marginTop: 2 },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    downloadBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    summarySection: { gap: 16 },
    summaryCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    summaryHeader: { marginBottom: 20 },
    summaryLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryValue: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    summaryKey: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
    summaryValueSeparator: { width: 1, height: 40, backgroundColor: '#f1f5f9' },
    loadingContainer: { padding: 60, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 15, color: "#64748b", fontWeight: "500" },
});
