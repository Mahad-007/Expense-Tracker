import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AccountWithBalance} from '../types';
import {COLORS} from '../utils/constants';
import {formatCurrency} from '../utils/format';

interface Props {
  account: AccountWithBalance;
  onPress: () => void;
  onDelete?: (id: string) => void;
}

export default function AccountCard({account, onPress, onDelete}: Props) {
  const isProcessing = account.type === 'processing';

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? All transactions for this account will also be deleted.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(account.id),
        },
      ],
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={handleLongPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={[styles.iconBox, {backgroundColor: isProcessing ? '#FFF7ED' : '#EEF2FF'}]}>
          <Icon
            name={isProcessing ? 'clock-outline' : 'wallet'}
            size={22}
            color={isProcessing ? COLORS.processing : COLORS.primary}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{account.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, {backgroundColor: isProcessing ? '#FFF7ED' : '#EEF2FF'}]}>
              <Text style={[styles.badgeText, {color: isProcessing ? COLORS.processing : COLORS.primary}]}>
                {account.currency}
              </Text>
            </View>
            {isProcessing && (
              <View style={[styles.badge, {backgroundColor: '#FFF7ED'}]}>
                <Text style={[styles.badgeText, {color: COLORS.processing}]}>
                  Processing
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.balance, {color: isProcessing ? COLORS.processing : COLORS.text}]}>
          {formatCurrency(account.balance, account.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
