import React from 'react';
import {ScrollView, View, Text, StyleSheet, RefreshControl, ActivityIndicator} from 'react-native';
import {useDashboard} from '../hooks/useDashboard';
import BalanceCard from '../components/BalanceCard';
import PieChartCard from '../components/PieChartCard';
import BarChartCard from '../components/BarChartCard';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';

export default function DashboardScreen() {
  const {data, isLoading, refetch, isRefetching} = useDashboard();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <BalanceCard label="Total Balance (PKR)" amount={data?.totalBalance || 0} />

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, {color: COLORS.income}]}>
            {formatCurrency(data?.monthlyIncome || 0)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, {color: COLORS.expense}]}>
            {formatCurrency(data?.monthlyExpense || 0)}
          </Text>
        </View>
      </View>

      <PieChartCard
        title="Expenses by Category"
        data={data?.expenseByCategory || []}
      />

      <BarChartCard
        title="Monthly Overview"
        data={data?.monthlyTrend || []}
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  spacer: {
    height: 24,
  },
});
