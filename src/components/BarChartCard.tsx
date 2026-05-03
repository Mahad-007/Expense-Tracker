import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {COLORS} from '../utils/constants';

const screenWidth = Dimensions.get('window').width;

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  title: string;
  data: MonthData[];
}

export default function BarChartCard({title, data}: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No data yet</Text>
      </View>
    );
  }

  // Simplify labels
  const labels = data.map(d => d.month.split(' ')[0]); // Just "Jan", "Feb", etc.
  const incomeData = data.map(d => d.income / 1000); // Show in thousands
  const expenseData = data.map(d => d.expense / 1000);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, {backgroundColor: COLORS.income}]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, {backgroundColor: COLORS.expense}]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
        <Text style={styles.unit}>(in thousands)</Text>
      </View>
      <BarChart
        data={{
          labels,
          datasets: [
            {data: incomeData, color: () => COLORS.income},
            {data: expenseData, color: () => COLORS.expense},
          ],
        }}
        width={screenWidth - 64}
        height={200}
        yAxisLabel=""
        yAxisSuffix="k"
        fromZero
        showBarTops={false}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: () => COLORS.primary,
          labelColor: () => COLORS.textSecondary,
          barPercentage: 0.4,
          propsForBackgroundLines: {
            stroke: COLORS.border,
          },
        }}
        style={{borderRadius: 8, marginLeft: -16}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
});
