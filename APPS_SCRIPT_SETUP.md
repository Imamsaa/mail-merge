# Apps Script — Pengumpulan Praktikum Mail Merge LPMN

Halaman tugas mengunduh database Excel berisi 15 penerima. Form meminta dua file DOCX: Template_Surat.docx dan Hasil_Mail_Merge.docx.

## Perbarui project Apps Script yang sudah digunakan

1. Buka project Apps Script yang sekarang dipakai untuk pengumpulan.
2. Ganti seluruh isi Code.gs dengan kode pada `apps-script/Code.gs` di repositori.
3. Buka file HTML `SubmissionForm` yang sudah ada, lalu ganti seluruh isinya dengan `apps-script/SubmissionForm.html` terbaru.
4. Simpan kedua file.
5. Pilih **Deploy → Manage deployments → Edit** pada deployment Web App saat ini.
6. Pilih **New version → Deploy**.

Tidak perlu membuat project baru, menjalankan setup() lagi, atau mengganti URL Web App.

## Penyimpanan

Backend memakai Script Properties FOLDER_ID dan SPREADSHEET_ID yang telah ada. File masuk ke folder Drive yang sama seperti sebelumnya. Tab baru bernama `Pengumpulan_Surat_Resmi` akan dibuat otomatis saat pengumpulan LPMN pertama masuk. Setiap siswa menghasilkan satu baris berisi tautan ke kedua file. Tab rekap lama tidak diubah.

## Catatan siswa

- Kedua file wajib format DOCX.
- Ukuran maksimal 10 MB per file.
- Nama file dapat disimpan di Drive dengan awalan nama siswa dan waktu pengumpulan.
- Konfirmasi berhasil/gagal tampil di halaman Apps Script setelah proses server selesai.
