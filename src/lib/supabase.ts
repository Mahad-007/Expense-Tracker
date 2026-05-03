import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tgxgsdxtviwliepapvxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneGdzZHh0dml3bGllcGFwdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDAxNTUsImV4cCI6MjA5MzI3NjE1NX0.FNnKOA5So_LPiiFWOmD5AJA7Tw3suFUqcz2WUglfTn4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
