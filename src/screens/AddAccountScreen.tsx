import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useCreateAccount} from '../hooks/useAccounts';
import {COLORS} from '../utils/constants';

export default function AddAccountScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [type, setType] = useState<'local' | 'processing'>('local');
  const [initialBalance, setInitialBalance] = useState('0');

  const createAccount = useCreateAccount();
  const currency = type === 'local' ? 'PKR' : 'USD';

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    createAccount.mutate(
      {
        name: name.trim(),
        type,
        currency: currency as 'PKR' | 'USD',
        initial_balance: Number(initialBalance) || 0,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err: Error) => Alert.alert('Error', err.message),
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. HBL Mahad"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Account Type</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, type === 'local' && styles.toggleActive]}
          onPress={() => setType('local')}>
          <Text style={[styles.toggleText, type === 'local' && styles.toggleTextActive]}>
            Local (PKR)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, type === 'processing' && styles.toggleActiveProcessing]}
          onPress={() => setType('processing')}>
          <Text style={[styles.toggleText, type === 'processing' && styles.toggleTextActive]}>
            Processing (USD)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {type === 'local'
          ? 'Local accounts are included in your main balance.'
          : 'Processing accounts (Upwork, Contra) are tracked separately in USD.'}
      </Text>

      <Text style={styles.label}>Initial Balance ({currency})</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
        value={initialBalance}
        onChangeText={setInitialBalance}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={createAccount.isPending}>
        {createAccount.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
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
  toggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleActiveProcessing: {
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
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
