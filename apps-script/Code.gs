/**
 * MAIL MERGE — penerimaan tugas siswa.
 * Jalankan setup() satu kali sebelum deploy sebagai Web App.
 */

const APP_CONFIG = {
  SPREADSHEET_NAME: "Rekap Pengumpulan Tugas Surat Resmi",
  FOLDER_NAME: "Pengumpulan Tugas Surat Resmi",
  SHEET_NAME: "Pengumpulan",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ["pdf", "doc", "docx"]
};

function setup() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  let folderId = properties.getProperty("FOLDER_ID");

  if (!spreadsheetId) {
    const spreadsheet = SpreadsheetApp.create(APP_CONFIG.SPREADSHEET_NAME);
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName(APP_CONFIG.SHEET_NAME);
    sheet.appendRow([
      "Waktu Pengumpulan", "Nama Siswa", "Kelas", "Nama File",
      "Ukuran File (Byte)", "Tipe File", "Link File", "ID Pengumpulan"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 8)
      .setFontWeight("bold")
      .setBackground("#172947")
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, 8);
    spreadsheetId = spreadsheet.getId();
    properties.setProperty("SPREADSHEET_ID", spreadsheetId);
  }

  if (!folderId) {
    const folder = DriveApp.createFolder(APP_CONFIG.FOLDER_NAME);
    folderId = folder.getId();
    properties.setProperty("FOLDER_ID", folderId);
  }

  Logger.log("SETUP SELESAI");
  Logger.log("Spreadsheet: " + SpreadsheetApp.openById(spreadsheetId).getUrl());
  Logger.log("Folder Drive: " + DriveApp.getFolderById(folderId).getUrl());
}

/**
 * Halaman upload berada dalam domain Apps Script sehingga respons server
 * dapat ditangani langsung oleh google.script.run.
 */
function doGet(e) {
  const view = e && e.parameter ? e.parameter.view : "";
  if (view === "form") {
    return HtmlService.createHtmlOutputFromFile("SubmissionForm")
      .setTitle("Pengumpulan Tugas Mail Merge");
  }

  return HtmlService.createHtmlOutput(
    "<h2>Form Pengumpulan Tugas Mail Merge</h2>" +
    "<p>Buka halaman tugas, lalu klik tombol Buka Form Pengumpulan.</p>"
  );
}

/**
 * Form element harus menjadi satu-satunya argumen google.script.run.
 * Apps Script mengubah input file menjadi Blob pada formObject.taskFile.
 */
function submitAssignment(formObject) {
  let savedFile = null;
  let lock = null;

  try {
    if (!formObject) throw new Error("Data form tidak ditemukan.");
    if (String(formObject.website || "").trim()) {
      throw new Error("Permintaan tidak valid.");
    }

    const studentName = String(formObject.studentName || "").trim();
    const studentClass = String(formObject.studentClass || "").trim();
    const fileBlob = formObject.taskFile;

    if (!studentName || !studentClass) {
      throw new Error("Nama dan kelas wajib diisi.");
    }
    if (studentName.length > 100 || studentClass.length > 30) {
      throw new Error("Nama atau kelas terlalu panjang.");
    }
    if (!fileBlob || typeof fileBlob.getBytes !== "function") {
      throw new Error("File tugas belum dipilih.");
    }

    const originalName = String(fileBlob.getName() || "").trim();
    const match = originalName.toLowerCase().match(/\.([a-z0-9]+)$/);
    const extension = match ? match[1] : "";
    if (APP_CONFIG.ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
      throw new Error("Format file harus PDF, DOC, atau DOCX.");
    }

    const bytes = fileBlob.getBytes();
    if (!bytes || bytes.length === 0) throw new Error("File yang dipilih kosong.");
    if (bytes.length > APP_CONFIG.MAX_FILE_SIZE) {
      throw new Error("Ukuran file melebihi batas 10 MB.");
    }

    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    const properties = PropertiesService.getScriptProperties();
    const folderId = properties.getProperty("FOLDER_ID");
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    if (!folderId || !spreadsheetId) {
      throw new Error("Server belum disiapkan. Guru perlu menjalankan setup() di Apps Script.");
    }

    const safeName = originalName
      .replace(/[\\/:*?"<>|#%{}~&]/g, "_")
      .replace(/\s+/g, "_")
      .slice(-120);
    const timeLabel = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss"
    );
    const savedName = timeLabel + "_" + safeName;
    const blob = Utilities.newBlob(bytes, mimeTypes[extension], savedName);

    lock = LockService.getScriptLock();
    lock.waitLock(30000);

    savedFile = DriveApp.getFolderById(folderId).createFile(blob);
    savedFile.setDescription(
      "Tugas Mail Merge Surat Resmi dari " + studentName + " (" + studentClass + ")"
    );

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(APP_CONFIG.SHEET_NAME);
    if (!sheet) throw new Error("Sheet pengumpulan tidak ditemukan.");

    const submissionId = Utilities.getUuid();
    sheet.appendRow([
      new Date(), studentName, studentClass, savedName,
      bytes.length, mimeTypes[extension], savedFile.getUrl(), submissionId
    ]);

    return {
      ok: true,
      message: "Tugas berhasil dikumpulkan. Terima kasih!",
      fileName: savedName,
      submissionId: submissionId
    };
  } catch (error) {
    if (savedFile) {
      try { savedFile.setTrashed(true); } catch (ignored) {}
    }
    throw new Error(
      error && error.message ? error.message :
      "Terjadi kesalahan saat menyimpan tugas. Silakan coba lagi."
    );
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
