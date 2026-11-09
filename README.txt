PAKET HALAMAN TUGAS SURAT RESMI

ISI REPOSITORI
- index.html                      Halaman tugas dan tombol pengumpulan
- Surat Resmi.docx                Template surat resmi
- Data Surat Resmi.xlsx           Sumber data mail merge (10 penerima)
- submission.js                   Membuka form pengumpulan Apps Script
- submission-config.js            URL deployment Apps Script
- apps-script/Code.gs             Backend penyimpanan Drive dan Sheets
- apps-script/SubmissionForm.html  Form upload dan notifikasi berhasil/gagal
- APPS_SCRIPT_SETUP.md             Panduan setup dan deployment

PENGUMPULAN TUGAS
Form upload berjalan di halaman Apps Script. Setelah proses selesai, notifikasi sukses/gagal tampil langsung di tab form. File disimpan ke Google Drive dan metadata ke Google Sheets.

PENTING
Setelah memperbarui Code.gs atau menambahkan SubmissionForm.html di Apps Script, lakukan Deploy -> Manage deployments -> Edit -> New version -> Deploy agar versi Web App terbaru digunakan.
