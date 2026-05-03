import React, {useState} from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTransactions, useDeleteTransaction} from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import {COLORS} from '../utils/constants';
import {TransactionsStackParamList} from '../navigation/RootNavigator';

const TYPE_FILTERS = [
  {label: 'All', value: 'all'},
  {label: 'Income', value: 'income'},
  {label: 'Expense', value: 'expense'},
];

const RECURRENCE_FILTERS = [
  {label: 'All', value: 'all'},
  {label: 'One-time', value: 'one-time'},
  {label: 'Recurring', value: 'recurring'},
];

type Nav = NativeStackNavigationProp<TransactionsStackParamList>;

export default function TransactionsScreen() {
  const navigation = useNavigation<Nav>();
  const [typeFilter, setTypeFilter] = useState('all');
  const [recurrenceFilter, setRecurrenceFilter] = useState('all');
  const deleteTx = useDeleteTransaction();

  const {data: transactions, isLoading, refetch, isRefetching} = useTransactions({
    type: typeFilter === 'all' ? undefined : (typeFilter as 'income' | 'expense'),
    recurrence: recurrenceFilter === 'all' ? undefined : (recurrenceFilter as 'one-time' | 'recurring'),
  });

  const handleDelete = (id: string) => {
    deleteTx.mutate(id, {
      onError: (err: Error) => Alert.alert('Error', err.message),
    });
  };

  return (
    <View style={styles.container}>
      <FilterBar options={TYPE_FILTERS} selected={typeFilter} onSelect={setTypeFilter} />
      <FilterBar
        options={RECURRENCE_FILTERS}
        selected={recurrenceFilter}
        onSelect={setRecurrenceFilter}
      />

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TransactionItem transaction={item} showAccount onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="swap-horizontal"
              message="No transactions yet"
              actionLabel="Add Transaction"
              onAction={() => navigation.navigate('AddTransaction')}
            />
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
