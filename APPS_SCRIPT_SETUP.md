# Apps Script — Pengumpulan Praktikum Mail Merge LPMN

## Perbarui project Apps Script yang sudah digunakan

1. Buka project Apps Script yang sekarang dipakai untuk pengumpulan tugas.
2. Ganti seluruh isi `Code.gs` dengan versi terbaru dari `apps-script/Code.gs` di repositori.
3. Buka file HTML `SubmissionForm` yang sudah ada, lalu ganti seluruh isinya dengan `apps-script/SubmissionForm.html` terbaru.
4. Simpan kedua file.
5. Klik **Deploy → Manage deployments → Edit** pada deployment Web App saat ini.
6. Pilih **New version → Deploy**.

Tidak perlu membuat project baru, menjalankan `setup()` lagi, atau mengganti URL Web App.

## Perubahan yang sudah disiapkan

- Halaman tugas menampilkan soal praktikum LPMN.
- Tombol Unduh Excel menghasilkan file `Data_surat.xlsx` berisi 15 penerima dan 5 kolom asli.
- Form meminta dua dokumen DOCX: `Template_Surat.docx` dan `Hasil_Mail_Merge.docx`.
- Kedua berkas disimpan di folder Drive yang sudah digunakan sebelumnya.
- Tab baru `Pengumpulan_Surat_Resmi` dibuat otomatis dalam Spreadsheet yang sama. Tab rekap lama tidak diubah.
- Satu siswa menghasilkan satu baris rekap dengan tautan ke dua file.

## Batasan unggahan

Kedua file wajib berformat DOCX dan maksimal 10 MB per file. Form menampilkan notifikasi berhasil atau gagal setelah server selesai memproses kedua berkas.
