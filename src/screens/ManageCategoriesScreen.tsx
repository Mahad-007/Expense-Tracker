import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useCategories, useCreateCategory, useDeleteCategory} from '../hooks/useCategories';
import {COLORS, CATEGORY_ICONS} from '../utils/constants';
import {Category} from '../types';

export default function ManageCategoriesScreen() {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [newName, setNewName] = useState('');

  const {data: categories, isLoading} = useCategories(activeTab);
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    createCategory.mutate(
      {name: trimmed, type: activeTab},
      {
        onSuccess: () => setNewName(''),
        onError: (err: Error) => {
          if (err.message.includes('duplicate') || err.message.includes('unique')) {
            Alert.alert('Error', 'A category with this name already exists');
          } else {
            Alert.alert('Error', err.message);
          }
        },
      },
    );
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteCategory.mutate(category.id, {
              onError: (err: Error) => Alert.alert('Error', err.message),
            }),
        },
      ],
    );
  };

  const renderCategory = ({item}: {item: Category}) => {
    const iconName = CATEGORY_ICONS[item.name] || 'tag';
    return (
      <View style={styles.categoryRow}>
        <View style={styles.categoryInfo}>
          <Icon name={iconName} size={20} color={COLORS.primary} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="delete-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, activeTab === 'expense' && styles.toggleActiveExpense]}
          onPress={() => setActiveTab('expense')}>
          <Text style={[styles.toggleText, activeTab === 'expense' && styles.toggleTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, activeTab === 'income' && styles.toggleActiveIncome]}
          onPress={() => setActiveTab('income')}>
          <Text style={[styles.toggleText, activeTab === 'income' && styles.toggleTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add New Category */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={`New ${activeTab} category`}
          placeholderTextColor={COLORS.textMuted}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          disabled={createCategory.isPending}>
          {createCategory.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Icon name="plus" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Category List */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {activeTab} categories yet</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  toggleActiveExpense: {
    backgroundColor: COLORS.expense,
    borderColor: COLORS.expense,
  },
  toggleActiveIncome: {
    backgroundColor: COLORS.income,
    borderColor: COLORS.income,
  },
  toggleText: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 32,
  },
  list: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 32,
    fontSize: 14,
  },
});
