import Editor from "@monaco-editor/react";
import React from "react";
import { View } from "react-native";

type Props = {
  xmlContent: string;
  setXmlContent: (content: string) => void;
};

const XMLEditor = ({ xmlContent, setXmlContent }: Props) => {
  return (
    <View className="flex-1">
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
