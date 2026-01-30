import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

type LegendItem = {
  label: string;
  color: string;
};

type ChartLegendProps = {
  items: LegendItem[];
  layout?: 'horizontal' | 'vertical';
};

const ChartLegend = ({ items, layout = 'horizontal' }: ChartLegendProps) => {
  return (
    <View style={[styles.container, layout === 'vertical' && styles.vertical]}>
      {items.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default ChartLegend;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  vertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
});
