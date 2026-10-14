# RuangDana — Personal Finance Tracker

RuangDana adalah aplikasi web responsif untuk mencatat pemasukan dan pengeluaran, memantau anggaran, dan memahami pola keuangan bulanan. Project ini dibuat sebagai aplikasi portofolio yang menunjukkan pengembangan frontend React, integrasi backend-as-a-service, visualisasi data, keamanan akses berbasis akun, version control, dan deployment berkelanjutan.

**Production:** [Buka RuangDana](https://financial-tracker.mariojoshua-1903.workers.dev) · **Bahasa UI:** Indonesia · **Mata uang awal:** IDR

**Pusat bantuan / kontak:** [mariojoshua.1903@gmail.com](mailto:mariojoshua.1903@gmail.com?subject=Bantuan%20RuangDana)

> RuangDana mencatat transaksi secara manual. Aplikasi ini tidak terhubung ke rekening bank dan bukan alat nasihat keuangan.

## Fitur saat ini

- Ringkasan pemasukan, pengeluaran, dan saldo bersih dengan pemilih bulan.
- Grafik arus kas harian dan anggaran bulanan serta kategori.
- Tambah, cari, filter, ekspor CSV, dan hapus transaksi individual.
- Halaman Insight dengan perbandingan pemasukan/pengeluaran per bulan, komposisi pengeluaran, rasio tabungan, dan ringkasan tahunan.
- Pengaturan profil, mata uang (IDR, USD, SGD, MYR), anggaran keseluruhan, dan batas per kategori.
- Halaman Pusat Bantuan dengan email pengelola dan form kritik/saran yang menyiapkan draft email pengguna.
- Saldo tabungan berjalan: tetapkan saldo awal dan tanggal acuannya; pemasukan setelah tanggal itu menambah estimasi dan pengeluaran menguranginya.
- Autentikasi email/password Supabase. Beberapa akun dapat digunakan bergantian dalam browser; password tidak disimpan sebagai daftar akun.
- Supabase Row Level Security (RLS) membatasi transaksi dan preferensi ke pemilik akun.
- Tampilan responsif yang dapat dibuka dari desktop dan browser ponsel.
- Mode demo tanpa kredensial Supabase; data demo tersimpan di `localStorage` browser itu saja.

### Panduan kategori transaksi

Kategori berubah sesuai jenis transaksi agar pemasukan dan pengeluaran tidak tercampur:

- **Pengeluaran:** Makanan & Minuman, Belanja Rumah Tangga, Transportasi, Tagihan & Utilitas, Hunian, Kesehatan, Pendidikan, Hiburan & Rekreasi, Perawatan Diri, Keluarga & Sosial, Biaya Keuangan, Pajak, dan Lainnya.
- **Pemasukan:** Gaji, Freelance / Proyek, Usaha, Bonus & Komisi, Investasi, Hadiah, Refund, dan Lainnya.

Contoh: kopi atau makan siang dicatat sebagai **Makanan & Minuman**; belanja kebutuhan rumah sebagai **Belanja Rumah Tangga**. **Freelance / Proyek** dipisahkan dari **Gaji** karena sumber penghasilan dan pola pencatatannya berbeda, walaupun keduanya merupakan pekerjaan.

## Teknologi dan peran

| Bagian | Teknologi | Tanggung jawab |
| --- | --- | --- |
| Frontend | React 18, JavaScript, Vite 6 | UI single-page, form, navigasi, kalkulasi metrik dari transaksi |
| Visualisasi | Recharts | Grafik arus kas, tren tahunan, dan komposisi kategori |
| Ikon dan tampilan | Lucide React, CSS | Ikon dan layout responsif |
| Backend-as-a-Service | Supabase Auth + PostgreSQL | Login, sesi akun, database transaksi dan preferensi |
| Proteksi data | PostgreSQL RLS | Membatasi baca/tulis data berdasarkan `auth.uid()` |
| Version control | Git + GitHub | Riwayat perubahan, branch, commit, dan sumber build produksi |
| Hosting/build | Cloudflare Workers Static Assets + Wrangler | Build aset Vite dan menyajikan aplikasi melalui HTTPS |

Tidak ada server API khusus yang dikelola project ini. Browser berkomunikasi dengan Supabase menggunakan Supabase JavaScript client dan publishable key. Otorisasi data dilakukan oleh kebijakan RLS di database, bukan dengan menyembunyikan key di frontend.

## Alur data

```text
Browser / React
  ├─ tanpa env Supabase → localStorage (mode demo, per browser)
  └─ dengan env Supabase → Supabase Auth
                            ├─ public.transactions
                            └─ public.user_settings
                               keduanya dilindungi RLS

GitHub main → Cloudflare Workers Builds → npm run build → npx wrangler deploy
```

Transaksi disimpan di `public.transactions`. Preferensi termasuk mata uang, anggaran, dan saldo tabungan awal disimpan per pengguna di `public.user_settings`. Estimasi tabungan dihitung sebagai saldo awal ditambah semua pemasukan dan dikurangi semua pengeluaran sejak tanggal acuan; ini bukan integrasi saldo rekening bank. Analitik dihitung dari record transaksi yang dimuat; angka insight bukan data eksternal atau prediksi. Pada mode Supabase, akun yang sama dapat membuka data yang sama di perangkat berbeda.

## Prasyarat

- Node.js versi LTS dan npm.
- Git.
- Project Supabase untuk Auth dan database.
- Akun GitHub dan Cloudflare untuk deployment publik.

## Menjalankan di komputer lokal

1. Clone repository dan masuk ke direktori project:

   ```powershell
   git clone https://github.com/MarioJ1903/Financial-Tracker.git
   cd Financial-Tracker
   ```

2. Install dependencies dari lockfile:

   ```powershell
   npm ci
   ```

3. Buat `.env.local` dari contoh, lalu isi URL dan publishable key project Supabase:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Nilainya tersedia di Supabase **Project Settings → API Keys** atau dialog **Connect**. Alternatifnya, tanpa `.env.local`, aplikasi berjalan dalam mode demo lokal.

4. Buat tabel dan kebijakan database melalui Supabase **SQL Editor**. Untuk project baru, jalankan `supabase/schema.sql`. Untuk database lama yang sudah memiliki tabel transaksi, jalankan `supabase/user-settings-migration.sql` agar halaman Pengaturan dapat menyimpan preferensi.

5. Di Supabase **Authentication → URL Configuration**, tambahkan `http://localhost:5173/**` ke daftar redirect saat pengembangan lokal. Aktifkan/konfirmasi email jika konfigurasi Auth project mengharuskannya.

6. Jalankan aplikasi:

   ```powershell
   npm run dev
   ```

   Buka URL yang dicetak Vite di terminal, umumnya `http://localhost:5173`.

Perintah lain:

```powershell
npm run build    # hasil produksi ke dist/
npm run preview  # sajikan build lokal untuk ditinjau
```

## Database dan keamanan

Schema dan RLS disimpan sebagai SQL yang dapat ditinjau di folder [`supabase/`](./supabase/):

- `schema.sql`: tabel transaksi, tabel preferensi, index, grant, dan kebijakan RLS.
- `user-settings-migration.sql`: migrasi tambahan untuk project yang tabel transaksinya sudah ada sebelum fitur pengaturan/tabungan.

Setiap record transaksi memiliki `user_id`; default database mengisinya dari `auth.uid()`. Kebijakan RLS membatasi setiap akun agar hanya dapat membaca, menambah, mengubah, atau menghapus record miliknya. Tabel preferensi memakai `user_id` sebagai primary key dan memiliki kebijakan serupa.

**Jangan pernah** memasukkan Supabase `secret` atau `service_role` key ke `.env.local` dengan prefix `VITE_`, source frontend, Git, atau pengaturan build Cloudflare. Browser memang dapat melihat publishable key; keamanan record bergantung pada RLS yang benar. Jangan matikan RLS untuk mengatasi error akses.

File `.env.local` diabaikan Git oleh `.gitignore`. Jangan commit file itu. Periksa `git status` sebelum push.

## Git workflow

Perubahan yang dibuat di komputer perlu disimpan dengan commit dan dikirim ke GitHub:

```powershell
git status
git pull --ff-only origin main
# edit file dan jalankan npm run build
git add README.md src supabase
git status
git commit -m "docs: improve project readme"
git push origin main
```

Gunakan pesan commit yang menjelaskan tujuan, misalnya `feat: add monthly insights` atau `fix: validate transaction amount`. Untuk pekerjaan yang lebih besar, buat branch:

```powershell
git switch -c feature/nama-fitur
git add .
git commit -m "feat: nama fitur"
git push -u origin feature/nama-fitur
```

Buka Pull Request di GitHub untuk meninjau perubahan, lalu gabungkan ke `main` setelah siap rilis.

## Deploy Cloudflare Workers

Repository ini menggunakan **Cloudflare Workers Builds** dan Wrangler, bukan Cloudflare Pages. Konfigurasi aset statis dan SPA fallback ada di [`wrangler.jsonc`](./wrangler.jsonc).

### Deploy otomatis lewat GitHub

Worker `financial-tracker` terhubung ke GitHub. Push ke branch `main` memicu build dan deploy otomatis. Pengaturan build yang dipakai:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Production branch: `main`

Di Cloudflare Worker **Settings → Builds → Variables and secrets**, tambahkan variabel build:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Vite menanamkan nilai `VITE_` ke aset saat build. Jika nilainya berubah, jalankan deployment baru. Pantau **Workers & Pages → financial-tracker → Deployments** sampai status **Ready**, lalu buka URL Worker pada komputer atau ponsel.

Setelah URL produksi tersedia, tambahkan URL HTTPS tersebut ke Supabase **Authentication → URL Configuration** sebagai **Site URL** dan **Redirect URL**. Jangan gunakan URL localhost sebagai Site URL produksi.

### Deploy manual dari PowerShell

Cara ini menerbitkan file lokal secara langsung. Pastikan build berisi perubahan yang ingin dirilis dan kredensial Supabase lokal menunjuk ke project yang benar.

```powershell
Set-Location "C:\path\to\Financial-Tracker"
git status
git pull --ff-only origin main
npm ci
npm run build
npx wrangler login       # biasanya cukup sekali per komputer
npx wrangler whoami
npx wrangler deploy
```

Wrangler membaca konfigurasi `wrangler.jsonc` dan mengirim isi `dist/`. Untuk riwayat perubahan yang rapi, commit dan push perubahan sebelum deploy manual.

## Penggunaan melalui ponsel

Buka URL HTTPS Worker menggunakan browser ponsel dan login dengan akun Supabase yang sama. Aplikasi responsif, tetapi saat ini **belum** dikemas sebagai aplikasi native dan belum memiliki dukungan offline/PWA. Jika diinginkan, browser dapat menambahkan situs ke layar utama melalui menu **Add to Home Screen**.

## Batasan saat ini

- Transaksi dimasukkan manual; tidak ada integrasi bank atau sinkronisasi otomatis rekening.
- CSV dapat diekspor, tetapi belum tersedia fitur impor CSV atau migrasi otomatis dari `localStorage` ke Supabase.
- Transaksi dapat dihapus, tetapi belum dapat diedit setelah disimpan.
- Browser hanya memiliki satu sesi Supabase aktif pada satu waktu. Daftar akun yang dikenal menyimpan alamat email saja; beralih akun memerlukan autentikasi ulang.
- Preferensi di mode demo disimpan lokal pada browser. Sinkronisasi antarperangkat hanya tersedia dalam mode Supabase.
- Belum ada laporan PDF, transaksi berulang, notifikasi anggaran, reset password khusus di UI, atau audit log.
- Anggaran adalah batas manual. Insight bersifat deskriptif dari transaksi yang tercatat dan tidak mengklasifikasikan/memprediksi otomatis.
- Saldo tabungan adalah estimasi arus kas berdasarkan seluruh transaksi sejak tanggal acuan. Jika pengeluaran berasal dari rekening lain atau tidak boleh mengurangi tabungan, model beberapa rekening/sumber dana perlu dikembangkan terlebih dahulu.

## Roadmap pengembangan

Urutan kandidat pekerjaan berikutnya:

1. Edit transaksi dengan validasi form dan audit trail perubahan.
2. Impor CSV dengan pratinjau, pemetaan kolom, validasi tanggal/nominal, deteksi duplikat, dan opsi rollback.
3. Reset password, verifikasi email yang lebih jelas, serta pengelolaan sesi/perangkat.
4. Filter tanggal khusus, pagination, ekspor tahunan, dan laporan PDF.
5. Transaksi berulang, target tabungan, notifikasi saat mendekati batas anggaran.
6. Automated tests untuk kalkulasi periode, RLS/data ownership, konversi nominal, filter, dan CSV; tambah CI build pada Pull Request.
7. PWA dengan manifest, ikon aplikasi, dan strategi offline yang tidak mengorbankan keamanan sinkronisasi.
8. Pisahkan komponen dan logika data ke modul khusus, lalu pertimbangkan TypeScript ketika cakupan UI/data bertambah.

Roadmap adalah usulan; implementasikan berdasarkan kebutuhan dan umpan balik pengguna, dengan prioritas menjaga isolasi data setiap akun.

## Dokumentasi project

- [Architecture](./architecture.md) — komponen, aliran data, persistence, dan privasi.
- [Deployment guide](./DEPLOYMENT.md) — langkah setup Supabase, Git, dan Cloudflare beserta alternatif hosting.
- [Agent guidelines](./agent.md) — konvensi untuk kontribusi/pengembangan berikutnya.

## Lisensi

Belum ada lisensi open-source yang ditetapkan. Tambahkan file `LICENSE` sebelum mengizinkan penggunaan ulang kode secara publik.

## Palet visual

Tema memakai satu keluarga warna sage dan forest agar seluruh dashboard terasa harmonis: Forest #405B4D untuk identitas dan teks utama, Sage #527A64 untuk aksi dan pemasukan, Sage muted #7F8F80 untuk pengeluaran dan grafik pembanding, Pale Sage #DDE6DC untuk kartu penekanan, serta Warm Neutral #F3F5F0 sebagai latar. Perbedaan pemasukan dan pengeluaran tetap terlihat melalui kontras tingkat warna dan ikon, tanpa aksen warna yang menyolok.
