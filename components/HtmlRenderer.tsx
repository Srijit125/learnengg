import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

export default function HtmlRenderer({
  html,
  onProgress,
}: {
  html: any;
  onProgress?: (progress: number) => void;
}) {
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (data.type === "progress" && onProgress) {
            onProgress(data.data);
          }
        } catch (e) {}
      };
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [onProgress]);

  // Extract the string content. If it's an object, try common fields.
  // ... (content processing remains same)
  let content =
    typeof html === "string"
      ? html
      : html?.html || html?.content || html?.notes || "";

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

      // Scroll Tracking
      window.addEventListener('scroll', function() {
        var h = document.documentElement, 
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
        var scrollPos = h[st]||b[st];
        var totalScroll = (h[sh]||b[sh]) - h.clientHeight;
        
        // Use a 10px buffer for 100% completion
        var percent = totalScroll <= 0 ? 1 : scrollPos / totalScroll;
        if (totalScroll - scrollPos < 10) percent = 1;

        var message = JSON.stringify({type: 'progress', data: percent});
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(message);
        } else {
          window.parent.postMessage(message, '*');
        }
      });
    </script>
  `;

  let processedHtml = "";
  if (content.toLowerCase().includes("<html")) {
    if (content.toLowerCase().includes("<head>")) {
      processedHtml = content.replace(/(<head[^>]*>)/i, `$1${securityStyle}`);
    } else {
      processedHtml = securityStyle + content;
    }
  } else {
    processedHtml = `<html><head>${securityStyle}</head><body style="margin:0;padding:20px;font-family:sans-serif;">${content}</body></html>`;
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
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === "progress" && onProgress) {
                onProgress(data.data);
              }
            } catch (e) {}
          }}
        />
      )}
    </View>
  );
}
