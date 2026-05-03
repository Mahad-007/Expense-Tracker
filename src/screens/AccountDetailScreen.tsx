import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, Text, RefreshControl, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAccounts} from '../hooks/useAccounts';
import {useTransactions, useDeleteTransaction} from '../hooks/useTransactions';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import {COLORS} from '../utils/constants';
import {AccountsStackParamList, TransactionsStackParamList} from '../navigation/RootNavigator';

type Route = RouteProp<AccountsStackParamList, 'AccountDetail'>;
type Nav = NativeStackNavigationProp<AccountsStackParamList>;

export default function AccountDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {accountId} = route.params;
  const deleteTx = useDeleteTransaction();

  const {data: accounts} = useAccounts();
  const account = (accounts || []).find(a => a.id === accountId);

  const {data: transactions, refetch, isRefetching, isLoading} = useTransactions({
    accountId,
  });

  const handleDelete = (id: string) => {
    deleteTx.mutate(id, {
      onError: (err: Error) => Alert.alert('Error', err.message),
    });
  };

  if (!account) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            <BalanceCard
              label={`${account.name} Balance`}
              amount={account.balance}
              currency={account.currency}
            />
            <TouchableOpacity
              style={styles.transferButton}
              onPress={() =>
                navigation.navigate('Transfer', {
                  fromAccountId: account.id,
                })
              }>
              <Icon name="bank-transfer-out" size={20} color="#fff" />
              <Text style={styles.transferText}>Transfer Funds</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Transaction History</Text>
          </View>
        }
        renderItem={({item}) => (
          <TransactionItem transaction={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="receipt" message="No transactions for this account" />
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.processing,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  transferText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
});
