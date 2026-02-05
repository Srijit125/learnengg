import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { HTMLGenerator, Section, Block } from "../../../utils/htmlGenerator";
import HtmlRenderer from "../../../components/HtmlRenderer";
import CustomButton from "../../../components/Buttons/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import {
  listCourses,
  fetchCourseStructure,
} from "../../../services/course.service";
import { fetchCourseXML, saveCourseXML } from "../../../services/xml.service";
import { Course } from "../../../models/Course";

const NotesBuilder = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [xmlStructure, setXmlStructure] = useState<any>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [chapterTitle, setChapterTitle] = useState("Note Chapter Title");
  const [courseName, setCourseName] = useState("Course Name");
  const [unitName, setUnitName] = useState("Unit 1");
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
      // This is a simplified approach. In a real app, you'd use a DOM parser.
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
        <Text style={styles.sidebarHeader}>Note Configuration</Text>

        <Text style={styles.label}>Select Course</Text>
        <View style={styles.pickerWrapper}>
          <ScrollView style={{ maxHeight: 150 }}>
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
                    color: selectedCourseId === c.course_id ? "white" : "black",
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
          <ScrollView style={{ maxHeight: 150 }}>
            {xmlStructure ? (
              Object.keys(xmlStructure).flatMap((chapter) =>
                Object.keys(xmlStructure[chapter]).map((sco) => (
                  <TouchableOpacity
                    key={`${chapter}-${sco}`}
                    style={[
                      styles.optionItem,
                      selectedChapterId === sco && styles.activeOption,
                    ]}
                    onPress={() => setSelectedChapterId(sco)}
                  >
                    <Text
                      style={{
                        color: selectedChapterId === sco ? "white" : "black",
                      }}
                    >
                      {chapter} - {sco}
                    </Text>
                  </TouchableOpacity>
                )),
              )
            ) : (
              <Text style={{ padding: 10, color: "#666" }}>
                Select a course first
              </Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          placeholder="Note Chapter Title"
          value={chapterTitle}
          onChangeText={setChapterTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Unit Name"
          value={unitName}
          onChangeText={setUnitName}
        />

        <View style={{ marginTop: 20 }}>
          <CustomButton title="Link to XML & Save" onPress={linkToXml} />
          <TouchableOpacity
            style={[styles.downloadBtn, { marginTop: 10 }]}
            onPress={downloadHtml}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Download HTML Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearBtn, { marginTop: 10 }]}
            onPress={() => setSections([])}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Clear All Blocks
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator style={{ marginTop: 20 }} color="#0a8a83" />
        )}
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.header}>Add Section</Text>
          <TextInput
            style={styles.input}
            placeholder="Section Header (e.g. Introduction)"
            value={secTitle}
            onChangeText={setSecTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Sub-Header (Optional)"
            value={secSubtitle}
            onChangeText={setSecSubtitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Video URL (Optional)"
            value={secVideo}
            onChangeText={setSecVideo}
          />
          <CustomButton title="Add Section" onPress={addSection} />

          <View style={styles.divider} />

          <Text style={styles.header}>Add Content Block</Text>
          {sections.length > 0 ? (
            <>
              <View style={styles.pickerContainer}>
                <Text>Select Section:</Text>
                <ScrollView horizontal style={{ marginVertical: 10 }}>
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
                        style={{
                          color: selectedSectionId === s.id ? "white" : "black",
                        }}
                      >
                        {s.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerContainer}>
                <Text>Content Type:</Text>
                <ScrollView horizontal style={{ marginVertical: 10 }}>
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
                        style={{ color: blockType === t ? "white" : "black" }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                style={[styles.textArea, { height: 100 }]}
                placeholder={
                  blockType === "bullets"
                    ? "Item\n  Sub item\n    Sub sub item"
                    : blockType === "table"
                      ? "Header1, Header2\nRow1-Col1, Row1-Col2"
                      : "Enter content here..."
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

              <CustomButton title={`Add ${blockType}`} onPress={addBlock} />
            </>
          ) : (
            <Text style={{ fontStyle: "italic", color: "#666" }}>
              Add a section first to start adding content.
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.header}>Manage Sections</Text>
          {sections.map((sec, index) => (
            <View key={sec.id} style={styles.sectionItem}>
              <View style={styles.sectionHeaderLine}>
                <Text style={styles.sectionTitle}>
                  #{index + 1} - {sec.title}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={() => moveSection(index, -1)}>
                    <Ionicons name="arrow-up" size={20} color="#0073e6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveSection(index, 1)}
                    style={{ marginLeft: 10 }}
                  >
                    <Ionicons name="arrow-down" size={20} color="#0073e6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteSection(sec.id)}
                    style={{ marginLeft: 10 }}
                  >
                    <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
              {sec.blocks.map((block) => (
                <View key={block.id} style={styles.blockRow}>
                  <Text style={styles.blockText}>
                    [{block.type}]{" "}
                    {typeof block.content === "string"
                      ? block.content.substring(0, 30) + "..."
                      : "Structured content"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteBlock(sec.id, block.id)}
                  >
                    <Ionicons name="close-circle" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Preview Panel */}
      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Text style={{ fontWeight: "bold" }}>Live Preview</Text>
        </View>
        <HtmlRenderer html={finalHtml} />
      </View>
    </View>
  );
};

export default NotesBuilder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    backgroundColor: "#f5f5f5",
  },
  sidebar: {
    width: Platform.OS === "web" ? 300 : "100%",
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    padding: 20,
  },
  sidebarHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0a8a83",
  },
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  preview: {
    flex: 1,
    backgroundColor: "#eee",
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  previewHeader: {
    padding: 10,
    backgroundColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    marginTop: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    marginBottom: 15,
    overflow: "hidden",
  },
  optionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activeOption: {
    backgroundColor: "#0a8a83",
  },
  downloadBtn: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
  },
  clearBtn: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#0073e6",
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "white",
  },
  activeChip: {
    backgroundColor: "#0073e6",
  },
  pickerContainer: {
    marginBottom: 15,
  },
  sectionItem: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  sectionHeaderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  blockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  blockText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
});
