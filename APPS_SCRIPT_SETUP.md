# Google Apps Script — Mail Merge Submission

Upload sekarang memakai halaman mandiri Apps Script dengan `google.script.run`. Success/failure handler akan menampilkan hasil langsung di halaman form, tanpa `postMessage` atau iframe lintas-domain.

## File yang diperlukan

- `apps-script/Code.gs`: backend Drive + Sheets.
- `apps-script/SubmissionForm.html`: halaman upload dengan notifikasi.
- `submission-config.js`: URL Web App untuk tombol di halaman statis.
- `submission.js`: membuka halaman upload Apps Script.

## Update project Apps Script

1. Buka project Apps Script yang saat ini dipakai menyimpan data.
2. Ganti isi `Code.gs` dengan versi dari `apps-script/Code.gs` di repositori.
3. Tambahkan file HTML baru bernama **SubmissionForm** (nama file tanpa .html di editor Apps Script), lalu salin isi `apps-script/SubmissionForm.html`.
4. Pastikan fungsi `setup()` yang sebelumnya sudah dijalankan. Tidak perlu dijalankan ulang selama Script Properties `SPREADSHEET_ID` dan `FOLDER_ID` masih ada.
5. Klik **Deploy → Manage deployments → Edit** pada deployment Web App yang sedang digunakan.
6. Pilih **New version**, lalu **Deploy**. URL `/exec` deployment yang sama biasanya tetap.
7. Pastikan akses Web App mengizinkan siswa membuka form. Jika memilih **Anyone**, endpoint dapat diakses publik.

## Hubungkan halaman statis

`submission-config.js` saat ini menyimpan URL deployment yang sudah dipakai. Jangan mengubah URL itu apabila deployment yang sama diperbarui. Commit/push file statis di branch `main` jika ada perubahan.

Siswa membuka halaman tugas → klik **Buka Form Pengumpulan** → mengisi nama dan kelas → memilih satu file PDF/DOC/DOCX maksimal 10 MB → klik **Kirim Tugas**. Konfirmasi berhasil/gagal muncul di halaman Apps Script yang terbuka pada tab baru.

## Hasil penyimpanan

Berkas disimpan di folder Drive `Pengumpulan Tugas Surat Resmi`. Metadata dicatat di spreadsheet `Rekap Pengumpulan Tugas Surat Resmi`, sheet `Pengumpulan`.

Jika pengiriman sukses di Drive/Sheets tetapi siswa tidak melihat konfirmasi, pastikan Apps Script sudah diperbarui ke **New version** dan file HTML `SubmissionForm` sudah ditambahkan ke project Apps Script yang sama.
