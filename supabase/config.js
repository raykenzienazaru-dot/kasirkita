// ====== Kasirkita / Supabase config ======
// Anon key boleh dipakai di frontend. Jangan taruh service_role key di sini.

export const SUPABASE_URL = 'https://qahaxqczpucblwsurouj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGF4cWN6cHVjYmx3c3Vyb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDUxMjMsImV4cCI6MjA5NDYyMTEyM30.pN0cYJT4UaPsnhY0cMTNfFyTcY9evhGPR1T5DhYuHfQ';

export const SUPABASE_TABLES = {
  products: 'products',
  dailyDiscounts: 'daily_discounts',
  transactions: 'transactions',
  transactionItems: 'transaction_items',
  stockHistory: 'stock_history',
};

export const STORAGE_BUCKETS = {
  productImages: 'product-images',
  paymentProofs: 'payment-proofs',
};
