# RuangDana — Pelacak Keuangan

Dashboard responsif untuk mencatat pemasukan dan pengeluaran bulanan dalam rupiah. Dibangun dengan React, Vite, Recharts, dan Lucide.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Vite menampilkan alamat lokal di terminal. Untuk build produksi:

```bash
npm run build
npm run preview
```

## Fitur

- Ringkasan saldo bersih, pemasukan, dan pengeluaran per bulan
- Navigasi bulan dan grafik arus kas
- Tampilan anggaran kategori
- Tambah transaksi pemasukan/pengeluaran
- Cari dan filter transaksi
- Ekspor transaksi bulan terpilih ke CSV
- Mode demo lokal memakai localStorage; mode Supabase memakai login dan sinkronisasi database antarperangkat
- Layout responsif untuk desktop dan ponsel

## Supabase

1. Jalankan SQL di `supabase/schema.sql` melalui SQL Editor Supabase.
2. Salin `.env.example` menjadi `.env.local`, lalu isi URL project dan publishable key Supabase.
3. Jalankan `npm run dev` dan buat akun melalui halaman masuk.

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk instruksi lengkap Git + Cloudflare Pages, konfigurasi redirect Auth, dan environment variables produksi.
