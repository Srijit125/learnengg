import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
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
  fetchCourseStructure,
  listCourses,
} from "../../../services/course.service";
import { fetchCourseXML, saveCourseXML } from "../../../services/xml.service";
import { Block, HTMLGenerator, Section } from "../../../utils/htmlGenerator";

const NotesBuilder = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [xmlStructure, setXmlStructure] = useState<any>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [standaloneMode, setStandaloneMode] = useState(false);

  const [chapterTitle, setChapterTitle] = useState("New Note Chapter");
  const [courseName, setCourseName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  // Form states for adding section
  const [secTitle, setSecTitle] = useState("");
  const [secSubtitle, setSecSubtitle] = useState("");
  const [secVideo, setSecVideo] = useState("");

  // Form states for adding block
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [blockType, setBlockType] = useState<Block["type"]>("paragraph");
  const [blockContent, setBlockContent] = useState("");
  const [imageCaption, setImageCaption] = useState("");

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
    setStandaloneMode(false);
    const course = courses.find((c) => c.course_id === courseId);
    if (course) {
      setCourseName(course.course_name);
      loadCourseStructure(courseId);
    }
  };

  const loadCourseStructure = async (courseId: string) => {
    try {
      setLoading(true);
      const data = await fetchCourseStructure(courseId);
      setXmlStructure(data);
      setSelectedChapterId(""); // Reset selected chapter when course changes
    } catch (error) {
      console.error("Error loading structure:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    if (!secTitle.trim()) return;
    const newSec: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: secTitle,
      subtitle: secSubtitle,
      video: secVideo,
      blocks: [],
    };
    setSections([...sections, newSec]);
    setSecTitle("");
    setSecSubtitle("");
    setSecVideo("");
    if (!selectedSectionId) setSelectedSectionId(newSec.id);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const moveSection = (index: number, direction: number) => {
    const newSections = [...sections];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < sections.length) {
      [newSections[index], newSections[newIndex]] = [
        newSections[newIndex],
        newSections[index],
      ];
      setSections(newSections);
    }
  };

  const parseNestedList = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const root: any[] = [];
    const stack: { level: number; children: any[] }[] = [
      { level: 0, children: root },
    ];

    lines.forEach((line) => {
      const indent = line.search(/\S/);
      const level = Math.floor(indent / 2);
      const content = line.trim();

      while (stack.length > 1 && stack[stack.length - 1].level > level) {
        stack.pop();
      }

      const node = { text: content, children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push({ level: level + 1, children: node.children });
    });

    return root;
  };

  const addBlock = () => {
    if (!selectedSectionId || !blockContent.trim()) return;

    let processedContent: any = blockContent;
    if (blockType === "bullets") {
      processedContent = parseNestedList(blockContent);
    } else if (blockType === "numbers") {
      processedContent = blockContent.split("\n").filter((l) => l.trim());
    } else if (blockType === "table") {
      processedContent = blockContent
        .split("\n")
        .map((row) => row.split(",").map((c) => c.trim()));
    } else if (blockType === "image") {
      processedContent = { src: blockContent, caption: imageCaption };
    }

    setSections(
      sections.map((s) => {
        if (s.id === selectedSectionId) {
          return {
            ...s,
            blocks: [
              ...s.blocks,
              {
                id: Math.random().toString(36).substr(2, 9),
                type: blockType,
                content: processedContent,
              },
            ],
          };
        }
        return s;
      }),
    );
    setBlockContent("");
    setImageCaption("");
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) };
        }
        return s;
      }),
    );
  };

  const finalHtml = useMemo(() => {
    let bodyHtml = "";
    sections.forEach((sec, idx) => {
      let sectionBody = "";
      sec.blocks.forEach((block) => {
        switch (block.type) {
          case "paragraph":
            sectionBody += HTMLGenerator.p(block.content);
            break;
          case "bullets":
            sectionBody += HTMLGenerator.bulletList(block.content);
            break;
          case "numbers":
            sectionBody += HTMLGenerator.numberedList(block.content);
            break;
          case "table":
            sectionBody += HTMLGenerator.tableFromMatrix(block.content);
            break;
          case "formula":
            sectionBody += HTMLGenerator.formulaLatex(block.content);
            break;
          case "image":
            sectionBody += HTMLGenerator.img(
              block.content.src,
              block.content.caption,
            );
            break;
          case "video":
            sectionBody += HTMLGenerator.video(block.content);
            break;
        }
      });

      const headerHtml = HTMLGenerator.sectionHeader(sec.title, sec.video, idx);
      const subHeaderHtml = sec.subtitle
        ? HTMLGenerator.subsectionHeader(sec.subtitle)
        : "";

      bodyHtml += `
        <section class="notes-section">
            ${headerHtml}
            ${subHeaderHtml}
            ${sectionBody}
        </section>
      `;
    });

    return HTMLGenerator.assembleHtml(chapterTitle, bodyHtml);
  }, [sections, chapterTitle]);

  const downloadHtml = () => {
    if (Platform.OS === "web") {
      const blob = new Blob([finalHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${chapterTitle.replace(/\s+/g, "_")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const linkToXml = async () => {
    if (!selectedCourseId || !selectedChapterId) {
      Alert.alert(
        "Selection Required",
        "Please select a course and a chapter first.",
      );
      return;
    }

    try {
      setLoading(true);
      const currentXml = await fetchCourseXML(selectedCourseId);

      // Basic injection logic: Find the SCO tag and add <notes url="..."/>
      const filename = `${chapterTitle.replace(/\s+/g, "_")}.html`;
      const notesTag = `<notes url="/notes/${filename}"/>`;

      let updatedXml = currentXml;
      const scoTag = `<${selectedChapterId}>`;
      const closingScoTag = `</${selectedChapterId}>`;

      if (updatedXml.includes(scoTag)) {
        // Find if notes already exists
        const scoContentStart = updatedXml.indexOf(scoTag) + scoTag.length;
        const scoContentEnd = updatedXml.indexOf(closingScoTag);
        const scoContent = updatedXml.substring(scoContentStart, scoContentEnd);

        if (scoContent.includes("<notes")) {
          // Replace existing notes
          updatedXml = updatedXml.replace(/<notes[^>]*\/>/, notesTag);
        } else {
          // Insert after tag open
          updatedXml = updatedXml.replace(
            scoTag,
            `${scoTag}\n\t\t\t${notesTag}`,
          );
        }

        await saveCourseXML(selectedCourseId, updatedXml);
        Alert.alert("Success", "Notes linked to XML successfully!");
      } else {
        Alert.alert("Error", "Could not find the selected chapter in the XML.");
      }
    } catch (error) {
      console.error("Error linking to XML:", error);
      Alert.alert("Error", "Failed to link notes to XML.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${Platform.OS === "web" ? "flex-row" : "flex-col"} bg-background-light dark:bg-background-dark`}>
      {/* Sidebar - Settings */}
      <View className={`${Platform.OS === "web" ? "w-[340px]" : "w-full"} bg-card-light dark:bg-card-dark border-r border-divider-light dark:border-divider-dark`}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          className="p-6 flex-row items-center gap-3"
        >
          <MaterialCommunityIcons
            name="file-document-edit-outline"
            size={24}
            color="white"
          />
          <Text className="text-xl font-bold color-white">Note Builder</Text>
        </LinearGradient>

        <ScrollView className="p-4">
          <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-4 border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5">
            <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Mode Selection</Text>
            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-lg border mb-4 ${standaloneMode ? "bg-[#667eea] border-[#667eea]" : "bg-background-light dark:bg-background-dark border-divider-light dark:border-divider-dark"
                }`}
              onPress={() => {
                setStandaloneMode(!standaloneMode);
                if (!standaloneMode) {
                  setSelectedCourseId("");
                  setSelectedChapterId("");
                }
              }}
            >
              <Ionicons
                name={standaloneMode ? "checkbox" : "square-outline"}
                size={20}
                color={standaloneMode ? "white" : "#64748b"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${standaloneMode ? "color-white" : "text-textSecondary-light dark:text-textSecondary-dark"
                  }`}
              >
                Standalone Mode
              </Text>
            </TouchableOpacity>

            {!standaloneMode && (
              <>
                <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Select Course</Text>
                <View className="border border-divider-light dark:border-divider-dark rounded-lg bg-background-light dark:bg-background-dark mb-4 overflow-hidden">
                  <ScrollView style={{ maxHeight: 150 }}>
                    {courses.map((c) => {
                      const isActive = selectedCourseId === c.course_id;
                      return (
                        <TouchableOpacity
                          key={c.course_id}
                          className={`p-3 border-b border-border-light dark:border-border-dark ${isActive ? "bg-[#667eea]" : ""}`}
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

                <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Link to Chapter/Unit</Text>
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
                                className={`p-3 border-b border-border-light dark:border-border-dark pl-6 border-l-2 border-l-[#e2e8f0] ${isActive ? "bg-[#667eea]" : ""}`}
                                onPress={() => {
                                  setSelectedChapterId(chapter.chapterId);
                                  if (!chapterTitle) setChapterTitle(chapter.chapterTitle);
                                  if (!unitName) setUnitName(unit.unitTitle);
                                }}
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
                        {loading ? "Loading structure..." : "Select a course first"}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </>
            )}
          </View>

          <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-4 border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5">
            <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-3">Metadata</Text>
            <TextInput
              className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4"
              placeholder="Note Chapter Title"
              value={chapterTitle}
              onChangeText={setChapterTitle}
            />
            <TextInput
              className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4"
              placeholder="Unit/Course context"
              value={unitName}
              onChangeText={setUnitName}
            />
          </View>

          <View className="gap-3 mb-10">
            {!standaloneMode && (
              <TouchableOpacity
                className="rounded-lg overflow-hidden"
                onPress={linkToXml}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  className="p-3.5 flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="link" size={18} color="white" />
                  <Text className="color-white font-bold text-sm">Link to XML & Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity className="bg-[#334155] p-3 rounded-lg flex-row items-center justify-center gap-2" onPress={downloadHtml}>
              <Ionicons name="download-outline" size={18} color="white" />
              <Text className="color-white font-bold text-sm">Download HTML Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#ef4444] p-3 rounded-lg flex-row items-center justify-center gap-2"
              onPress={() => {
                Alert.alert(
                  "Clear All",
                  "Are you sure you want to clear all blocks?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      onPress: () => setSections([]),
                      style: "destructive",
                    },
                  ],
                );
              }}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text className="color-white font-bold text-sm">Clear All Blocks</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color="#667eea"
            />
          )}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5">
            <Text className="text-xl font-extrabold text-text-light dark:text-text-dark mb-5">Add New Section</Text>
            <View className="flex-row items-center">
              <TextInput
                className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4 flex-1 mr-2.5"
                placeholder="Section Header (e.g. Introduction)"
                value={secTitle}
                onChangeText={setSecTitle}
              />
              <TextInput
                className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4 flex-1"
                placeholder="Sub-Header (Optional)"
                value={secSubtitle}
                onChangeText={setSecSubtitle}
              />
            </View>
            <TextInput
              className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4"
              placeholder="Video URL (Optional)"
              value={secVideo}
              onChangeText={setSecVideo}
            />
            <TouchableOpacity onPress={addSection} className="rounded-lg overflow-hidden">
              <LinearGradient
                colors={["#10b981", "#059669"]}
                className="p-3.5 flex-row items-center justify-center gap-2"
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text className="color-white font-bold text-sm">Add Section</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5 mt-6">
            <Text className="text-xl font-extrabold text-text-light dark:text-text-dark mb-5">Add Content Block</Text>
            {sections.length > 0 ? (
              <>
                <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark mb-2">Target Section:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                >
                  {sections.map((s) => {
                    const isActive = selectedSectionId === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        className={`px-4 py-2 rounded-[20px] mr-2 border ${isActive ? "bg-[#6366f1] border-[#6366f1]" : "bg-background-light dark:bg-background-dark border-divider-light dark:border-divider-dark"}`}
                        onPress={() => setSelectedSectionId(s.id)}
                      >
                        <Text
                          className={`text-[13px] font-semibold ${isActive ? "color-white" : "text-textSecondary-light dark:text-textSecondary-dark"}`}
                        >
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark mb-2">Content Type:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                >
                  {[
                    "paragraph",
                    "bullets",
                    "numbers",
                    "table",
                    "formula",
                    "image",
                    "video",
                  ].map((t) => {
                    const isActive = blockType === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        className={`px-4 py-2 rounded-[20px] mr-2 border ${isActive ? "bg-[#6366f1] border-[#6366f1]" : "bg-background-light dark:bg-background-dark border-divider-light dark:border-divider-dark"}`}
                        onPress={() => setBlockType(t as any)}
                      >
                        <Text
                          className={`text-[13px] font-semibold ${isActive ? "color-white" : "text-textSecondary-light dark:text-textSecondary-dark"}`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TextInput
                  className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4 min-h-[120px]"
                  style={{ textAlignVertical: 'top' }}
                  placeholder={
                    blockType === "bullets"
                      ? "Item 1\n  Sub item 1.1\n    Sub item 1.1.1"
                      : blockType === "table"
                        ? "Header 1, Header 2\nRow 1 Col 1, Row 1 Col 2"
                        : "Type your content here..."
                  }
                  multiline
                  value={blockContent}
                  onChangeText={setBlockContent}
                />

                {blockType === "image" && (
                  <TextInput
                    className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-[15px] text-text-light dark:text-text-dark mb-4"
                    placeholder="Image Caption"
                    value={imageCaption}
                    onChangeText={setImageCaption}
                  />
                )}

                <TouchableOpacity onPress={addBlock} className="rounded-lg overflow-hidden">
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    className="p-3.5 flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="document-text" size={20} color="white" />
                    <Text className="color-white font-bold text-sm">Add {blockType}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View className="p-10 items-center justify-center bg-background-light dark:bg-background-dark rounded-xl border-2 border-dashed border-divider-light dark:border-divider-dark">
                <Ionicons name="information-circle" size={24} color="#94a3b8" />
                <Text className="mt-3 text-sm text-textSecondary-light dark:text-textSecondary-dark text-center">
                  Add at least one section above to start adding content blocks.
                </Text>
              </View>
            )}
          </View>

          <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-divider-light dark:border-divider-dark shadow-sm shadow-[#000]/5 mt-6 mb-10">
            <Text className="text-xl font-extrabold text-text-light dark:text-text-dark mb-5">Structure & Hierarchy</Text>
            {sections.length === 0 ? (
              <View className="p-10 items-center justify-center bg-background-light dark:bg-background-dark rounded-xl border-2 border-dashed border-divider-light dark:border-divider-dark">
                <Text className="mt-3 text-sm text-textSecondary-light dark:text-textSecondary-dark text-center">No sections added yet.</Text>
              </View>
            ) : (
              sections.map((sec, index) => (
                <View key={sec.id} className="bg-background-light dark:bg-background-dark rounded-xl p-4 mb-4 border border-divider-light dark:border-divider-dark">
                  <View className="flex-row justify-between items-center mb-3 border-b border-divider-light dark:border-divider-dark pb-3">
                    <View className="flex-row items-center gap-2.5">
                      <View className="w-6 h-6 rounded-full bg-[#6366f1] items-center justify-center">
                        <Text className="color-white text-xs font-bold">{index + 1}</Text>
                      </View>
                      <Text className="text-base font-bold text-text-light dark:text-text-dark">{sec.title}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity onPress={() => moveSection(index, -1)}>
                        <Ionicons
                          name="arrow-up-circle"
                          size={24}
                          color="#6366f1"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveSection(index, 1)}>
                        <Ionicons
                          name="arrow-down-circle"
                          size={24}
                          color="#6366f1"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteSection(sec.id)}>
                        <Ionicons name="trash" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {sec.blocks.map((block) => (
                    <View key={block.id} className="flex-row items-center justify-between bg-card-light dark:bg-card-dark p-2.5 rounded-lg mt-2 border border-divider-light dark:border-divider-dark">
                      <View className="flex-row items-center flex-1 gap-2.5">
                        <View className="bg-background-light dark:bg-background-dark px-1.5 py-0.5 rounded">
                          <Text className="text-[10px] font-extrabold text-textSecondary-light dark:text-textSecondary-dark">
                            {block.type.toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark flex-1" numberOfLines={1}>
                          {typeof block.content === "string"
                            ? block.content
                            : "Structured content"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteBlock(sec.id, block.id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Preview Panel */}
      <View className="flex-1 bg-card-light dark:bg-card-dark border-l border-divider-light dark:border-divider-dark">
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          className="flex-row items-center gap-2 p-4 border-b border-divider-light dark:border-divider-dark"
        >
          <Ionicons name="eye-outline" size={20} color="#1e293b" />
          <Text className="font-bold text-text-light dark:text-text-dark text-[15px]">Live Preview</Text>
        </LinearGradient>
        <View className="flex-1">
          <HtmlRenderer html={finalHtml} />
        </View>
      </View>
    </View>
  );
};

export default NotesBuilder;
