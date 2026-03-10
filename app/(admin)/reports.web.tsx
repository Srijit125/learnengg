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
        <View className="bg-card-light dark:bg-card-dark p-5 rounded-2xl flex-row items-center border border-border-light dark:border-border-dark shadow-sm shadow-black/5">
            <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4`} style={{ backgroundColor: `${color}10` }}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-text-light dark:text-text-dark">{title}</Text>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{description}</Text>
            </View>
            <TouchableOpacity
                className="flex-row items-center px-4 py-2.5 rounded-lg gap-2 ml-4"
                style={{ backgroundColor: color }}
                onPress={() => downloadCSV(data, filename)}
            >
                <MaterialCommunityIcons name="download" size={18} color="white" />
                <Text className="color-white font-bold text-sm">CSV</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="p-6 pt-10 flex-row justify-between items-center">
                        <View>
                            <Text className="text-[32px] font-bold text-text-light dark:text-text-dark tracking-tight">System Reports</Text>
                            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Generate and download detailed analytics reports for the entire platform</Text>
                        </View>
                        <TouchableOpacity onPress={fetchData} className="p-2.5 rounded-[20px] bg-card-light dark:bg-card-dark shadow-sm shadow-black/10">
                            <Ionicons name="refresh" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-15 items-center">
                            <ActivityIndicator size="large" color="#667eea" />
                            <Text className="mt-4 text-[15px] text-textSecondary-light dark:text-textSecondary-dark font-medium">Preparing reports...</Text>
                        </View>
                    ) : (
                        <View className="px-6 pb-6 gap-6">
                            <View className="gap-4">
                                <Text className="text-xl font-bold text-text-light dark:text-text-dark">Available Reports</Text>
                                <View className="gap-4">
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

                            <View className="gap-4">
                                <Text className="text-xl font-bold text-text-light dark:text-text-dark">Report Summaries</Text>
                                <View className="bg-card-light dark:bg-card-dark p-6 rounded-[20px] border border-border-light dark:border-border-dark">
                                    <View className="mb-5">
                                        <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[0.5px]">Total Records Available</Text>
                                    </View>
                                    <View className="flex-row items-center justify-around">
                                        <View className="items-center">
                                            <Text className="text-[28px] font-extrabold text-text-light dark:text-text-dark">{studentsData.length}</Text>
                                            <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark mt-1 font-semibold">Students</Text>
                                        </View>
                                        <View className="items-center">
                                            <Text className="text-[28px] font-extrabold text-text-light dark:text-text-dark">{coursesStats.length}</Text>
                                            <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark mt-1 font-semibold">Courses</Text>
                                        </View>
                                        <View className="w-[1px] h-10 bg-background-light dark:bg-background-dark" />
                                        <View className="items-center">
                                            <Text className="text-[28px] font-extrabold text-text-light dark:text-text-dark">{globalLogs.length}</Text>
                                            <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark mt-1 font-semibold">Activity Logs</Text>
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
