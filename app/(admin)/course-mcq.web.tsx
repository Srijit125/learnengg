import { Course } from '@/models/Course';
import { MCQ } from '@/models/MCQ';
import { fetchCourseStructure, listCourses } from '@/services/course.service';
import { addMCQToBackend, deleteMCQ, fetchMCQsByChapter, updateMCQ } from '@/services/mcq.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <LinearGradient colors={['#f8fafc', '#f1f5f9']} className="flex-1">
                <View className="px-6 pt-10 pb-6 bg-card-light dark:bg-card-dark border-b border-divider-light dark:border-divider-dark">
                    <Text className="text-2xl font-bold color-[#1a202c] mb-1">Add MCQ Questions</Text>
                    <Text className="text-sm font-medium color-[#718096]">Select course, chapter and create MCQs</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
                    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-md shadow-[#000]/5 border border-transparent">
                        <Text className="text-lg font-semibold color-[#2d3748] mb-5">1. Target Selection</Text>

                        <View className="flex-row gap-4">
                            <View className="mb-5 w-full">
                                <Text className="text-sm font-semibold color-[#4a5568] mb-2">Select Course</Text>
                                <View className="flex-row gap-2.5">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {courses.map(course => {
                                            const isActive = selectedCourseId === course.course_id;
                                            return (
                                                <TouchableOpacity
                                                    key={course.course_id}
                                                    className={`px-4 py-2 rounded-full mr-2 border ${isActive ? "bg-[#ebf4ff] border-[#667eea]" : "bg-[#edf2f7] border-divider-light dark:border-divider-dark"}`}
                                                    onPress={() => setSelectedCourseId(course.course_id)}
                                                >
                                                    <Text className={`text-[13px] ${isActive ? "color-[#667eea] font-semibold" : "color-[#4a5568] font-medium"}`}>
                                                        {course.course_name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>

                        {fetchingStructure ? (
                            <ActivityIndicator size="small" color="#667eea" className="my-5" />
                        ) : selectedCourseId && (
                            <View className="mb-5 w-full">
                                <Text className="text-sm font-semibold color-[#4a5568] mb-2">Select Chapter</Text>
                                <View className="flex-row gap-2.5">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
                                        {chapters.map((chapter, idx) => {
                                            const isActive = selectedChapterId === chapter.id;
                                            return (
                                                <TouchableOpacity
                                                    key={chapter.id || `chapter-${idx}`}
                                                    className={`px-4 py-2 rounded-full mr-2 border ${isActive ? "bg-[#ebf4ff] border-[#667eea]" : "bg-[#edf2f7] border-divider-light dark:border-divider-dark"}`}
                                                    onPress={() => {
                                                        console.log('User selected chapter:', chapter.id);
                                                        setSelectedChapterId(chapter.id);
                                                    }}
                                                >
                                                    <Text className={`text-[13px] ${isActive ? "color-[#667eea] font-semibold" : "color-[#4a5568] font-medium"}`}>
                                                        {chapter.name || `Chapter ${idx + 1}`}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                        )}
                    </View>

                    {selectedChapterId && (
                        <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-md shadow-[#000]/5 border border-transparent">
                            <Text className="text-lg font-semibold color-[#2d3748] mb-5">{editingMcqId ? 'Edit Question' : '2. Question Details'}</Text>

                            <View className="mb-5 w-full">
                                <Text className="text-sm font-semibold color-[#4a5568] mb-2">Question</Text>
                                <TextInput
                                    className="bg-[#f7fafc] border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] color-[#2d3748]"
                                    style={{ textAlignVertical: 'top' }}
                                    multiline
                                    numberOfLines={3}
                                    value={question}
                                    onChangeText={setQuestion}
                                    placeholder="Enter the question here..."
                                />
                            </View>

                            <Text className="text-sm font-semibold color-[#4a5568] mb-2">Options (Select the correct one)</Text>
                            {options.map((opt, index) => (
                                <View key={index} className="flex-row items-center gap-3 mb-3">
                                    <TouchableOpacity
                                        className={`w-[22px] h-[22px] rounded-full border-2 justify-center items-center ${correctIndex === index ? "border-[#667eea]" : "border-[#cbd5e0]"}`}
                                        onPress={() => setCorrectIndex(index)}
                                    >
                                        {correctIndex === index && <View className="w-3 h-3 rounded-full bg-[#667eea]" />}
                                    </TouchableOpacity>
                                    <TextInput
                                        className="flex-1 bg-[#f7fafc] border border-divider-light dark:border-divider-dark rounded-lg p-2.5 text-sm"
                                        value={opt}
                                        onChangeText={(text) => handleOptionChange(text, index)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                </View>
                            ))}

                            <View className="mb-5 w-full mt-2">
                                <Text className="text-sm font-semibold color-[#4a5568] mb-2">Difficulty</Text>
                                <View className="flex-row gap-3">
                                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                                        const isActive = difficulty === level;

                                        // Colors based on difficulty
                                        let borderColor = '';
                                        let activeBgColor = '';
                                        if (level === 'Easy') {
                                            borderColor = 'border-l-[#48bb78]';
                                            activeBgColor = 'bg-[#48bb78]';
                                        } else if (level === 'Medium') {
                                            borderColor = 'border-l-[#ed8936]';
                                            activeBgColor = 'bg-[#ed8936]';
                                        } else if (level === 'Hard') {
                                            borderColor = 'border-l-[#f56565]';
                                            activeBgColor = 'bg-[#f56565]';
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={level}
                                                className={`flex-1 py-2.5 rounded-lg items-center border border-divider-light dark:border-divider-dark border-l-4 ${borderColor} ${isActive ? `border-transparent ${activeBgColor}` : "bg-[#f7fafc]"}`}
                                                onPress={() => setDifficulty(level)}
                                            >
                                                <Text className={`text-sm font-semibold ${isActive ? "color-white" : "color-[#718096]"}`}>{level}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <TouchableOpacity
                                className={`flex-row items-center justify-center py-3.5 rounded-xl gap-2.5 mt-2.5 bg-[#667eea] shadow-md shadow-[#667eea]/30 ${saving ? "opacity-70" : ""}`}
                                onPress={handleSaveMCQ}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name={editingMcqId ? "check-circle-outline" : "plus-circle-outline"} size={20} color="#fff" />
                                        <Text className="color-white text-base font-bold">{editingMcqId ? 'Update Question' : 'Add Question'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {editingMcqId && (
                                <TouchableOpacity
                                    className="mt-2.5 py-3 rounded-lg items-center border border-divider-light dark:border-divider-dark"
                                    onPress={() => {
                                        setEditingMcqId(null);
                                        setQuestion('');
                                        setOptions(['', '', '', '']);
                                        setCorrectIndex(0);
                                    }}
                                >
                                    <Text className="color-[#718096] font-semibold">Cancel Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {selectedChapterId && !editingMcqId && (
                        <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-md shadow-[#000]/5 border border-transparent">
                            <Text className="text-lg font-semibold color-[#2d3748] mb-5">Existing Questions</Text>
                            {loadingMcqs ? (
                                <ActivityIndicator size="small" color="#667eea" />
                            ) : mcqs.length === 0 ? (
                                <Text className="text-center color-[#a0aec0] py-5">No questions found for this chapter.</Text>
                            ) : (
                                <View className="gap-4 mt-2.5">
                                    {mcqs.map((mcq, idx) => {
                                        let badgeColor = '';
                                        if (mcq.Difficulty === 'Easy') badgeColor = 'bg-[#48bb78]';
                                        else if (mcq.Difficulty === 'Medium') badgeColor = 'bg-[#ed8936]';
                                        else if (mcq.Difficulty === 'Hard') badgeColor = 'bg-[#f56565]';

                                        return (
                                            <View key={mcq.mcqId || idx} className="flex-row p-4 bg-background-light dark:bg-background-dark rounded-xl border border-divider-light dark:border-divider-dark gap-3">
                                                <View className="flex-1">
                                                    <Text className="text-[15px] font-semibold color-[#2d3748] mb-2">{idx + 1}. {mcq.Question}</Text>
                                                    <View className="flex-row items-center gap-3">
                                                        <View className={`px-2 py-0.5 rounded ${badgeColor}`}>
                                                            <Text className="text-[11px] font-bold color-white uppercase">{mcq.Difficulty}</Text>
                                                        </View>
                                                        <Text className="text-xs color-[#718096]">{mcq.Options.length} Options</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row gap-2">
                                                    <TouchableOpacity onPress={() => handleEdit(mcq)} className="w-9 h-9 rounded-full bg-card-light dark:bg-card-dark justify-center items-center border border-divider-light dark:border-divider-dark">
                                                        <MaterialCommunityIcons name="pencil" size={18} color="#667eea" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDelete(mcq.mcqId!)} className="w-9 h-9 rounded-full bg-card-light dark:bg-card-dark justify-center items-center border border-divider-light dark:border-divider-dark">
                                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#f56565" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
