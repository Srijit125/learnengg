import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";

type CPIGaugeProps = {
  value: number;
  size?: number;
  title?: string;
};

const CPIGauge = ({
  value = 0,
  size = 200,
  title = "Performance Index (CPI)",
}: CPIGaugeProps) => {
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // Convert 0-100 to -120 to 120 degrees
  const angle = (value / 100) * 240 - 120;
  const radian = (angle - 90) * (Math.PI / 180);

  const needleX = centerX + (radius - 10) * Math.cos(radian);
  const needleY = centerY + (radius - 10) * Math.sin(radian);

  const getArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = centerX + r * Math.cos(startRad);
    const y1 = centerY + r * Math.sin(startRad);
    const x2 = centerX + r * Math.cos(endRad);
    const y2 = centerY + r * Math.sin(endRad);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const getStatusColor = (v: number) => {
    if (v < 40) return "#ef4444"; // Red
    if (v < 70) return "#f59e0b"; // Amber
    return "#10b981"; // Green
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.gaugeWrapper}>
        <Svg height={size} width={size}>
          <G>
            {/* Background Track */}
            <Path
              d={getArcPath(-120, 120, radius)}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Section Gradients (Simple colored arcs) */}
            <Path
              d={getArcPath(-120, -24, radius)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <Path
              d={getArcPath(-24, 48, radius)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <Path
              d={getArcPath(48, 120, radius)}
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Needle */}
            <Path
              d={`M ${centerX} ${centerY} L ${needleX} ${needleY}`}
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx={centerX} cy={centerY} r="8" fill="#1e293b" />

            {/* Value Text */}
            <SvgText
              x={centerX}
              y={centerY + 40}
              fill="#1e293b"
              fontSize="24"
              fontWeight="800"
              textAnchor="middle"
            >
              {Math.round(value)}
            </SvgText>
            <SvgText
              x={centerX}
              y={centerY + 60}
              fill="#64748b"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
            >
              SCORE
            </SvgText>
          </G>
        </Svg>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(value) + "20" },
        ]}
      >
        <Text style={[styles.statusText, { color: getStatusColor(value) }]}>
          {value >= 70 ? "Excellent" : value >= 40 ? "Steady" : "Action Needed"}
        </Text>
      </View>
    </View>
  );
};

export default CPIGauge;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  gaugeWrapper: {
    marginTop: -20,
  },
  statusBadge: {
    marginTop: -10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
