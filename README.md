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

### A. Demo pantas (tanpa Firebase)
Biarkan `FIREBASE_CONFIG` kosong dan buka `index.html` dalam pelayar. Data demo disimpan dalam pelayar itu sahaja.
Log masuk: **Pentadbir Sistem** / katalaluan **admin123**.

### B. Guna Firebase (data dikongsi semua guru)
1. Buka <https://console.firebase.google.com> → **Add project** (Google Analytics tidak perlu).
2. **Build → Firestore Database → Create database** → pilih lokasi `asia-southeast1` (Singapura) → *Production mode*.
3. **Build → Authentication → Get started → Sign-in method** → aktifkan **Email/Password** dan **Anonymous**.
4. **Authentication → Users → Add user** → cipta akaun pentadbir, cth. `admin@sekolah.edu.my` + katalaluan (min. 6 aksara).
5. **Project settings (⚙️) → Your apps → Web (`</>`)** → daftar app → salin objek `firebaseConfig`.
6. Dalam `index.html`, isi `FIREBASE_CONFIG` dan tukar `ADMIN_EMAIL` kepada e-mel pentadbir di langkah 4.
7. **Firestore Database → Rules** → tampal kandungan `firestore.rules` (tukar e-mel pentadbir di dalamnya juga) → **Publish**.
8. Hos `index.html` di **GitHub Pages** (Settings → Pages → branch `main`) atau **Firebase Hosting** (`firebase deploy`).
9. **Authentication → Settings → Authorized domains** → tambah domain hos anda (cth. `skagamamiri.github.io`).
10. Buka sistem → log masuk **Pentadbir Sistem** dengan katalaluan langkah 4 → **Pengurusan & Admin → Sandaran Data → Muat Data Demo** untuk mencuba, atau terus isi Data Guru, Unit dan Murid.

> `apiKey` Firebase bukan rahsia — keselamatan data dikawal oleh **Firestore Rules** dan **Firebase Authentication**.

### Struktur Firestore
| Koleksi | Kandungan | Siapa boleh ubah |
|---|---|---|
| `tetapan/utama` | profil sekolah, logo, tema, pemberat markah | Pentadbir |
| `murid`, `guru`, `unit` | data induk | Pentadbir |
| `perjumpaan`, `program`, `jawatan`, `ekstra`, `pencapaian` | rekod aktiviti | Guru & Pentadbir |
| `guruPrivate` | No. KP guru + uid akaun | Pentadbir sahaja (baca & tulis) |
| `roles` | peranan akaun guru | Pentadbir |

## Log masuk
- **Pentadbir** — semua akses termasuk Setup. Katalaluan boleh ditukar di Profil Sekolah.
- **Guru** — pilih nama, katalaluan = No. KP. Akaun Firebase guru dicipta **automatik** apabila pentadbir menyimpan data guru (tukar No. KP = katalaluan baharu). Boleh isi laporan, kehadiran, program, jawatan, ekstra dan pencapaian.
- **Tetamu Awam** — lihat sahaja (No. KP murid disembunyikan). Untuk mematikan mod tetamu sepenuhnya, ubah `canRead()` dalam `firestore.rules`.

## Import murid dari Excel
Di **Data Murid → Import / Tampal Excel**, salin lajur berikut dan tampal:

```
Nama | No KP | Jantina | Tahun | Kelas | Badan Beruniform | Kelab | Sukan | Rumah Sukan
```
Jantina dikesan daripada No. KP jika kosong. Murid sedia ada (No. KP sama) akan dikemas kini.

## Formula markah (boleh ubah di Setup → Markah & Tetapan)
Kehadiran (50) + Jawatan (10) + Pencapaian (20) + Penglibatan Program (10) + Ekstra (10) = **100**
Gred: A ≥ 80, B ≥ 60, C ≥ 40, D ≥ 20, E < 20.
