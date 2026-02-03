import React from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

export default function HtmlRenderer({ html }: { html: any }) {
  // Extract the string content. If it's an object, try common fields.
  let content =
    typeof html === "string"
      ? html
      : html?.html || html?.content || html?.notes || "";

  // If we still don't have a string (e.g. it's a different object structure),
  // and it's not empty, stringify it as a fallback.
  if (typeof content !== "string") {
    content = JSON.stringify(content);
  }

  // Security elements to prevent selection and copying
  const securityStyle = `
    <style>
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    </style>
    <script>
      document.oncontextmenu = function() { return false; };
      document.onkeydown = function(e) {
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 83)) {
          return false;
        }
      };
    </script>
  `;

  // Inject security style into the existing HTML or wrap it if it's just a snippet
  let processedHtml = "";
  if (content.toLowerCase().includes("<html")) {
    // It's a full document. Try to inject after <head> or at the very beginning.
    if (content.toLowerCase().includes("<head>")) {
      processedHtml = content.replace(/(<head[^>]*>)/i, `$1${securityStyle}`);
    } else {
      processedHtml = securityStyle + content;
    }
  } else {
    // It's just a snippet, wrap it.
    processedHtml = `<html><head>${securityStyle}</head><body>${content}</body></html>`;
  }

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === "web" ? (
        <iframe
          srcDoc={processedHtml}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "transparent",
          }}
          title="Note Content"
        />
      ) : (
        <WebView
          source={{ html: processedHtml }}
          originWhitelist={["*"]}
          javaScriptEnabled
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}
