import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Course } from "@/models/Course";
import { listCourses } from "@/services/course.service";
import { useRouter } from "expo-router";

const index = () => {
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
    return <ActivityIndicator size="large" color="#667eea" />;
  }

  return (
    <View style={{padding: 16}}>
      <Text style={{fontSize: 24, fontWeight: "bold"}}>Available Courses</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.course_id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#667eea",
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => router.push(`/course/${item.course_id}`)}
          >
            <Text style={{fontSize: 16, fontWeight: "bold"}}>{item.course_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
