import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';

const screenWidth = Dimensions.get('window').width;

interface CategoryData {
  name: string;
  amount: number;
  color: string;
}

interface Props {
  title: string;
  data: CategoryData[];
}

export default function PieChartCard({title, data}: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No expenses this month</Text>
      </View>
    );
  }

  const chartData = data.map(item => ({
    name: item.name,
    population: item.amount,
    color: item.color,
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <PieChart
        data={chartData}
        width={screenWidth - 64}
        height={180}
        chartConfig={{
          color: () => COLORS.primary,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute={false}
      />
      <View style={styles.legend}>
        {data.map(item => (
          <View key={item.name} style={styles.legendItem}>
            <View style={[styles.dot, {backgroundColor: item.color}]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.legendAmount}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </View>
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
    marginBottom: 12,
  },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  legend: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
});
