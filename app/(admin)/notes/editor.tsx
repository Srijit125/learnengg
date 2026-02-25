import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
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
            // data might be { html: "..." } or similar
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
        <View style={styles.container}>
            {/* Sidebar - Course & Chapter Selection */}
            <View style={styles.sidebar}>
                <LinearGradient
                    colors={["#764ba2", "#667eea"]}
                    style={styles.sidebarHeaderGradient}
                >
                    <MaterialCommunityIcons
                        name="file-document-edit"
                        size={24}
                        color="white"
                    />
                    <Text style={styles.sidebarHeader}>Notes Editor</Text>
                </LinearGradient>

                <ScrollView style={styles.sidebarScroll}>
                    <View style={styles.card}>
                        <Text style={styles.label}>Select Course</Text>
                        <View style={styles.pickerWrapper}>
                            <ScrollView style={{ maxHeight: 200 }}>
                                {courses.map((c) => (
                                    <TouchableOpacity
                                        key={c.course_id}
                                        style={[
                                            styles.optionItem,
                                            selectedCourseId === c.course_id && styles.activeOption,
                                        ]}
                                        onPress={() => handleCourseChange(c.course_id)}
                                    >
                                        <Text
                                            style={{
                                                color: selectedCourseId === c.course_id ? "white" : "#1e293b",
                                                fontWeight: selectedCourseId === c.course_id ? "600" : "400",
                                            }}
                                        >
                                            {c.course_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {selectedCourseId && (
                            <>
                                <Text style={styles.label}>Select Chapter</Text>
                                <View style={styles.pickerWrapper}>
                                    <ScrollView style={{ maxHeight: 350 }}>
                                        {xmlStructure?.units ? (
                                            xmlStructure.units.map((unit: any) => (
                                                <View key={unit.unitId} style={styles.unitSection}>
                                                    <View style={styles.unitHeaderRow}>
                                                        <MaterialCommunityIcons name="folder-outline" size={16} color="#64748b" />
                                                        <Text style={styles.unitLabel}>{unit.unitTitle}</Text>
                                                    </View>
                                                    {unit.chapters?.map((chapter: any) => (
                                                        <TouchableOpacity
                                                            key={chapter.chapterId}
                                                            style={[
                                                                styles.optionItem,
                                                                styles.chapterIndent,
                                                                selectedChapterId === chapter.chapterId && styles.activeOption,
                                                            ]}
                                                            onPress={() => handleChapterSelect(chapter.chapterId)}
                                                        >
                                                            <Text
                                                                style={{
                                                                    color: selectedChapterId === chapter.chapterId ? "white" : "#1e293b",
                                                                    fontWeight: selectedChapterId === chapter.chapterId ? "600" : "400",
                                                                    fontSize: 13,
                                                                }}
                                                            >
                                                                {chapter.chapterTitle}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={{ padding: 12, color: "#94a3b8" }}>
                                                {loading ? "Loading structure..." : "No units found for this course."}
                                            </Text>
                                        )}
                                    </ScrollView>
                                </View>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={loading || fetchingNotes}
                    >
                        <LinearGradient
                            colors={["#10b981", "#059669"]}
                            style={styles.btnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="white" />
                                    <Text style={styles.btnText}>Save Changes</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Content - Editor */}
            <View style={styles.main}>
                {selectedChapterId ? (
                    <View style={styles.editorContainer}>
                        <View style={styles.editorTabs}>
                            <View style={styles.activeTab}>
                                <Text style={styles.tabText}>HTML Editor</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1, backgroundColor: "#1e1e1e" }}>
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
                                    style={styles.mobileTextArea}
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
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="file-search-outline" size={64} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>No Chapter Selected</Text>
                        <Text style={styles.emptySubtitle}>Select a course and chapter from the sidebar to start editing notes.</Text>
                    </View>
                )}
            </View>

            {/* Preview Panel */}
            <View style={styles.preview}>
                <LinearGradient
                    colors={["#f8fafc", "#f1f5f9"]}
                    style={styles.previewHeader}
                >
                    <Ionicons name="eye-outline" size={20} color="#1e293b" />
                    <Text style={styles.previewHeaderText}>Live Preview</Text>
                </LinearGradient>
                <View style={styles.previewContent}>
                    <HtmlRenderer html={htmlContent} />
                </View>
            </View>

            {(loading || fetchingNotes) && (
                <View style={styles.globalLoading}>
                    <ActivityIndicator size="large" color="#764ba2" />
                    <Text style={styles.loadingText}>
                        {fetchingNotes ? "Fetching Notes..." : "Saving Changes..."}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default NotesEditor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: Platform.OS === "web" ? "row" : "column",
        backgroundColor: "#f8fafc",
    },
    sidebar: {
        width: Platform.OS === "web" ? 340 : "100%",
        backgroundColor: "white",
        borderRightWidth: 1,
        borderRightColor: "#e2e8f0",
    },
    sidebarHeaderGradient: {
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sidebarHeader: {
        fontSize: 20,
        fontWeight: "700",
        color: "white",
    },
    sidebarScroll: {
        padding: 16,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        backgroundColor: "#f8fafc",
        marginBottom: 16,
        overflow: "hidden",
    },
    optionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    unitSection: {
        backgroundColor: "#ffffff",
    },
    unitHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#f1f5f9",
        gap: 8,
    },
    unitLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        flex: 1,
    },
    chapterIndent: {
        paddingLeft: 24,
        borderLeftWidth: 2,
        borderLeftColor: "#e2e8f0",
    },
    activeOption: {
        backgroundColor: "#764ba2",
    },
    saveBtn: {
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 8,
    },
    btnGradient: {
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    btnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
    main: {
        flex: 2,
        backgroundColor: "#f1f5f9",
    },
    editorContainer: {
        flex: 1,
        backgroundColor: "#1e1e1e",
    },
    editorTabs: {
        height: 40,
        backgroundColor: "#2d2d2d",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#3d3d3d",
    },
    activeTab: {
        backgroundColor: "#1e1e1e",
        paddingHorizontal: 20,
        justifyContent: "center",
        borderTopWidth: 2,
        borderTopColor: "#007acc",
    },
    tabText: {
        color: "white",
        fontSize: 13,
        fontWeight: "500",
    },
    mobileTextArea: {
        flex: 1,
        color: "white",
        padding: 16,
        fontFamily: Platform.OS === "web" ? "monospace" : undefined,
        textAlignVertical: "top",
        fontSize: 14,
    },
    preview: {
        flex: 1.5,
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: "#e2e8f0",
    },
    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    previewHeaderText: {
        fontWeight: "700",
        color: "#1e293b",
        fontSize: 15,
    },
    previewContent: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#64748b",
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 8,
        maxWidth: 300,
    },
    globalLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
});
