import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { getPercentageColor } from '@/utils/chartColors';

type ProgressBarItem = {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
};

type HorizontalProgressBarProps = {
  items: ProgressBarItem[];
  height?: number;
  showPercentage?: boolean;
};

const HorizontalProgressBar = ({
  items,
  height = 32,
  showPercentage = true,
}: HorizontalProgressBarProps) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const maxValue = item.maxValue || 100;
        const percentage = (item.value / maxValue) * 100;
        const barColor = item.color || getPercentageColor(percentage);

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{item.label}</Text>
              {showPercentage && (
                <Text style={styles.value}>
                  {item.value} {item.maxValue && `/ ${item.maxValue}`}
                </Text>
              )}
            </View>
            <View style={[styles.barBackground, { height }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default HorizontalProgressBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  barContainer: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  barBackground: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
});
