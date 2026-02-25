import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
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
    <View style={styles.container}>
      {/* Sidebar - Settings */}
      <View style={styles.sidebar}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.sidebarHeaderGradient}
        >
          <MaterialCommunityIcons
            name="file-document-edit-outline"
            size={24}
            color="white"
          />
          <Text style={styles.sidebarHeader}>Note Builder</Text>
        </LinearGradient>

        <ScrollView style={styles.sidebarScroll}>
          <View style={styles.card}>
            <Text style={styles.label}>Mode Selection</Text>
            <TouchableOpacity
              style={[
                styles.standaloneToggle,
                standaloneMode && styles.activeStandalone,
              ]}
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
                style={[
                  styles.standaloneText,
                  standaloneMode && { color: "white" },
                ]}
              >
                Standalone Mode
              </Text>
            </TouchableOpacity>

            {!standaloneMode && (
              <>
                <Text style={styles.label}>Select Course</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {courses.map((c) => (
                      <TouchableOpacity
                        key={c.course_id}
                        style={[
                          styles.optionItem,
                          selectedCourseId === c.course_id &&
                          styles.activeOption,
                        ]}
                        onPress={() => handleCourseChange(c.course_id)}
                      >
                        <Text
                          style={{
                            color:
                              selectedCourseId === c.course_id
                                ? "white"
                                : "#1e293b",
                            fontWeight:
                              selectedCourseId === c.course_id
                                ? "600"
                                : "400",
                          }}
                        >
                          {c.course_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.label}>Link to Chapter/Unit</Text>
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
                              onPress={() => {
                                setSelectedChapterId(chapter.chapterId);
                                if (!chapterTitle) setChapterTitle(chapter.chapterTitle);
                                if (!unitName) setUnitName(unit.unitTitle);
                              }}
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
                        {loading ? "Loading structure..." : "Select a course first"}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Metadata</Text>
            <TextInput
              style={styles.input}
              placeholder="Note Chapter Title"
              value={chapterTitle}
              onChangeText={setChapterTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Unit/Course context"
              value={unitName}
              onChangeText={setUnitName}
            />
          </View>

          <View style={styles.actionContainer}>
            {!standaloneMode && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={linkToXml}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.btnGradient}
                >
                  <Ionicons name="link" size={18} color="white" />
                  <Text style={styles.btnText}>Link to XML & Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={downloadHtml}>
              <Ionicons name="download-outline" size={18} color="white" />
              <Text style={styles.btnText}>Download HTML Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
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
              <Text style={styles.btnText}>Clear All Blocks</Text>
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
      <View style={styles.main}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          <View style={styles.mainCard}>
            <Text style={styles.sectionHeader}>Add New Section</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Section Header (e.g. Introduction)"
                value={secTitle}
                onChangeText={setSecTitle}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Sub-Header (Optional)"
                value={secSubtitle}
                onChangeText={setSecSubtitle}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Video URL (Optional)"
              value={secVideo}
              onChangeText={setSecVideo}
            />
            <TouchableOpacity onPress={addSection} style={styles.addBtn}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.btnGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.btnText}>Add Section</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={[styles.mainCard, { marginTop: 24 }]}>
            <Text style={styles.sectionHeader}>Add Content Block</Text>
            {sections.length > 0 ? (
              <>
                <Text style={styles.subLabel}>Target Section:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScroll}
                >
                  {sections.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.chip,
                        selectedSectionId === s.id && styles.activeChip,
                      ]}
                      onPress={() => setSelectedSectionId(s.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedSectionId === s.id && styles.activeChipText,
                        ]}
                      >
                        {s.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.subLabel}>Content Type:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScroll}
                >
                  {[
                    "paragraph",
                    "bullets",
                    "numbers",
                    "table",
                    "formula",
                    "image",
                    "video",
                  ].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.chip,
                        blockType === t && styles.activeChip,
                      ]}
                      onPress={() => setBlockType(t as any)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          blockType === t && styles.activeChipText,
                        ]}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={styles.textArea}
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
                    style={styles.input}
                    placeholder="Image Caption"
                    value={imageCaption}
                    onChangeText={setImageCaption}
                  />
                )}

                <TouchableOpacity onPress={addBlock} style={styles.addBtn}>
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    style={styles.btnGradient}
                  >
                    <Ionicons name="document-text" size={20} color="white" />
                    <Text style={styles.btnText}>Add {blockType}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="information-circle" size={24} color="#94a3b8" />
                <Text style={styles.emptyText}>
                  Add at least one section above to start adding content blocks.
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.mainCard, { marginTop: 24, marginBottom: 40 }]}>
            <Text style={styles.sectionHeader}>Structure & Hierarchy</Text>
            {sections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No sections added yet.</Text>
              </View>
            ) : (
              sections.map((sec, index) => (
                <View key={sec.id} style={styles.sectionItem}>
                  <View style={styles.sectionHeaderLine}>
                    <View style={styles.sectionTitleRow}>
                      <View style={styles.indexBadge}>
                        <Text style={styles.indexText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.sectionTitle}>{sec.title}</Text>
                    </View>
                    <View style={styles.controls}>
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
                    <View key={block.id} style={styles.blockRow}>
                      <View style={styles.blockInfo}>
                        <View style={styles.blockTypeBadge}>
                          <Text style={styles.blockTypeText}>
                            {block.type.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.blockText} numberOfLines={1}>
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
      <View style={styles.preview}>
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          style={styles.previewHeader}
        >
          <Ionicons name="eye-outline" size={20} color="#1e293b" />
          <Text style={styles.previewHeaderText}>Live Preview</Text>
        </LinearGradient>
        <View style={styles.previewContent}>
          <HtmlRenderer html={finalHtml} />
        </View>
      </View>
    </View>
  );
};

export default NotesBuilder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    backgroundColor: "#f1f5f9",
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
  sidebarHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1e293b",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  standaloneToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    gap: 10,
  },
  activeStandalone: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  standaloneText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 16,
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
    backgroundColor: "#667eea",
  },
  actionContainer: {
    gap: 12,
    marginBottom: 40,
  },
  primaryBtn: {
    borderRadius: 8,
    overflow: "hidden",
  },
  secondaryBtn: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  clearBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtn: {
    borderRadius: 8,
    overflow: "hidden",
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
    fontSize: 14,
  },
  main: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipScroll: {
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeChip: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  activeChipText: {
    color: "white",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  sectionItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeaderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  blockInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  blockTypeBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blockTypeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
  },
  blockText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
  },
  preview: {
    flex: 1,
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
});
