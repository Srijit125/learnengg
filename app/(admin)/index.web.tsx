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
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
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
      frontColor: "#4F46E5"
    }));
  }, [globalLogs]);

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
          onPress={() => setActiveTab(tab.id)}
        >
          <MaterialCommunityIcons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.id ? "#667eea" : "#64748b"}
          />
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => (
    <View>
      <View style={styles.statsSection}>
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

      <View style={styles.contentGrid}>
        <View style={styles.leftColumn}>
          <ChartCard title="System Performance Distribution" subtitle="Accuracy levels across all courses">
            <DonutChart
              percentage={systemOverview?.avg_accuracy || 0}
              size={200}
              strokeWidth={24}
              color="#667eea"
              backgroundColor="#e5e7eb"
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
              color="#10b981"
              areaChart
            />
          </ChartCard>
        </View>
        <View style={styles.rightColumn}>
          <ActivityFeed
            activities={(globalLogs || []).slice(0, 8).map(log => ({
              id: log.id,
              topic: `${log.username || 'User'}: ${log.event_type.replace('_', ' ')}`,
              correct: log.metadata?.correct || false,
              difficulty: log.metadata?.difficulty || 'medium',
              timestamp: log.timestamp
            }))}
            maxItems={10}
          />
        </View>
      </View>
    </View>
  );

  const renderStudents = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students by name or ID..."
          value={studentSearch}
          onChangeText={setStudentSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 2 }]}>Student</Text>
          <Text style={styles.colHeader}>Accuracy</Text>
          <Text style={styles.colHeader}>Attempts</Text>
          <Text style={styles.colHeader}>Last Active</Text>
        </View>
        {filteredStudents.map((student, idx) => (
          <View key={student.user_id} style={[styles.tableRow, idx % 2 === 0 && styles.rowAlternate]}>
            <View style={{ flex: 2 }}>
              <Text style={styles.studentName}>{student.username || 'N/A'}</Text>
              <Text style={styles.studentId}>{student.user_id}</Text>
            </View>
            <Text style={styles.colValue}>{student.accuracy}%</Text>
            <Text style={styles.colValue}>{student.total_attempts}</Text>
            <Text style={styles.colValue}>{new Date(student.last_active).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCourses = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsSection}>
        {coursesStats.map(course => (
          <View key={course.id} style={styles.courseStatCard}>
            <View style={styles.courseHeader}>
              <MaterialCommunityIcons name="book-outline" size={24} color="#667eea" />
              <Text style={styles.courseTitle}>{course.name}</Text>
            </View>
            <View style={styles.courseMetrics}>
              <View style={styles.metricMini}>
                <Text style={styles.metricLabel}>Students</Text>
                <Text style={styles.metricValue}>{course.active_students}</Text>
              </View>
              <View style={styles.metricMini}>
                <Text style={styles.metricLabel}>Avg Accuracy</Text>
                <Text style={styles.metricValue}>{course.avg_accuracy}%</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => handleViewChapters(course.id)}
            >
              <Text style={styles.viewDetailText}>View Chapters</Text>
              <Ionicons name="arrow-forward" size={14} color="#667eea" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ChartCard title="Course Performance Comparison" subtitle="Avg accuracy across all enrolled courses">
        <EnhancedBarChart
          data={coursesStats.map(c => ({
            label: c.name,
            value: c.avg_accuracy,
            frontColor: "#667eea"
          }))}
          barWidth={60}
          height={300}
        />
      </ChartCard>
    </View>
  );

  const renderLogs = () => (
    <View style={styles.tabContent}>
      <ChartCard title="Study Pattern Distribution" subtitle="Event types captured in study logs">
        <EnhancedBarChart
          data={logsDistribution}
          barWidth={50}
          height={250}
        />
      </ChartCard>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Global Study Audit Log</Text>
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{selectedCourseDetails?.course_name || 'Loading Details...'}</Text>
              <Text style={styles.modalSubtitle}>Chapter-level performance breakdown</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCourseDetails(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loadingDetails ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.modalLoadingText}>Analyzing chapter data...</Text>
            </View>
          ) : (
            <ScrollView style={styles.chapterList}>
              <View style={styles.chapterTableHeader}>
                <Text style={[styles.chapterColHeader, { flex: 2 }]}>Chapter</Text>
                <Text style={styles.chapterColHeader}>Unit</Text>
                <Text style={styles.chapterColHeader}>Accuracy</Text>
                <Text style={styles.chapterColHeader}>Students</Text>
              </View>
              {selectedCourseDetails?.chapters?.map((ch: any, idx: number) => (
                <View key={idx} style={[styles.chapterRow, idx % 2 === 0 && styles.rowAlternate]}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.chapterName}>{ch.chapter}</Text>
                  </View>
                  <Text style={styles.chapterUnit}>{ch.unit}</Text>
                  <View style={styles.accuracyPillContainer}>
                    <View style={[styles.accuracyPill, { backgroundColor: ch.avg_accuracy > 70 ? '#ecfdf5' : '#fff7ed' }]}>
                      <Text style={[styles.accuracyPillText, { color: ch.avg_accuracy > 70 ? '#059669' : '#d97706' }]}>
                        {ch.avg_accuracy}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.chapterValue}>{ch.active_students}</Text>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
        <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>System Analytics</Text>
              <Text style={styles.subtitle}>Comprehensive overview of platform performance and student engagement</Text>
            </View>
            <TouchableOpacity onPress={loadTabContent} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: "#f1f5f9", paddingBottom: 10 }}>
            {renderTabs()}
          </View>

          <View style={styles.mainContent}>
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
  refreshBtn: { padding: 10, borderRadius: 20, backgroundColor: 'white', elevation: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTabItem: { backgroundColor: '#f0f4ff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#667eea' },
  mainContent: { padding: 24 },
  statsSection: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  contentGrid: { flexDirection: 'row', gap: 24 },
  leftColumn: { flex: 2, gap: 24 },
  rightColumn: { flex: 1, minWidth: 350 },
  tabContent: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' },
  tableCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  colHeader: { flex: 1, fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowAlternate: { backgroundColor: '#f8fafc' },
  studentName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  studentId: { fontSize: 12, color: '#94a3b8' },
  colValue: { flex: 1, fontSize: 14, color: '#475569', fontWeight: '500' },
  courseStatCard: {
    width: (Dimensions.get('window').width - 80) / 3,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    gap: 16,
  },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 },
  courseMetrics: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  metricMini: { alignItems: 'center' },
  metricLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  viewDetailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 10 },
  viewDetailText: { fontSize: 14, fontWeight: '600', color: '#667eea' },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "600", color: "#64748b" },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '80%',
    maxWidth: 900,
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  modalSubtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  closeBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f8fafc' },
  modalLoading: { padding: 60, alignItems: 'center' },
  modalLoadingText: { marginTop: 16, fontSize: 15, color: '#64748b' },
  chapterList: { padding: 24 },
  chapterTableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  chapterColHeader: { flex: 1, fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chapterName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  chapterUnit: { flex: 1, fontSize: 13, color: '#64748b' },
  accuracyPillContainer: { flex: 1 },
  accuracyPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  accuracyPillText: { fontSize: 13, fontWeight: '700' },
  chapterValue: { flex: 1, fontSize: 14, color: '#475569', fontWeight: '500' },
});
