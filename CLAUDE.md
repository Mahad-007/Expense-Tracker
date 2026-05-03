# Expense Tracker for Cognitix

## Project Overview
React Native CLI (bare) expense tracker app for Cognitix company. Tracks monthly income/expenses across multiple bank/wallet accounts with special handling for freelance USD accounts (Upwork/Contra).

## Tech Stack
- **Framework**: React Native CLI 0.85.2 (bare, NOT Expo)
- **Language**: TypeScript
- **Backend**: Supabase (project: `tgxgsdxtviwliepapvxv`)
- **State Management**: TanStack Query (server state) + React Context (auth only)
- **Navigation**: React Navigation 7 (bottom tabs + native stack)
- **Charts**: react-native-chart-kit + react-native-svg
- **Icons**: react-native-vector-icons (MaterialCommunityIcons)
- **Dates**: dayjs

## Architecture
- `src/lib/supabase.ts` — Supabase client singleton
- `src/hooks/` — TanStack Query hooks for all data operations
- `src/screens/` — Screen components (9 total)
- `src/components/` — Reusable UI components
- `src/navigation/` — React Navigation setup with auth guard
- `src/types/` — TypeScript interfaces
- `src/utils/` — Formatters and constants

## Key Business Rules
- Accounts have two types: `local` (PKR) and `processing` (USD)
- **Processing accounts (Upwork/Contra) are EXCLUDED from main dashboard balance**
- Transfers from processing → local track exchange rate and auto-create two transactions via DB trigger
- Expenses are categorized as `recurring` or `one-time`
- All authenticated users share the same company data (no per-user isolation)

## Database
- Tables: accounts, categories, transactions, transfers
- View: account_balances (computed from initial_balance + transactions)
- Trigger: handle_transfer() auto-creates expense+income transactions on transfer insert
- RLS: all authenticated users have full CRUD access

## Commands
- `npx react-native run-android` — Run on Android
- `npx react-native run-ios` — Run on iOS
- `npx supabase db push` — Push migrations to Supabase
- `npx supabase migration new <name>` — Create new migration
