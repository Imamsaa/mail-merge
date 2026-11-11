PRAKTIKUM MAIL MERGE — LPMN

FILE UTAMA
- index.html                       Soal praktikum dan petunjuk.
- database-download.js             Unduhan database Excel 15 penerima.
- submission-config.js             URL deployment Apps Script.
- submission.js                    Membuka form pengumpulan.
- apps-script/Code.gs              Backend penyimpanan Drive + rekap Sheets.
- apps-script/SubmissionForm.html  Form upload dua file DOCX.

TUGAS SISWA
Siswa membuat Template_Surat.docx sendiri, lalu menggunakan Mail Merge dengan database Excel untuk menghasilkan 15 surat dan menyimpan hasilnya sebagai Hasil_Mail_Merge.docx.

PENGUMPULAN
Siswa mengunggah dua file DOCX:
1. Template_Surat.docx
2. Hasil_Mail_Merge.docx

AKTIVASI
Perbarui Code.gs dan file HTML SubmissionForm pada project Apps Script yang telah digunakan, lalu Deploy -> Manage deployments -> Edit -> New version -> Deploy. Tidak perlu membuat project baru atau mengganti URL /exec.
