import React from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
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
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 items-center shadow-md shadow-[#000]/5 elevation-3 border border-transparent">
      {title && <Text className="text-base font-bold text-text-light dark:text-text-dark mb-4 self-start">{title}</Text>}
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

      <View className="flex-row gap-4 mt-2.5">
        <View className="flex-row items-center gap-1.5">
          <View className="w-5 h-1 rounded-sm bg-[#667eea]" />
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">Overall</Text>
        </View>
        {todayPoints && (
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-5 h-1 rounded-sm border-dashed border border-[#ef4444] bg-[#ef4444]"
            />
            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">Today</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RadarChart;
