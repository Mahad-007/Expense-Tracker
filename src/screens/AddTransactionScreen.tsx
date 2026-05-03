import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAccounts} from '../hooks/useAccounts';
import {useCategories, useCreateCategory} from '../hooks/useCategories';
import {useCreateTransaction} from '../hooks/useTransactions';
import {useCreateTransfer} from '../hooks/useTransfers';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';
import dayjs from 'dayjs';
import {TransactionsStackParamList, AccountsStackParamList} from '../navigation/RootNavigator';

type TransactionsRoute = RouteProp<TransactionsStackParamList, 'AddTransaction'>;
type AccountsRoute = RouteProp<AccountsStackParamList, 'Transfer'>;

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute<TransactionsRoute | AccountsRoute>();

  // Determine initial state from params
  const params = route.params as {accountId?: string; mode?: string; fromAccountId?: string} | undefined;
  const initialMode = params?.mode === 'transfer' || params?.fromAccountId ? 'transfer' : 'expense';
  const preselectedAccountId = params?.accountId || '';
  const preselectedFromAccountId = params?.fromAccountId || '';

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(initialMode);
  const [accountId, setAccountId] = useState(preselectedAccountId);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<'one-time' | 'recurring'>('one-time');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Transfer-specific state
  const [fromAccountId, setFromAccountId] = useState(preselectedFromAccountId);
  const [toAccountId, setToAccountId] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const {data: accounts} = useAccounts();
  const {data: categories} = useCategories(type === 'transfer' ? 'expense' : type);
  const createTx = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const createCategory = useCreateCategory();

  // Derived values for transfer
  const fromAccount = (accounts || []).find(a => a.id === fromAccountId);
  const toAccount = (accounts || []).find(a => a.id === toAccountId);
  const isDifferentCurrency = !!(fromAccount && toAccount && fromAccount.currency !== toAccount.currency);

  // Set header title dynamically
  useEffect(() => {
    if (type === 'transfer') {
      navigation.setOptions({title: 'Transfer Funds'});
    } else {
      navigation.setOptions({title: 'Add Transaction'});
    }
  }, [type, navigation]);

  // Reset toAccountId if it matches fromAccountId
  useEffect(() => {
    if (toAccountId && toAccountId === fromAccountId) {
      setToAccountId('');
    }
  }, [fromAccountId]);

  // Reset exchange rate based on currency match
  useEffect(() => {
    if (type === 'transfer') {
      if (!isDifferentCurrency) {
        setExchangeRate('1');
      } else {
        setExchangeRate('');
      }
    }
  }, [fromAccountId, toAccountId, type, isDifferentCurrency]);

  const handleTypeChange = (newType: 'income' | 'expense' | 'transfer') => {
    setType(newType);
    setCategoryId('');
    if (newType === 'transfer') {
      setRecurrence('one-time');
    }
  };

  const handleAddCategory = () => {
    setNewCategoryName('');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    createCategory.mutate(
      {name: trimmed, type: type === 'transfer' ? 'expense' : type},
      {
        onSuccess: (cat) => {
          setCategoryId(cat.id);
          setShowCategoryModal(false);
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
      },
    );
  };

  const handleSave = async () => {
    if (type === 'transfer') {
      // Transfer validation
      if (!fromAccountId) {
        Alert.alert('Error', 'Please select a source account');
        return;
      }
      if (!toAccountId) {
        Alert.alert('Error', 'Please select a destination account');
        return;
      }
      if (!amount || Number(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
      if (isDifferentCurrency && (!exchangeRate || Number(exchangeRate) <= 0)) {
        Alert.alert('Error', 'Please enter a valid exchange rate');
        return;
      }
      // Balance validation
      if (fromAccount && Number(amount) > fromAccount.balance) {
        Alert.alert(
          'Error',
          `Insufficient balance. Available: ${formatCurrency(fromAccount.balance, fromAccount.currency)}`,
        );
        return;
      }

      const effectiveRate = isDifferentCurrency ? Number(exchangeRate) : 1;
      const amountTo = Number(amount) * effectiveRate;

      createTransfer.mutate(
        {
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount_from: Number(amount),
          amount_to: Number(amountTo.toFixed(2)),
          exchange_rate: effectiveRate,
          description: description || null,
          date,
        },
        {
          onSuccess: () => navigation.goBack(),
          onError: (err: Error) => Alert.alert('Error', err.message),
        },
      );
    } else {
      // Income/Expense validation
      if (!accountId) {
        Alert.alert('Error', 'Please select an account');
        return;
      }
      if (!amount || Number(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      createTx.mutate(
        {
          account_id: accountId,
          category_id: categoryId || null,
          type,
          amount: Number(amount),
          description: description || null,
          recurrence,
          date,
        },
        {
          onSuccess: () => navigation.goBack(),
          onError: (err: Error) => Alert.alert('Error', err.message),
        },
      );
    }
  };

  const isPending = createTx.isPending || createTransfer.isPending;
  const calculatedAmount = Number(amount) * Number(exchangeRate || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, type === 'income' && styles.toggleActiveIncome]}
          onPress={() => handleTypeChange('income')}>
          <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, type === 'expense' && styles.toggleActiveExpense]}
          onPress={() => handleTypeChange('expense')}>
          <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, type === 'transfer' && styles.toggleActiveTransfer]}
          onPress={() => handleTypeChange('transfer')}>
          <Text style={[styles.toggleText, type === 'transfer' && styles.toggleTextActive]}>
            Transfer
          </Text>
        </TouchableOpacity>
      </View>

      {type === 'transfer' ? (
        <>
          {/* From Account Picker */}
          <Text style={styles.label}>From Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {(accounts || []).map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.pickerItem, fromAccountId === acc.id && styles.pickerItemActiveTransfer]}
                onPress={() => setFromAccountId(acc.id)}>
                <Text style={[styles.pickerText, fromAccountId === acc.id && styles.pickerTextActive]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* To Account Picker */}
          <Text style={styles.label}>To Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {(accounts || []).filter(acc => acc.id !== fromAccountId).map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.pickerItem, toAccountId === acc.id && styles.pickerItemActiveTransfer]}
                onPress={() => setToAccountId(acc.id)}>
                <Text style={[styles.pickerText, toAccountId === acc.id && styles.pickerTextActive]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          {/* Account Picker (for income/expense) */}
          <Text style={styles.label}>Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {(accounts || []).map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.pickerItem, accountId === acc.id && styles.pickerItemActive]}
                onPress={() => setAccountId(acc.id)}>
                <Text style={[styles.pickerText, accountId === acc.id && styles.pickerTextActive]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Category Picker (hidden for transfer) */}
      {type !== 'transfer' && (
        <>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {(categories || []).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pickerItem, categoryId === cat.id && styles.pickerItemActive]}
                onPress={() => setCategoryId(cat.id)}>
                <Text style={[styles.pickerText, categoryId === cat.id && styles.pickerTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
              <Icon name="plus" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      {/* Amount */}
      <Text style={styles.label}>
        {type === 'transfer' && isDifferentCurrency
          ? `Amount (${fromAccount?.currency || ''})`
          : 'Amount'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Exchange Rate (only for cross-currency transfers) */}
      {type === 'transfer' && isDifferentCurrency && (
        <>
          <Text style={styles.label}>
            Exchange Rate (1 {fromAccount?.currency} = ? {toAccount?.currency})
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={exchangeRate}
            onChangeText={setExchangeRate}
          />

          {/* Calculated result */}
          {Number(amount) > 0 && Number(exchangeRate) > 0 && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Recipient receives</Text>
              <Text style={styles.resultAmount}>
                {formatCurrency(calculatedAmount, toAccount?.currency || 'PKR')}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Optional description"
        placeholderTextColor={COLORS.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      {/* Recurrence Toggle (hidden for transfer) */}
      {type !== 'transfer' && (
        <>
          <Text style={styles.label}>Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggle, recurrence === 'one-time' && styles.toggleActiveIncome]}
              onPress={() => setRecurrence('one-time')}>
              <Text style={[styles.toggleText, recurrence === 'one-time' && styles.toggleTextActive]}>
                One-time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggle, recurrence === 'recurring' && styles.toggleActiveIncome]}
              onPress={() => setRecurrence('recurring')}>
              <Text style={[styles.toggleText, recurrence === 'recurring' && styles.toggleTextActive]}>
                Recurring
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Date */}
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={COLORS.textMuted}
        value={date}
        onChangeText={setDate}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, type === 'transfer' && styles.saveButtonTransfer]}
        onPress={handleSave}
        disabled={isPending}>
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {type === 'transfer' ? 'Transfer Funds' : 'Save Transaction'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New {type === 'transfer' ? 'expense' : type} category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name"
              placeholderTextColor={COLORS.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
              onSubmitEditing={handleSaveCategory}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveCategory}
                disabled={createCategory.isPending}>
                {createCategory.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  toggleActiveIncome: {
    backgroundColor: COLORS.income,
    borderColor: COLORS.income,
  },
  toggleActiveExpense: {
    backgroundColor: COLORS.expense,
    borderColor: COLORS.expense,
  },
  toggleActiveTransfer: {
    backgroundColor: COLORS.processing,
    borderColor: COLORS.processing,
  },
  toggleText: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  pickerScroll: {
    flexGrow: 0,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  addCategoryButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerItemActiveTransfer: {
    backgroundColor: COLORS.processing,
    borderColor: COLORS.processing,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  pickerTextActive: {
    color: '#fff',
  },
  resultBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.income,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonTransfer: {
    backgroundColor: COLORS.processing,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontWeight: '600',
    color: '#fff',
  },
});
