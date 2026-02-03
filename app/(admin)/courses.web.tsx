import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { listCourses, getCourseSummary } from '@/services/course.service';
import { fetchCourseXML, saveCourseXML, validateXML } from '@/services/xml.service';
import { Course } from '@/models/Course';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Tab = 'summary' | 'xml';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  
  const [summary, setSummary] = useState<any>(null);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await listCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].course_id);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      setFetchingData(true);
      const [summaryData, xmlData] = await Promise.all([
        getCourseSummary(courseId),
        fetchCourseXML(courseId)
      ]);
      setSummary(summaryData);
      setXmlContent(xmlData);
      console.log(summaryData);
      console.log(xmlData);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSaveXML = async () => {
    if (!selectedCourseId) return;
    try {
      setSaving(true);
      await saveCourseXML(selectedCourseId, xmlContent);
      alert('Success: XML saved successfully.');
    } catch (error) {
      console.error('Error saving XML:', error);
      alert('Error: Failed to save XML.');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateXML = async () => {
    try {
      setValidating(true);
      const result = await validateXML(xmlContent);
      if (result.valid) {
        alert('Validation Success: XML is valid.');
      } else {
        alert(`Validation Error: ${result.message || 'Invalid XML structure.'}`);
      }
    } catch (error) {
      console.error('Error validating XML:', error);
      alert('Error: Validation service unavailable.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.title}>Course Management</Text>
          <Text style={styles.subtitle}>Configure course metadata and content</Text>
        </View>

        <View style={styles.content}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Available Courses</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.course_id}
                  style={[
                    styles.courseItem,
                    selectedCourseId === course.course_id && styles.courseItemActive
                  ]}
                  onPress={() => setSelectedCourseId(course.course_id)}
                >
                  <MaterialCommunityIcons 
                    name="book-open-outline" 
                    size={20} 
                    color={selectedCourseId === course.course_id ? '#667eea' : '#64748b'} 
                  />
                  <Text style={[
                    styles.courseName,
                    selectedCourseId === course.course_id && styles.courseNameActive
                  ]}>
                    {course.course_name || course.course_id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Main Area */}
          <View style={styles.mainContent}>
            {fetchingData ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#667eea" />
              </View>
            ) : selectedCourseId ? (
              <View style={styles.dataContainer}>
                {/* Tabs */}
                <View style={styles.tabBar}>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
                    onPress={() => setActiveTab('summary')}
                  >
                    <MaterialCommunityIcons name="text-box-outline" size={18} color={activeTab === 'summary' ? '#667eea' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>Summary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'xml' && styles.activeTab]}
                    onPress={() => setActiveTab('xml')}
                  >
                    <MaterialCommunityIcons name="xml" size={18} color={activeTab === 'xml' ? '#667eea' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'xml' && styles.activeTabText]}>XML Editor</Text>
                  </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                  {activeTab === 'summary' ? (
                    <ScrollView contentContainerStyle={styles.summaryContainer}>
                      <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Course ID</Text>
                        <Text style={styles.summaryValue}>{selectedCourseId}</Text>
                        
                        <View style={styles.divider} />
                        
                        <Text style={styles.summaryLabel}>Course Name</Text>
                        <Text style={styles.summaryValue}>{summary?.course_name || 'No description available.'}</Text>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.statsRow}>
                          
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Units</Text>
                            <Text style={styles.statValue}>{summary?.units || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Chapters</Text>
                            <Text style={styles.statValue}>{summary?.chapters || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Glossary</Text>
                            <Text style={styles.statValue}>{summary?.glossary_terms || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Solved Problems</Text>
                            <Text style={styles.statValue}>{summary?.solved_problems || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Topics</Text>
                            <Text style={styles.statValue}>{summary?.topics || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Question Bank</Text>
                            <Text style={styles.statValue}>{summary?.questions || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Images</Text>
                            <Text style={styles.statValue}>{summary?.images || 0}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Videos</Text>
                            <Text style={styles.statValue}>{summary?.videos || 0}</Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  ) : (
                    <View style={styles.editorContainer}>
                      <View style={styles.editorHeader}>
                        <View style={styles.editorActions}>
                          <TouchableOpacity 
                            style={[styles.btn, styles.btnSecondary]} 
                            onPress={handleValidateXML}
                            disabled={validating}
                          >
                            {validating ? <ActivityIndicator size="small" color="#64748b" /> : <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#64748b" />}
                            <Text style={styles.btnTextSecondary}>Validate</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.btn, styles.btnPrimary]} 
                            onPress={handleSaveXML}
                            disabled={saving}
                          >
                            {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <MaterialCommunityIcons name="content-save-outline" size={18} color="#ffffff" />}
                            <Text style={styles.btnTextPrimary}>Save Changes</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TextInput
                        style={styles.xmlInput}
                        value={xmlContent}
                        onChangeText={setXmlContent}
                        multiline
                        numberOfLines={30}
                        spellCheck={false}
                        autoCapitalize="none"
                        placeholder="XML Content"
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="book-search" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Select a course to manage</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  content: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
    marginBottom: 4,
  },
  courseItemActive: { backgroundColor: '#f0f4ff' },
  courseName: { fontSize: 14, fontWeight: '500', color: '#64748b', flex: 1 },
  courseNameActive: { color: '#667eea', fontWeight: '600' },
  mainContent: { flex: 1 },
  dataContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#667eea' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#667eea' },
  tabContent: { flex: 1 },
  summaryContainer: { padding: 24 },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
  summaryValue: { fontSize: 16, color: '#1e293b', lineHeight: 24, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 32 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#667eea' },
  editorContainer: { flex: 1, backgroundColor: '#ffffff' },
  editorHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  editorActions: { flexDirection: 'row', gap: 12 },
  xmlInput: {
    flex: 1,
    padding: 20,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#334155',
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  btnPrimary: { backgroundColor: '#667eea' },
  btnSecondary: { backgroundColor: '#f1f5f9' },
  btnTextPrimary: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  btnTextSecondary: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: '500' },
});
