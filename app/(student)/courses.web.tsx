import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Course } from "@/models/Course";
import { listCourses } from "@/services/course.service";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
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
      <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore Courses</Text>
          <Text style={styles.subtitle}>
            Select a course to continue learning
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.course_id}
                style={styles.courseCard}
                onPress={() =>
                  router.push(`/(student)/course/${course.course_id}`)
                }
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={24}
                      color="#667eea"
                    />
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#cbd5e1"
                  />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.courseName}>{course.course_name}</Text>
                  <Text style={styles.courseId}>{course.course_id}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="layers-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.statText}>
                      {course.units || 0} Units
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="book-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.statText}>
                      {course.chapters || 0} Chapters
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default StudentCoursesPage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  scrollContent: { padding: 24 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  courseCard: {
    width: "30%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { marginBottom: 16 },
  courseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  courseId: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
});
