import React from 'react';
import { Text, View } from 'react-native';

type ProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
};

const ProgressRing = ({
  percentage,
  size = 120,
  strokeWidth = 12,
  color = '#667eea',
  backgroundColor = '#e5e7eb',
  label = 'Accuracy',
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="relative justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View className="justify-center items-center">
        <Text className="text-[28px] font-bold text-text-light dark:text-text-dark">{progress.toFixed(0)}%</Text>
        <Text className="text-xs font-medium text-textSecondary-light dark:text-textSecondary-dark mt-0.5">{label}</Text>
      </View>
    </View>
  );
};

export default ProgressRing;
