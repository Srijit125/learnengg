// Chart color palette and utilities for analytics dashboard

export const ChartColors = {
  // Primary colors
  primary: '#667eea',
  secondary: '#764ba2',
  
  // Difficulty colors
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Gradient sets
  gradients: {
    purple: ['#667eea', '#764ba2'],
    blue: ['#3b82f6', '#1d4ed8'],
    green: ['#10b981', '#059669'],
    orange: ['#f59e0b', '#d97706'],
    red: ['#ef4444', '#dc2626'],
    teal: ['#14b8a6', '#0d9488'],
    pink: ['#ec4899', '#db2777'],
  },
  
  // Chart specific colors
  chart: {
    bar1: '#667eea',
    bar2: '#10b981',
    bar3: '#f59e0b',
    bar4: '#ef4444',
    bar5: '#3b82f6',
    line1: '#667eea',
    line2: '#10b981',
    area1: 'rgba(102, 126, 234, 0.2)',
    area2: 'rgba(16, 185, 129, 0.2)',
  },
  
  // Neutral colors
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Get color based on difficulty level
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return ChartColors.easy;
    case 'medium':
      return ChartColors.medium;
    case 'hard':
      return ChartColors.hard;
    default:
      return ChartColors.gray[500];
  }
};

// Get gradient based on difficulty level
export const getDifficultyGradient = (difficulty: string): string[] => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return ChartColors.gradients.green;
    case 'medium':
      return ChartColors.gradients.orange;
    case 'hard':
      return ChartColors.gradients.red;
    default:
      return ChartColors.gradients.purple;
  }
};

// Get color for percentage value (0-100)
export const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return ChartColors.success;
  if (percentage >= 60) return ChartColors.info;
  if (percentage >= 40) return ChartColors.warning;
  return ChartColors.error;
};

// Generate color array for multiple data points
export const generateColorArray = (count: number): string[] => {
  const colors = [
    ChartColors.chart.bar1,
    ChartColors.chart.bar2,
    ChartColors.chart.bar3,
    ChartColors.chart.bar4,
    ChartColors.chart.bar5,
  ];
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// Format number for chart display
export const formatChartValue = (value: number, type: 'number' | 'percentage' = 'number'): string => {
  if (type === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};
