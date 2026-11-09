# Integrasi Google Apps Script — Mail Merge

Halaman statis memakai submission-config.js untuk mengirim file tugas. Apps Script menyimpan file di Google Drive dan menambahkan catatan pengumpulan ke Google Sheets.

## 1. Buat project Apps Script

1. Buka https://script.google.com/ menggunakan akun Google guru.
2. Klik New project.
3. Ganti kode contoh di Code.gs dengan seluruh isi file apps-script/Code.gs dari repositori ini.
4. Simpan project.

## 2. Siapkan Drive dan Spreadsheet

1. Di editor Apps Script, pilih fungsi setup pada dropdown fungsi.
2. Klik Run.
3. Berikan izin akses Google Drive dan Google Sheets.
4. Setelah selesai, buka Execution log untuk melihat tautan Spreadsheet rekap dan folder Drive.
5. Script menyimpan ID keduanya di Script Properties. Jalankan setup() cukup sekali; pemanggilan ulang tidak membuat folder dan spreadsheet duplikat jika properti sudah tersimpan.

Spreadsheet memiliki sheet Pengumpulan dengan kolom waktu, nama, kelas, file, ukuran, tipe file, link Drive, dan ID pengumpulan.

## 3. Deploy sebagai Web App

1. Klik Deploy → New deployment.
2. Pilih tipe Web app.
3. Atur Execute as menjadi akun guru (Me).
4. Atur Who has access menjadi Anyone agar siswa dapat mengirim dari halaman GitHub Pages. Jika pilihan Anyone dibatasi oleh Google Workspace sekolah, gunakan kebijakan akses organisasi yang sesuai.
5. Klik Deploy, selesaikan otorisasi bila diminta, lalu salin URL Web App yang berakhiran /exec.

Catatan: endpoint ini bersifat publik sesuai pengaturan akses deployment. Backend membatasi unggahan menjadi PDF/DOC/DOCX dengan ukuran maksimal 10 MB.

## 4. Hubungkan dengan halaman GitHub Pages

1. Buka file submission-config.js di repositori.
2. Ganti PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI dengan URL Web App /exec yang baru disalin.
3. Commit perubahan ke branch main.
4. Pastikan index.html, submission.js, dan submission-config.js berada di root repositori yang sama.
5. Buka halaman GitHub Pages dan lakukan uji kirim menggunakan satu file percobaan kecil.

## 5. Cara memeriksa hasil

- Buka folder Google Drive Pengumpulan Tugas Surat Resmi untuk melihat berkas siswa.
- Buka Spreadsheet Rekap Pengumpulan Tugas Surat Resmi untuk memeriksa nama, kelas, waktu, serta tautan setiap berkas.
- Jika kode Apps Script diubah, buat deployment version baru melalui Deploy → Manage deployments → Edit → New version → Deploy.

## Catatan teknis

- Browser mengirim data melalui form tersembunyi ke Apps Script. Respons dikirim kembali ke halaman dengan postMessage, sehingga halaman statis tidak bergantung pada pembacaan respons fetch lintas-origin.
- File yang berhasil disimpan tetapi gagal dicatat ke spreadsheet akan dipindahkan ke Trash agar tidak meninggalkan file tanpa catatan.
- Setiap pengiriman dicatat sebagai baris baru. Pengiriman ulang oleh siswa akan membuat catatan dan berkas baru.
- URL deployment Apps Script tidak dimasukkan ke repositori sampai guru menyalinnya sendiri ke submission-config.js. Jangan menaruh password atau kredensial rahasia di file frontend.
