import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import HtmlRenderer from "../../../components/HtmlRenderer";
import { Course } from "../../../models/Course";
import {
    fetchCourseChapterNotes,
    fetchCourseStructure,
    listCourses,
    saveCourseChapterNotes,
} from "../../../services/course.service";

// Dynamically import Monaco Editor for web only
let Editor: any = null;
if (Platform.OS === "web") {
    Editor = require("@monaco-editor/react").default;
}

const NotesEditor = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [fetchingNotes, setFetchingNotes] = useState(false);
    const [xmlStructure, setXmlStructure] = useState<any>(null);
    const [selectedChapterId, setSelectedChapterId] = useState<string>("");

    const [htmlContent, setHtmlContent] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");

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

    const handleCourseChange = async (courseId: string) => {
        setSelectedCourseId(courseId);
        setSelectedChapterId("");
        setHtmlContent("");
        const course = courses.find((c) => c.course_id === courseId);
        if (course) {
            loadCourseStructure(courseId);
        }
    };

    const loadCourseStructure = async (courseId: string) => {
        try {
            setLoading(true);
            const data = await fetchCourseStructure(courseId);
            setXmlStructure(data);
        } catch (error) {
            console.error("Error loading structure:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChapterSelect = async (chapterId: string) => {
        setSelectedChapterId(chapterId);
        if (selectedCourseId) {
            fetchNotes(selectedCourseId, chapterId);
        }
    };

    const fetchNotes = async (courseId: string, chapterId: string) => {
        try {
            setFetchingNotes(true);
            const data = await fetchCourseChapterNotes(courseId, chapterId);
            const content = typeof data === 'string' ? data : data?.notes || "";
            setHtmlContent(content);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setHtmlContent("");
            Alert.alert("Notice", "No existing notes found for this chapter or failed to fetch.");
        } finally {
            setFetchingNotes(false);
        }
    };

    const handleSave = async () => {
        if (!selectedCourseId || !selectedChapterId) {
            Alert.alert("Error", "Please select a course and chapter first.");
            return;
        }

        try {
            setLoading(true);
            await saveCourseChapterNotes(selectedCourseId, selectedChapterId, htmlContent);
            Alert.alert("Success", "Notes updated successfully!");
        } catch (error) {
            console.error("Error saving notes:", error);
            Alert.alert("Error", "Failed to save notes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${Platform.OS === "web" ? "flex-row" : "flex-col"} bg-background-light dark:bg-background-dark`}>
            {/* Sidebar - Course & Chapter Selection */}
            <View className={`${Platform.OS === "web" ? "w-[340px]" : "w-full"} bg-card-light dark:bg-card-dark border-r border-divider-light dark:border-divider-dark`}>
                <LinearGradient
                    colors={["#764ba2", "#667eea"]}
                    className="p-6 flex-row items-center gap-3"
                >
                    <MaterialCommunityIcons
                        name="file-document-edit"
                        size={24}
                        color="white"
                    />
                    <Text className="text-xl font-bold color-white">Notes Editor</Text>
                </LinearGradient>

                <ScrollView className="p-4">
                    <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-4 border border-divider-light dark:border-divider-dark">
                        <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Select Course</Text>
                        <View className="border border-divider-light dark:border-divider-dark rounded-lg bg-background-light dark:bg-background-dark mb-4 overflow-hidden">
                            <ScrollView style={{ maxHeight: 200 }}>
                                {courses.map((c) => {
                                    const isActive = selectedCourseId === c.course_id;
                                    return (
                                        <TouchableOpacity
                                            key={c.course_id}
                                            className={`p-3 border-b border-border-light dark:border-border-dark ${isActive ? "bg-[#764ba2]" : ""}`}
                                            onPress={() => handleCourseChange(c.course_id)}
                                        >
                                            <Text
                                                className={`text-[15px] ${isActive ? "color-white font-semibold" : "text-text-light dark:text-text-dark font-normal"}`}
                                            >
                                                {c.course_name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {selectedCourseId && (
                            <>
                                <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Select Chapter</Text>
                                <View className="border border-divider-light dark:border-divider-dark rounded-lg bg-background-light dark:bg-background-dark mb-4 overflow-hidden">
                                    <ScrollView style={{ maxHeight: 350 }}>
                                        {xmlStructure?.units ? (
                                            xmlStructure.units.map((unit: any) => (
                                                <View key={unit.unitId} className="bg-card-light dark:bg-card-dark">
                                                    <View className="flex-row items-center p-2.5 bg-background-light dark:bg-background-dark gap-2">
                                                        <MaterialCommunityIcons name="folder-outline" size={16} color="#64748b" />
                                                        <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark flex-1">{unit.unitTitle}</Text>
                                                    </View>
                                                    {unit.chapters?.map((chapter: any) => {
                                                        const isActive = selectedChapterId === chapter.chapterId;
                                                        return (
                                                            <TouchableOpacity
                                                                key={chapter.chapterId}
                                                                className={`p-3 border-b border-border-light dark:border-border-dark pl-6 border-l-2 border-l-[#e2e8f0] ${isActive ? "bg-[#764ba2]" : ""}`}
                                                                onPress={() => handleChapterSelect(chapter.chapterId)}
                                                            >
                                                                <Text
                                                                    className={`text-[13px] ${isActive ? "color-white font-semibold" : "text-text-light dark:text-text-dark font-normal"}`}
                                                                >
                                                                    {chapter.chapterTitle}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            ))
                                        ) : (
                                            <Text className="p-3 text-textSecondary-light dark:text-textSecondary-dark">
                                                {loading ? "Loading structure..." : "No units found for this course."}
                                            </Text>
                                        )}
                                    </ScrollView>
                                </View>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        className="rounded-lg overflow-hidden mt-2"
                        onPress={handleSave}
                        disabled={loading || fetchingNotes}
                    >
                        <LinearGradient
                            colors={["#10b981", "#059669"]}
                            className="p-3.5 flex-row items-center justify-center gap-2"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="white" />
                                    <Text className="color-white font-bold text-[15px]">Save Changes</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Content - Editor */}
            <View className="flex-[2] bg-background-light dark:bg-background-dark">
                {selectedChapterId ? (
                    <View className="flex-1 bg-[#1e1e1e]">
                        <View className="h-10 bg-[#2d2d2d] flex-row border-b border-[#3d3d3d]">
                            <View className="bg-[#1e1e1e] px-5 justify-center border-t-2 border-[#007acc]">
                                <Text className="color-white text-[13px] font-medium">HTML Editor</Text>
                            </View>
                        </View>

                        <View className="flex-1 bg-[#1e1e1e]">
                            {Platform.OS === "web" && Editor ? (
                                <Editor
                                    height="100%"
                                    defaultLanguage="html"
                                    theme="vs-dark"
                                    value={htmlContent}
                                    onChange={(value: string | undefined) => setHtmlContent(value || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        wordWrap: "on",
                                    }}
                                />
                            ) : (
                                <TextInput
                                    className={`flex-1 color-white p-4 text-sm ${Platform.OS === 'web' ? 'font-mono' : ''}`}
                                    style={{ textAlignVertical: 'top' }}
                                    multiline
                                    value={htmlContent}
                                    onChangeText={setHtmlContent}
                                    placeholder="Paste HTML here (Monaco Editor is only available on Web)"
                                    placeholderTextColor="#666"
                                />
                            )}
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center p-10">
                        <MaterialCommunityIcons name="file-search-outline" size={64} color="#e2e8f0" />
                        <Text className="text-xl font-bold text-textSecondary-light dark:text-textSecondary-dark mt-4">No Chapter Selected</Text>
                        <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark text-center mt-2 max-w-[300px]">Select a course and chapter from the sidebar to start editing notes.</Text>
                    </View>
                )}
            </View>

            {/* Preview Panel */}
            <View className="flex-[1.5] bg-card-light dark:bg-card-dark border-l border-divider-light dark:border-divider-dark">
                <LinearGradient
                    colors={["#f8fafc", "#f1f5f9"]}
                    className="flex-row items-center gap-2 p-4 border-b border-divider-light dark:border-divider-dark"
                >
                    <Ionicons name="eye-outline" size={20} color="#1e293b" />
                    <Text className="font-bold text-text-light dark:text-text-dark text-[15px]">Live Preview</Text>
                </LinearGradient>
                <View className="flex-1">
                    <HtmlRenderer html={htmlContent} />
                </View>
            </View>

            {(loading || fetchingNotes) && (
                <View className="absolute z-50 bg-white/70 items-center justify-center" style={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <ActivityIndicator size="large" color="#764ba2" />
                    <Text className="mt-3 text-base font-semibold text-text-light dark:text-text-dark">
                        {fetchingNotes ? "Fetching Notes..." : "Saving Changes..."}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default NotesEditor;
