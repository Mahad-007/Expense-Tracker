import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from '../types';
import {COLORS, CATEGORY_ICONS} from '../utils/constants';
import {formatCurrency, formatDate} from '../utils/format';

interface Props {
  transaction: Transaction;
  showAccount?: boolean;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({transaction, showAccount = false, onDelete}: Props) {
  const isIncome = transaction.type === 'income';
  const categoryName = transaction.category?.name || 'Other';
  const iconName = CATEGORY_ICONS[categoryName] || 'cash';
  const currency = (transaction.currency as 'PKR' | 'USD') || 'PKR';

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.type} of ${formatCurrency(transaction.amount, currency)}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(transaction.id),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={handleLongPress}
      activeOpacity={0.7}>
      <View style={[styles.iconBox, {backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2'}]}>
        <Icon
          name={iconName}
          size={20}
          color={isIncome ? COLORS.income : COLORS.expense}
        />
      </View>
      <View style={styles.middle}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || categoryName}
        </Text>
        <Text style={styles.meta}>
          {categoryName}
          {showAccount && transaction.account ? ` - ${transaction.account.name}` : ''}
          {transaction.recurrence === 'recurring' ? ' (Recurring)' : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, {color: isIncome ? COLORS.income : COLORS.expense}]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
