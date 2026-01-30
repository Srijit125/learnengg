import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

type MetricCardProps = {
  title: string;
  metric: number;
  color?: string;
  suffix?: string;
};

const MetricCard = ({
  title,
  metric,
  color = '#667eea',
  suffix = '',
}: MetricCardProps) => {
  const formatMetric = (value: number) => {
    if (suffix === '%') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metricContainer}>
          <Text style={[styles.metric, { color }]}>
            {formatMetric(metric)}
            {suffix && <Text style={styles.suffix}>{suffix}</Text>}
          </Text>
        </View>
        <View style={[styles.accentBar, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

export default MetricCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 180,
    maxWidth: 220,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricContainer: {
    marginVertical: 8,
  },
  metric: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  suffix: {
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.8,
  },
  accentBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
});