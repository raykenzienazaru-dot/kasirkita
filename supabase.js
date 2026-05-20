// ====== KASIRKITA - SUPABASE GLOBAL CLIENT ======
const SUPABASE_URL = 'https://qahaxqczpucblwsurouj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGF4cWN6cHVjYmx3c3Vyb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDUxMjMsImV4cCI6MjA5NDYyMTEyM30.pN0cYJT4UaPsnhY0cMTNfFyTcY9evhGPR1T5DhYuHfQ';

// Pastikan pustaka CDN sudah dimuat
if (typeof supabase === 'undefined') {
  console.warn("Supabase CDN belum terdeteksi. Pastikan tag script CDN dimuat sebelum berkas ini.");
} else {
  // Inisialisasi Client secara global
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase Client berhasil diinisialisasi secara global.");
}
