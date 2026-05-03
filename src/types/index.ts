export interface Account {
  id: string;
  name: string;
  type: 'local' | 'processing';
  currency: 'PKR' | 'USD';
  initial_balance: number;
  created_at: string;
  created_by: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  currency: 'PKR' | 'USD';
  description: string | null;
  recurrence: 'one-time' | 'recurring';
  date: string;
  created_at: string;
  created_by: string;
  // Joined fields
  category?: Category;
  account?: Account;
}

export interface Transfer {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount_from: number;
  amount_to: number;
  exchange_rate: number;
  description: string | null;
  date: string;
  created_at: string;
  created_by: string;
  // Joined fields
  from_account?: Account;
  to_account?: Account;
}

export interface CreateAccountInput {
  name: string;
  type: 'local' | 'processing';
  currency: 'PKR' | 'USD';
  initial_balance: number;
}

export interface CreateTransactionInput {
  account_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  recurrence: 'one-time' | 'recurring';
  date: string;
}

export interface CreateTransferInput {
  from_account_id: string;
  to_account_id: string;
  amount_from: number;
  amount_to: number;
  exchange_rate: number;
  description: string | null;
  date: string;
}
