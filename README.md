# Sistem Pengurusan Kokurikulum Sekolah (KOKO)

Sistem web untuk mengurus kokurikulum sekolah: laporan & kehadiran perjumpaan, program/aktiviti, jawatan unit, ekstra kurikulum, pencapaian murid & sekolah — dengan markah kokurikulum dikira automatik.

## Modul

| Modul | Fungsi |
|---|---|
| **Utama (Dashboard)** | Jumlah murid (L/P), guru, unit, program, pingat, rumusan ahli setiap unit |
| **Laporan Perjumpaan** | Pilih unit (BB / KP / SP / RS) → tambah/edit/cetak laporan dengan kehadiran |
| ↳ Analisis & Semakan | Pemantauan bilangan laporan setiap unit vs sasaran |
| **Kehadiran Perjumpaan** | Rekod hadir/tidak hadir pantas setiap perjumpaan |
| ↳ Analisis Kehadiran | Matriks kehadiran murid (✓ ✗ –) & analisis kehadiran guru |
| **Program / Aktiviti** | Aliran 3 langkah: Daftar Program → Laporan Program → Laporan Selesai |
| **Jawatan Unit** | Lantik Pengerusi, Naib, Setiausaha, Bendahari, AJK |
| **Ekstra Kurikulum** | Pengawas, Pembaca Ikrar, PSS, PRS, dll. |
| **Pencapaian Murid** | Profil murid, markah & gred, murid terbaik, rekod pencapaian individu |
| **Pencapaian Sekolah** | Kiraan Johan/Naib/Ketiga/Saguhati, rumusan ikut peringkat |
| **Pengurusan & Admin** | Profil sekolah, logo, warna tema, data murid/guru (tampal dari Excel), unit, agihan unit, pemberat markah, sandaran data |

Lain-lain: log masuk Guru / Pentadbir / Tetamu (baca sahaja), carian pantas **Ctrl+K**, mod gelap, notifikasi, cetak laporan, responsif telefon.

## Cara guna

### A. Demo pantas (tanpa pemasangan)
Buka `index.html` terus dalam pelayar (atau aktifkan **GitHub Pages** untuk repo ini). Data demo dimuatkan dan disimpan dalam pelayar anda sahaja.
Log masuk: **Pentadbir Sistem** / katalaluan **admin123**.

### B. Pasang sebagai Web App Google Apps Script (data dalam Google Sheet, dikongsi semua guru)
1. Cipta **Google Sheet** baharu → **Extensions → Apps Script**.
2. Tampal kandungan `Code.gs` ke dalam fail `Code.gs`.
3. Klik **+ → HTML**, namakan `index`, tampal kandungan `index.html`.
4. **Deploy → New deployment → Web app** — *Execute as:* **Me**, *Who has access:* **Anyone** (atau dalam domain sekolah).
5. Buka URL web app → log masuk **Pentadbir Sistem** / **admin123** → tukar katalaluan di **Pengurusan & Admin → Profil Sekolah**.
6. Mula dengan **Sandaran Data → Muat Data Demo** untuk mencuba, atau terus isi Data Guru, Daftar Unit dan Import Murid.

Setiap koleksi disimpan dalam tab tersendiri (`murid`, `guru`, `unit`, `perjumpaan`, `program`, `jawatan`, `ekstra`, `pencapaian`, `settings`). Katalaluan disemak di pelayan dan setiap perubahan memerlukan token sesi (6 jam).

## Log masuk
- **Pentadbir** — semua akses termasuk Setup.
- **Guru** — pilih nama, katalaluan = No. KP (tanpa '-'). Boleh isi laporan, kehadiran, program, jawatan, pencapaian.
- **Tetamu Awam** — lihat sahaja.

## Import murid dari Excel
Di **Data Murid → Import / Tampal Excel**, salin lajur berikut dan tampal:

```
Nama | No KP | Jantina | Tahun | Kelas | Badan Beruniform | Kelab | Sukan | Rumah Sukan
```
Jantina dikesan daripada No. KP jika kosong. Murid sedia ada (No. KP sama) akan dikemas kini.

## Formula markah (boleh ubah di Setup → Markah & Tetapan)
Kehadiran (50) + Jawatan (10) + Pencapaian (20) + Penglibatan Program (10) + Ekstra (10) = **100**
Gred: A ≥ 80, B ≥ 60, C ≥ 40, D ≥ 20, E < 20.
