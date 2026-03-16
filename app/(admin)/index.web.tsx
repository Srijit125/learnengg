import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import ChartCard from "@/components/Dashboard/Cards/ChartCard";
import StatCard from "@/components/Dashboard/Cards/StatCard";
import DonutChart from "@/components/Dashboard/Charts/DonutChart";
import EnhancedBarChart from "@/components/Dashboard/Charts/EnhancedBarChart";
import TrendLineChart from "@/components/Dashboard/Charts/TrendLineChart";
import {
  getAllCoursesStats,
  getAllStudentsStats,
  getGlobalStudyLogs,
  getSystemOverview
} from "@/services/analyticsService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const TABS = [
  { id: 'overview', title: 'System Overview', icon: 'view-dashboard-outline' },
  { id: 'students', title: 'Students', icon: 'account-group-outline' },
  { id: 'courses', title: 'Courses & Chapters', icon: 'book-open-variant' },
  { id: 'logs', title: 'Study Pattern Logs', icon: 'history' },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Overview Data
  const [systemOverview, setSystemOverview] = useState<any>(null);

  // Students Data
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Courses Data
  const [coursesStats, setCoursesStats] = useState<any[]>([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Logs Data
  const [globalLogs, setGlobalLogs] = useState<any[]>([]);

  // Individual Student Logic (Keeping as a fallback or for detail view)
  const [userId, setUserId] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [overview, logs] = await Promise.all([
          getSystemOverview(),
          getGlobalStudyLogs()
        ]);
        setSystemOverview(overview);
        setGlobalLogs(logs);
      } else if (activeTab === 'students') {
        const data = await getAllStudentsStats();
        setStudentsData(data);
      } else if (activeTab === 'courses') {
        const data = await getAllCoursesStats();
        setCoursesStats(data);
      } else if (activeTab === 'logs') {
        const data = await getGlobalStudyLogs();
        setGlobalLogs(data);
      }
    } catch (error) {
      console.error(`Error loading tab ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChapters = async (courseId: string) => {
    setLoadingDetails(true);
    try {
      const { getCourseDetails } = require("@/services/analyticsService");
      const details = await getCourseDetails(courseId);
      setSelectedCourseDetails(details);
    } catch (error) {
      console.error("Error loading course details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return studentsData;
    return studentsData.filter(s =>
      s.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.user_id?.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [studentsData, studentSearch]);

  const logsDistribution = useMemo(() => {
    const types: any = {};
    globalLogs.forEach(l => {
      types[l.event_type] = (types[l.event_type] || 0) + 1;
    });
    return Object.entries(types).map(([label, value]) => ({
      label: label.replace('chapter_', ''),
      value: value as number,
      frontColor: isDark ? "#818cf8" : "#4F46E5"
    }));
  }, [globalLogs]);

  const renderTabs = () => (
    <View className="flex-row bg-card-light dark:bg-card-dark mx-6 rounded-xl p-1.5 shadow-sm shadow-[#000]/10 border border-divider-light dark:border-divider-dark">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 flex-row items-center justify-center py-3 gap-2 rounded-lg ${isActive ? "bg-primary/10 dark:bg-primary/20" : ""}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={20}
              color={isActive ? (isDark ? "#818cf8" : "#667eea") : (isDark ? "#94a3b8" : "#64748b")}
            />
            <Text className={`text-sm font-semibold ${isActive ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"}`}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOverview = () => (
    <View>
      <View className="flex-row flex-wrap gap-4 mb-6">
        <StatCard
          title="Total Students"
          value={systemOverview?.total_students || 0}
          icon="account-group"
          gradientColors={["#667eea", "#764ba2"]}
        />
        <StatCard
          title="Active Today"
          value={systemOverview?.active_today || 0}
          icon="account-check"
          gradientColors={["#10b981", "#059669"]}
        />
        <StatCard
          title="Avg. Accuracy"
          value={systemOverview?.avg_accuracy || 0}
          suffix="%"
          icon="chart-line"
          gradientColors={["#f59e0b", "#d97706"]}
        />
        <StatCard
          title="Study Sessions"
          value={systemOverview?.total_study_sessions || 0}
          icon="clock-outline"
          gradientColors={["#ec4899", "#be185d"]}
        />
      </View>

      <View className="flex-row gap-6">
        <View className="flex-[2] gap-6">
          <ChartCard title="System Performance Distribution" subtitle="Accuracy levels across all courses">
            <DonutChart
              percentage={systemOverview?.avg_accuracy || 0}
              size={200}
               strokeWidth={24}
              color={isDark ? "#818cf8" : "#667eea"}
              backgroundColor={isDark ? "#1e293b" : "#e5e7eb"}
              centerLabel="System Avg"
            />
          </ChartCard>
          <ChartCard title="Daily Engagement" subtitle="Total interactions over the last 7 days">
            <TrendLineChart
              data={(systemOverview?.engagement_trend || []).map((item: any) => ({
                value: item.count,
                label: item.date
              }))}
              height={200}
              color={isDark ? "#34d399" : "#10b981"}
              areaChart
            />
          </ChartCard>
        </View>
        <View className="flex-1 min-w-[350px]">
          <ActivityFeed
            activities={(globalLogs || []).slice(0, 8).map(log => ({
              id: log.id,
              topic: `${log.username || 'User'}: ${log.event_type.replace('_', ' ')}`,
              correct: log.metadata?.correct,
              difficulty: log.metadata?.difficulty,
              timestamp: log.timestamp
            }))}
            maxItems={10}
          />
        </View>
      </View>
    </View>
  );

  const renderStudents = () => (
    <View className="flex-1">
      <View className="flex-row items-center bg-card-light dark:bg-card-dark px-4 rounded-xl mb-5 border border-divider-light dark:border-divider-dark">
        <Ionicons name="search-outline" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
        <TextInput
          className="flex-1 py-3 px-2.5 text-[15px] text-text-light dark:text-text-dark"
          placeholder="Search students by name or ID..."
          value={studentSearch}
          onChangeText={setStudentSearch}
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        />
      </View>

      <View className="bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5">
        <View className="flex-row bg-background-light dark:bg-background-dark p-4 border-b border-divider-light dark:border-divider-dark">
          <Text className="flex-[2] text-[13px] font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Student</Text>
          <Text className="flex-1 text-[13px] font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Accuracy</Text>
          <Text className="flex-1 text-[13px] font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Attempts</Text>
          <Text className="flex-1 text-[13px] font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Last Active</Text>
        </View>
        {filteredStudents.map((student, idx) => (
          <View key={student.user_id} className={`flex-row p-4 items-center border-b border-border-light dark:border-border-dark ${idx % 2 === 0 ? "bg-background-light dark:bg-background-dark" : "bg-card-light dark:bg-card-dark"}`}>
            <View className="flex-[2]">
              <Text className="text-[15px] font-semibold text-text-light dark:text-text-dark">{student.username || 'N/A'}</Text>
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{student.user_id}</Text>
            </View>
            <Text className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{student.accuracy}%</Text>
            <Text className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{student.total_attempts}</Text>
            <Text className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{new Date(student.last_active).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCourses = () => (
    <View className="flex-1">
      <View className="flex-row flex-wrap gap-4 mb-6">
        {coursesStats.map(course => (
          <View key={course.id} className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5 gap-4" style={{ width: (Dimensions.get('window').width - 128) / 3 }}>
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="book-outline" size={24} color={isDark ? "#818cf8" : "#667eea"} />
              <Text className="text-lg font-bold text-text-light dark:text-text-dark flex-1">{course.name}</Text>
            </View>
            <View className="flex-row justify-between py-2.5 border-t border-border-light dark:border-border-dark">
              <View className="items-center">
                <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-1">Students</Text>
                <Text className="text-lg font-bold text-text-light dark:text-text-dark">{course.active_students}</Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-1">Avg Accuracy</Text>
                <Text className="text-lg font-bold text-text-light dark:text-text-dark">{course.avg_accuracy}%</Text>
              </View>
            </View>
            <TouchableOpacity
              className="flex-row justify-center items-center gap-1.5 pt-2.5"
              onPress={() => handleViewChapters(course.id)}
            >
              <Text className="text-sm font-semibold text-primary dark:text-primary-light">View Chapters</Text>
              <Ionicons name="arrow-forward" size={14} color={isDark ? "#818cf8" : "#667eea"} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ChartCard title="Course Performance Comparison" subtitle="Avg accuracy across all enrolled courses">
        <EnhancedBarChart
          data={coursesStats.map(c => ({
            label: c.name,
            value: c.avg_accuracy,
            frontColor: isDark ? "#818cf8" : "#667eea"
          }))}
          barWidth={60}
          height={300}
        />
      </ChartCard>
    </View>
  );

  const renderLogs = () => (
    <View className="flex-1">
      <ChartCard title="Study Pattern Distribution" subtitle="Event types captured in study logs">
        <EnhancedBarChart
          data={logsDistribution}
          barWidth={50}
          height={250}
        />
      </ChartCard>

      <View className="mt-5">
        <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Global Study Audit Log</Text>
        <ActivityFeed
          activities={globalLogs.map(log => ({
            id: log.id,
            topic: `${log.username || 'User'} - ${log.event_type.replace('_', ' ')}`,
            correct: log.metadata?.correct,
            difficulty: log.metadata?.difficulty,
            timestamp: log.timestamp
          }))}
          maxItems={50}
        />
      </View>
    </View>
  );

  const renderCourseDetailsModal = () => (
    <Modal
      visible={!!selectedCourseDetails || loadingDetails}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedCourseDetails(null)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-10">
        <View className="bg-card-light dark:bg-card-dark rounded-3xl w-[80%] max-w-[900px] max-h-[80%] overflow-hidden shadow-2xl">
          <View className="flex-row justify-between items-center p-6 border-b border-border-light dark:border-border-dark">
            <View>
              <Text className="text-[22px] font-bold text-text-light dark:text-text-dark">{selectedCourseDetails?.course_name || 'Loading Details...'}</Text>
              <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-0.5">Chapter-level performance breakdown</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCourseDetails(null)} className="p-2 rounded-xl bg-background-light dark:bg-background-dark">
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loadingDetails ? (
            <View className="p-15 items-center">
              <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
              <Text className="mt-4 text-[15px] text-textSecondary-light dark:text-textSecondary-dark">Analyzing chapter data...</Text>
            </View>
          ) : (
            <ScrollView className="p-6">
              <View className="flex-row pb-3 border-b-2 border-border-light dark:border-border-dark mb-2">
                <Text className="flex-[2] text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Chapter</Text>
                <Text className="flex-1 text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Unit</Text>
                <Text className="flex-1 text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Accuracy</Text>
                <Text className="flex-1 text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px]">Students</Text>
              </View>
              {selectedCourseDetails?.chapters?.map((ch: any, idx: number) => (
                <View key={idx} className={`flex-row items-center py-3 border-b border-border-light dark:border-border-dark ${idx % 2 === 0 ? "bg-background-light dark:bg-background-dark" : "bg-card-light dark:bg-card-dark"}`}>
                  <View className="flex-[2]">
                    <Text className="text-[15px] font-semibold text-text-light dark:text-text-dark">{ch.chapter}</Text>
                  </View>
                  <Text className="flex-1 text-[13px] text-textSecondary-light dark:text-textSecondary-dark">{ch.unit}</Text>
                  <View className="flex-1">
                    <View className={`self-start px-2 py-1 rounded-lg ${ch.avg_accuracy > 70 ? (isDark ? 'bg-success/20' : 'bg-[#ecfdf5]') : (isDark ? 'bg-warning/20' : 'bg-[#fff7ed]')}`}>
                      <Text className={`text-[13px] font-bold ${ch.avg_accuracy > 70 ? (isDark ? '#34d399' : '#059669') : (isDark ? '#fbbf24' : '#d97706')}`}>
                        {ch.avg_accuracy}%
                      </Text>
                    </View>
                  </View>
                  <Text className="flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{ch.active_students}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

   if (loading && !systemOverview && studentsData.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
        <Text className="mt-4 text-base font-semibold text-textSecondary-light dark:text-textSecondary-dark">Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient colors={isDark ? ["#0f172a", "#1e293b"] : ["#f8fafc", "#f1f5f9"]} className="flex-1">
        <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
          <View className="px-6 pt-10 pb-5 flex-row justify-between items-center">
            <View>
              <Text className="text-[32px] font-bold text-text-light dark:text-text-dark tracking-tight">System Analytics</Text>
              <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Comprehensive overview of platform performance and student engagement</Text>
            </View>
            <TouchableOpacity onPress={loadTabContent} className="p-2.5 rounded-[20px] bg-card-light dark:bg-card-dark shadow-sm border border-divider-light dark:border-divider-dark">
              <Ionicons name="refresh" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          </View>

          <View className="bg-background-light dark:bg-background-dark pb-2.5">
            {renderTabs()}
          </View>

          <View className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'courses' && renderCourses()}
            {activeTab === 'logs' && renderLogs()}
          </View>
        </ScrollView>
        {renderCourseDetailsModal()}
      </LinearGradient>
    </View>
  );
}
