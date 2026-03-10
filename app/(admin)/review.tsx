import MCQReviewCard from '@/components/Dashboard/Cards/MCQReviewCard';
import { Course } from '@/models/Course';
import { MCQ } from '@/models/MCQ';
import { listCourses } from '@/services/course.service';
import { approveMCQ, fetchMCQs, rejectMCQ, updateMCQ } from '@/services/mcq.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        className="flex-1"
      >
        <View className="px-6 pt-8 pb-5 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
          <Text className="text-[28px] font-bold text-text-light dark:text-text-dark mb-1">MCQ Review</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">Manage and validate course questions</Text>
        </View>

        <View className="flex-1 flex-row">
          {/* Course Sidebar */}
          <View className="w-[280px] bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4">
            <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] uppercase mb-4 px-2">Courses</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courses.map((course) => {
                const isActive = selectedCourseId === course.course_id;
                return (
                  <TouchableOpacity
                    key={course.course_id}
                    className={`flex-row items-center p-3 rounded-xl gap-3 mb-1 ${isActive ? "bg-[#f0f4ff]" : ""}`}
                    onPress={() => setSelectedCourseId(course.course_id)}
                  >
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={20}
                      color={isActive ? '#667eea' : '#64748b'}
                    />
                    <Text className={`text-sm flex-1 ${isActive ? "color-[#667eea] font-semibold" : "text-textSecondary-light dark:text-textSecondary-dark font-medium"}`}>
                      {course.course_name || course.course_id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* MCQ List */}
          <View className="flex-1">
            {fetchingMcqs ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#667eea" />
                <Text className="mt-3 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">Fetching questions...</Text>
              </View>
            ) : mcqs.length > 0 ? (
              <ScrollView
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark">{mcqs.length} questions pending review</Text>
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
              <View className="flex-1 justify-center items-center gap-3">
                <MaterialCommunityIcons name="check-all" size={64} color="#cbd5e1" />
                <Text className="text-xl font-bold text-textSecondary-light dark:text-textSecondary-dark">All caught up!</Text>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark text-center">No MCQs pending review for this course.</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
