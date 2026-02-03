import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { listCourses } from '@/services/course.service';
import { fetchMCQs, approveMCQ, rejectMCQ, updateMCQ } from '@/services/mcq.service';
import { Course } from '@/models/Course';
import { MCQ } from '@/models/MCQ';
import MCQReviewCard from '@/components/Dashboard/Cards/MCQReviewCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MCQReviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMcqs, setFetchingMcqs] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadMcqs(selectedCourseId);
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

  const loadMcqs = async (courseId: string) => {
    try {
      setFetchingMcqs(true);
      const data = await fetchMCQs(courseId);
      setMcqs(data);
    } catch (error) {
      console.error('Error loading MCQs:', error);
    } finally {
      setFetchingMcqs(false);
    }
  };

  const handleApprove = async (mcqId: string) => {
    try {
      if (!selectedCourseId) return;
      await approveMCQ(selectedCourseId, mcqId);
      setMcqs(mcqs.filter(m => m.mcqId !== mcqId));
    } catch (error) {
      console.error('Error approving MCQ:', error);
    }
  };

  const handleReject = async (mcqId: string) => {
    try {
      if (!selectedCourseId) return;
      await rejectMCQ(selectedCourseId, mcqId);
      setMcqs(mcqs.filter(m => m.mcqId !== mcqId));
    } catch (error) {
      console.error('Error rejecting MCQ:', error);
    }
  };

  const handleUpdate = async (mcqId: string, updatedFields: Partial<MCQ>) => {
    try {
      if (!selectedCourseId) return;
      await updateMCQ(selectedCourseId, mcqId, updatedFields);
      setMcqs(mcqs.map(m => m.mcqId === mcqId ? { ...m, ...updatedFields } : m));
    } catch (error) {
      console.error('Error updating MCQ:', error);
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
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>MCQ Review</Text>
          <Text style={styles.subtitle}>Manage and validate course questions</Text>
        </View>

        <View style={styles.content}>
          {/* Course Sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Courses</Text>
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
                    name="book-open-variant" 
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

          {/* MCQ List */}
          <View style={styles.mainContent}>
            {fetchingMcqs ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Fetching questions...</Text>
              </View>
            ) : mcqs.length > 0 ? (
              <ScrollView 
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.listHeader}>
                  <Text style={styles.countText}>{mcqs.length} questions pending review</Text>
                </View>
                {mcqs.map((mcq) => (
                  <MCQReviewCard
                    key={mcq.mcqId}
                    mcq={mcq}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onUpdate={handleUpdate}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="check-all" size={64} color="#cbd5e1" />
                <Text style={styles.emptyText}>All caught up!</Text>
                <Text style={styles.emptySubtext}>No MCQs pending review for this course.</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 12,
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
  courseItemActive: {
    backgroundColor: '#f0f4ff',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  courseNameActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  listContainer: {
    padding: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
