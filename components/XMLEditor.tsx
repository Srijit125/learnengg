import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import Editor from "@monaco-editor/react";

type Props = {
  xmlContent: string;
  setXmlContent: (content: string) => void;
};

const XMLEditor = ({ xmlContent, setXmlContent }: Props) => {
  return (
    <View style={{ flex: 1 }}>
      <Editor
        language="xml"
        value={xmlContent}
        onChange={(value) => setXmlContent(value || "")}
        onValidate={(value) => console.log(value)}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </View>
  );
};

export default XMLEditor;

const styles = StyleSheet.create({
  xmlInput: {
    flex: 1,
    padding: 20,
    fontFamily: "monospace",
    fontSize: 14,
    color: "#334155",
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
});
