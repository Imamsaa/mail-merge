PAKET HALAMAN TUGAS SURAT RESMI

ISI REPOSITORI
- index.html                  Halaman tugas dan form pengumpulan
- Surat Resmi.docx            Template surat resmi
- Data Surat Resmi.xlsx       Sumber data mail merge (10 penerima)
- submission.js               Validasi dan pengiriman berkas siswa
- submission-config.js        Konfigurasi URL Web App Apps Script
- apps-script/Code.gs         Backend penyimpanan Drive dan pencatatan Sheets
- APPS_SCRIPT_SETUP.md        Panduan setup dan deployment Apps Script

FITUR PENGUMPULAN
- Input nama lengkap dan kelas siswa.
- Unggah PDF, DOC, atau DOCX maksimal 10 MB.
- File disimpan di Google Drive.
- Metadata pengumpulan dicatat di Google Sheets.

AKTIVASI APPS SCRIPT
1. Ikuti APPS_SCRIPT_SETUP.md.
2. Salin apps-script/Code.gs ke project di script.google.com.
3. Jalankan setup(), lalu deploy sebagai Web App.
4. Tempel URL deployment yang berakhiran /exec ke submission-config.js.
5. Commit perubahan konfigurasi ke branch main.

CARA MEMPUBLIKASIKAN
Aktifkan GitHub Pages dari branch main (root). Pastikan file template Word dan Excel tetap berada di root yang sama dengan index.html.
