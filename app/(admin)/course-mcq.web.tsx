import { Course } from '@/models/Course';
import { MCQ } from '@/models/MCQ';
import { fetchCourseStructure, listCourses } from '@/services/course.service';
import { addMCQToBackend, deleteMCQ, fetchMCQsByChapter, updateMCQ } from '@/services/mcq.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CourseMCQPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchingStructure, setFetchingStructure] = useState(false);
    const [saving, setSaving] = useState(false);

    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [editingMcqId, setEditingMcqId] = useState<string | null>(null);
    const [loadingMcqs, setLoadingMcqs] = useState(false);

    // Form State
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadCourseStructure(selectedCourseId);
        } else {
            setChapters([]);
            setSelectedChapterId(null);
            setMcqs([]);
        }
    }, [selectedCourseId]);

    useEffect(() => {
        if (selectedCourseId && selectedChapterId) {
            loadMCQs(selectedCourseId, selectedChapterId);
        } else {
            setMcqs([]);
        }
    }, [selectedCourseId, selectedChapterId]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await listCourses();
            setCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
            Alert.alert('Error', 'Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    const loadCourseStructure = async (courseId: string) => {
        try {
            setFetchingStructure(true);
            const structure = await fetchCourseStructure(courseId);
            console.log('Course Structure API Response:', structure);

            let allChapters: any[] = [];

            if (structure && structure.units && Array.isArray(structure.units)) {
                // Hierarchical Array Format (Units -> Chapters)
                structure.units.forEach((unit: any) => {
                    if (unit.chapters && Array.isArray(unit.chapters)) {
                        unit.chapters.forEach((chapter: any) => {
                            allChapters.push({
                                id: chapter.chapterId || chapter.chapter_id || chapter.id || `ch_${Math.random()}`,
                                name: chapter.chapterTitle || chapter.chapter_name || chapter.title || chapter.name || 'Unnamed Chapter',
                                unitId: unit.unitId || unit.unit_id || ''
                            });
                        });
                    }
                });
            } else if (structure && typeof structure === 'object') {
                // Object Format (e.g. { "UnitName": { "ChapterID": { ... } } })
                Object.keys(structure).forEach(unitKey => {
                    const unitVal = structure[unitKey];
                    if (unitVal && typeof unitVal === 'object') {
                        // Check if it has a chapters array anyway
                        if (unitVal.chapters && Array.isArray(unitVal.chapters)) {
                            unitVal.chapters.forEach((chapter: any) => {
                                allChapters.push({
                                    id: chapter.chapterId || chapter.chapter_id || chapter.id || `ch_${Math.random()}`,
                                    name: chapter.chapterTitle || chapter.chapter_name || chapter.title || chapter.name || 'Unnamed Chapter',
                                    unitId: unitVal.unitId || unitKey
                                });
                            });
                        } else {
                            // Direct key-value chapters
                            Object.keys(unitVal).forEach(chapterKey => {
                                if (chapterKey !== 'unitId' && chapterKey !== 'unitTitle') {
                                    const chapterVal = unitVal[chapterKey];
                                    allChapters.push({
                                        id: chapterKey,
                                        name: chapterVal.chapterId || chapterVal.chapterTitle || chapterVal.chapter_name || chapterKey || 'Unnamed Chapter',
                                        unitId: unitKey
                                    });
                                }
                            });
                        }
                    }
                });
            }

            setChapters(allChapters);
            console.log('Processed Chapters List:', allChapters);

            if (allChapters.length > 0) {
                // Check if the current selectedChapterId is still valid in the new course
                const isStillValid = allChapters.some(c => c.id === selectedChapterId);
                if (!isStillValid) {
                    setSelectedChapterId(allChapters[0].id);
                }
            } else {
                setSelectedChapterId(null);
            }
        } catch (error) {
            console.error('Error loading structure:', error);
            Alert.alert('Error', 'Failed to load chapter structure. Check console for details.');
        } finally {
            setFetchingStructure(false);
        }
    };

    const loadMCQs = async (courseId: string, chapterId: string) => {
        try {
            setLoadingMcqs(true);
            const data = await fetchMCQsByChapter(courseId, chapterId);
            setMcqs(data || []);
        } catch (error) {
            console.error('Error loading MCQs:', error);
        } finally {
            setLoadingMcqs(false);
        }
    };

    const handleOptionChange = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleEdit = (mcq: MCQ) => {
        setEditingMcqId(mcq.mcqId || null);
        setQuestion(mcq.Question);
        setOptions([...mcq.Options]);
        setCorrectIndex(mcq.AnswerIndex);
        setDifficulty(mcq.Difficulty);
        // Scroll to form (handled by ScrollView usually)
    };

    const handleDelete = async (mcqId: string) => {
        if (!selectedCourseId) return;

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this question?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMCQ(selectedCourseId, mcqId);
                            setMcqs(mcqs.filter(m => m.mcqId !== mcqId));
                            Alert.alert('Success', 'MCQ deleted.');
                        } catch (error) {
                            console.error('Error deleting MCQ:', error);
                            Alert.alert('Error', 'Failed to delete MCQ.');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveMCQ = async () => {
        if (!selectedCourseId || !selectedChapterId) {
            Alert.alert('Error', 'Please select a course and chapter.');
            return;
        }

        if (!question.trim() || options.some(opt => !opt.trim())) {
            Alert.alert('Error', 'Please fill in the question and all options.');
            return;
        }

        const mcqData: MCQ = {
            mcqId: editingMcqId || undefined,
            Question: question,
            Options: options,
            AnswerIndex: correctIndex,
            Difficulty: difficulty,
            KnowledgeId: editingMcqId ? mcqs.find(m => m.mcqId === editingMcqId)?.KnowledgeId || '' : `${selectedCourseId}_${selectedChapterId}_${Date.now()}`,
            Validated: true,
            Reference: {
                Unit: chapters.find(c => c.id === selectedChapterId)?.unitId || '',
                Chapter: selectedChapterId,
                Section: 'General'
            }
        };

        try {
            setSaving(true);
            if (editingMcqId) {
                await updateMCQ(selectedCourseId, editingMcqId, mcqData);
                Alert.alert('Success', 'MCQ updated successfully.');
            } else {
                await addMCQToBackend(selectedCourseId, selectedChapterId, mcqData);
                Alert.alert('Success', 'MCQ added successfully.');
            }

            loadMCQs(selectedCourseId, selectedChapterId);
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectIndex(0);
            setEditingMcqId(null);
            setDifficulty('Medium');
        } catch (error) {
            console.error('Error saving MCQ:', error);
            Alert.alert('Error', 'Failed to save MCQ.');
        } finally {
            setSaving(false);
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
                    <Text style={styles.title}>Add MCQ Questions</Text>
                    <Text style={styles.subtitle}>Select course, chapter and create MCQs</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>1. Target Selection</Text>

                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Course</Text>
                                <View style={styles.selectWrapper}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {courses.map(course => (
                                            <TouchableOpacity
                                                key={course.course_id}
                                                style={[styles.chip, selectedCourseId === course.course_id && styles.chipActive]}
                                                onPress={() => setSelectedCourseId(course.course_id)}
                                            >
                                                <Text style={[styles.chipText, selectedCourseId === course.course_id && styles.chipTextActive]}>
                                                    {course.course_name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>

                        {fetchingStructure ? (
                            <ActivityIndicator size="small" color="#667eea" style={{ marginVertical: 20 }} />
                        ) : selectedCourseId && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Chapter</Text>
                                <View style={styles.selectWrapper}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                                        {chapters.map((chapter, idx) => (
                                            <TouchableOpacity
                                                key={chapter.id || `chapter-${idx}`}
                                                style={[styles.chip, selectedChapterId === chapter.id && styles.chipActive]}
                                                onPress={() => {
                                                    console.log('User selected chapter:', chapter.id);
                                                    setSelectedChapterId(chapter.id);
                                                }}
                                            >
                                                <Text style={[styles.chipText, selectedChapterId === chapter.id && styles.chipTextActive]}>
                                                    {chapter.name || `Chapter ${idx + 1}`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        )}
                    </View>

                    {selectedChapterId && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>{editingMcqId ? 'Edit Question' : '2. Question Details'}</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Question</Text>
                                <TextInput
                                    style={styles.textInput}
                                    multiline
                                    numberOfLines={3}
                                    value={question}
                                    onChangeText={setQuestion}
                                    placeholder="Enter the question here..."
                                />
                            </View>

                            <Text style={styles.label}>Options (Select the correct one)</Text>
                            {options.map((opt, index) => (
                                <View key={index} style={styles.optionRow}>
                                    <TouchableOpacity
                                        style={[styles.radio, correctIndex === index && styles.radioActive]}
                                        onPress={() => setCorrectIndex(index)}
                                    >
                                        {correctIndex === index && <View style={styles.radioInner} />}
                                    </TouchableOpacity>
                                    <TextInput
                                        style={styles.optionInput}
                                        value={opt}
                                        onChangeText={(text) => handleOptionChange(text, index)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                </View>
                            ))}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Difficulty</Text>
                                <View style={styles.difficultyRow}>
                                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[styles.diffBtn, difficulty === level && styles.diffBtnActive, styles[`diff${level}` as keyof typeof styles]]}
                                            onPress={() => setDifficulty(level)}
                                        >
                                            <Text style={[styles.diffText, difficulty === level && styles.diffTextActive]}>{level}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                onPress={handleSaveMCQ}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name={editingMcqId ? "check-circle-outline" : "plus-circle-outline"} size={20} color="#fff" />
                                        <Text style={styles.saveBtnText}>{editingMcqId ? 'Update Question' : 'Add Question'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {editingMcqId && (
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => {
                                        setEditingMcqId(null);
                                        setQuestion('');
                                        setOptions(['', '', '', '']);
                                        setCorrectIndex(0);
                                    }}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {selectedChapterId && !editingMcqId && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Existing Questions</Text>
                            {loadingMcqs ? (
                                <ActivityIndicator size="small" color="#667eea" />
                            ) : mcqs.length === 0 ? (
                                <Text style={styles.emptyText}>No questions found for this chapter.</Text>
                            ) : (
                                <View style={styles.mcqList}>
                                    {mcqs.map((mcq, idx) => (
                                        <View key={mcq.mcqId || idx} style={styles.mcqItem}>
                                            <View style={styles.mcqContent}>
                                                <Text style={styles.mcqQuestion}>{idx + 1}. {mcq.Question}</Text>
                                                <View style={styles.mcqMeta}>
                                                    <View style={[styles.miniBadge, styles[`diff${mcq.Difficulty}` as keyof typeof styles]]}>
                                                        <Text style={styles.miniBadgeText}>{mcq.Difficulty}</Text>
                                                    </View>
                                                    <Text style={styles.optionCount}>{mcq.Options.length} Options</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mcqActions}>
                                                <TouchableOpacity onPress={() => handleEdit(mcq)} style={styles.actionBtn}>
                                                    <MaterialCommunityIcons name="pencil" size={18} color="#667eea" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(mcq.mcqId!)} style={styles.actionBtn}>
                                                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#f56565" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
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
        paddingTop: 40,
        paddingBottom: 24,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: { fontSize: 24, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#718096', fontWeight: '500' },
    scrollContent: { padding: 24, gap: 20 },
    horizontalScrollContent: { paddingRight: 24 },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2d3748', marginBottom: 20 },
    row: { flexDirection: 'row', gap: 16 },
    inputGroup: { marginBottom: 20, width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 8 },
    selectWrapper: { flexDirection: 'row', gap: 10 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#edf2f7',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    chipActive: {
        backgroundColor: '#ebf4ff',
        borderColor: '#667eea',
    },
    chipText: { fontSize: 13, color: '#4a5568', fontWeight: '500' },
    chipTextActive: { color: '#667eea', fontWeight: '600' },
    textInput: {
        backgroundColor: '#f7fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#2d3748',
        textAlignVertical: 'top',
    },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#cbd5e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: { borderColor: '#667eea' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#667eea' },
    optionInput: {
        flex: 1,
        backgroundColor: '#f7fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    difficultyRow: { flexDirection: 'row', gap: 12 },
    diffBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f7fafc',
    },
    diffBtnActive: { borderColor: 'transparent' },
    diffEasy: { borderLeftWidth: 4, borderLeftColor: '#48bb78' },
    diffMedium: { borderLeftWidth: 4, borderLeftColor: '#ed8936' },
    diffHard: { borderLeftWidth: 4, borderLeftColor: '#f56565' },
    diffText: { fontSize: 14, fontWeight: '600', color: '#718096' },
    diffTextActive: { color: '#ffffff' },
    // Overwrite active styles for text color
    diffBtnActive_Easy: { backgroundColor: '#48bb78' },
    diffBtnActive_Medium: { backgroundColor: '#ed8936' },
    diffBtnActive_Hard: { backgroundColor: '#f56565' },
    saveBtn: {
        backgroundColor: '#667eea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        marginTop: 10,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    cancelBtn: {
        marginTop: 10,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelBtnText: { color: '#718096', fontWeight: '600' },
    mcqList: { gap: 16, marginTop: 10 },
    mcqItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    mcqContent: { flex: 1 },
    mcqQuestion: { fontSize: 15, fontWeight: '600', color: '#2d3748', marginBottom: 8 },
    mcqMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    miniBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
    optionCount: { fontSize: 12, color: '#718096' },
    mcqActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    emptyText: { textAlign: 'center', color: '#a0aec0', paddingVertical: 20 },
} as any);

// Inject active level styles
styles.diffBtnActive_Easy = { backgroundColor: '#48bb78' };
styles.diffBtnActive_Medium = { backgroundColor: '#ed8936' };
styles.diffBtnActive_Hard = { backgroundColor: '#f56565' };
