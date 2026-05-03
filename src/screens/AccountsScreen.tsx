import React from 'react';
import {View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAccounts, useDeleteAccount} from '../hooks/useAccounts';
import AccountCard from '../components/AccountCard';
import EmptyState from '../components/EmptyState';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';
import {AccountWithBalance} from '../types';
import {AccountsStackParamList} from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AccountsStackParamList>;

export default function AccountsScreen() {
  const navigation = useNavigation<Nav>();
  const {data: accounts, isLoading, refetch, isRefetching} = useAccounts();
  const deleteAccount = useDeleteAccount();

  const localAccounts = (accounts || []).filter(a => a.type === 'local');
  const processingAccounts = (accounts || []).filter(a => a.type === 'processing');
  const totalLocalBalance = localAccounts.reduce((sum, a) => sum + a.balance, 0);

  const handlePress = (account: AccountWithBalance) => {
    navigation.navigate('AccountDetail', {
      accountId: account.id,
      accountName: account.name,
    });
  };

  const handleDelete = (id: string) => {
    deleteAccount.mutate(id, {
      onError: (err: Error) => Alert.alert('Error', err.message),
    });
  };

  const renderSection = (title: string, data: AccountWithBalance[]) => (
    <>
      {data.length > 0 && (
        <Text style={styles.sectionTitle}>{title}</Text>
      )}
      {data.map(account => (
        <AccountCard
          key={account.id}
          account={account}
          onPress={() => handlePress(account)}
          onDelete={handleDelete}
        />
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]} // Single item to enable pull-to-refresh on the whole page
        keyExtractor={() => 'content'}
        renderItem={() => (
          <View>
            {/* Total Balance */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Balance (Local)</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalLocalBalance)}</Text>
            </View>

            {(!accounts || accounts.length === 0) && !isLoading ? (
              <EmptyState
                icon="wallet-plus"
                message="No accounts yet"
                actionLabel="Add Account"
                onAction={() => navigation.navigate('AddAccount')}
              />
            ) : (
              <>
                {renderSection('Local Accounts (PKR)', localAccounts)}
                {renderSection('Processing Accounts (USD)', processingAccounts)}
              </>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAccount')}>
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
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 4,
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
