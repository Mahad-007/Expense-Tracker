import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';

interface Props {
  label: string;
  amount: number;
  currency?: 'PKR' | 'USD';
  size?: 'large' | 'small';
}

export default function BalanceCard({label, amount, currency = 'PKR', size = 'large'}: Props) {
  return (
    <View style={[styles.card, size === 'small' && styles.cardSmall]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, size === 'small' && styles.amountSmall]}>
        {formatCurrency(amount, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardSmall: {
    padding: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  amountSmall: {
    fontSize: 22,
  },
});
