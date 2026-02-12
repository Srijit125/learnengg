import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, {
  Polygon,
  Line,
  Text as SvgText,
  Circle,
  G,
} from "react-native-svg";

type RadarData = {
  label: string;
  overall: number;
  today?: number;
};

type RadarChartProps = {
  data: RadarData[];
  size?: number;
  title?: string;
};

const RadarChart = ({ data, size = 300, title }: RadarChartProps) => {
  if (!data || data.length < 3) return null;

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.7;
  const numAxes = data.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Calculate grid levels
  const levels = [0.2, 0.4, 0.6, 0.8, 1];

  const getCoordinates = (value: number, angle: number) => {
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.sin(angle),
      y: centerY - r * Math.cos(angle),
    };
  };

  const overallPoints = data
    .map((d, i) => {
      const coords = getCoordinates(d.overall, i * angleStep);
      return `${coords.x},${coords.y}`;
    })
    .join(" ");

  const todayPoints = data.every((d) => d.today !== undefined)
    ? data
        .map((d, i) => {
          const coords = getCoordinates(d.today || 0, i * angleStep);
          return `${coords.x},${coords.y}`;
        })
        .join(" ")
    : null;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg height={size} width={size}>
        <G>
          {/* Background Grid */}
          {levels.map((level, i) => (
            <Polygon
              key={`level-${i}`}
              points={data
                .map((_, j) => {
                  const coords = getCoordinates(level * 100, j * angleStep);
                  return `${coords.x},${coords.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          {data.map((d, i) => {
            const angle = i * angleStep;
            const end = getCoordinates(100, angle);
            const labelPos = getCoordinates(115, angle);

            return (
              <G key={`axis-${i}`}>
                <Line
                  x1={centerX}
                  y1={centerY}
                  x2={end.x}
                  y2={end.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {d.label}
                </SvgText>
              </G>
            );
          })}

          {/* Overall Data Polygon */}
          <Polygon
            points={overallPoints}
            fill="rgba(102, 126, 234, 0.3)"
            stroke="#667eea"
            strokeWidth="2"
          />

          {/* Today's Data Polygon */}
          {todayPoints && (
            <Polygon
              points={todayPoints}
              fill="rgba(239, 68, 68, 0.3)"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          )}

          {/* Data Points */}
          {data.map((d, i) => {
            const coords = getCoordinates(d.overall, i * angleStep);
            return (
              <Circle
                key={`dot-${i}`}
                cx={coords.x}
                cy={coords.y}
                r="3"
                fill="#667eea"
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.line, { backgroundColor: "#667eea" }]} />
          <Text style={styles.legendText}>Overall</Text>
        </View>
        {todayPoints && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.line,
                {
                  backgroundColor: "#ef4444",
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: "#ef4444",
                },
              ]}
            />
            <Text style={styles.legendText}>Today</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RadarChart;

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
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  line: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
