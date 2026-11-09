/**
 * Mail Merge — penerimaan tugas siswa.
 * Jalankan setup() satu kali, lalu deploy sebagai Web App.
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
      .setFontWeight("bold").setBackground("#172947").setFontColor("#ffffff");
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

function doGet() {
  return HtmlService.createHtmlOutput(
    "<h2>Mail Merge submission endpoint is ready.</h2><p>Gunakan form pengumpulan tugas pada halaman kelas.</p>"
  );
}

function doPost(e) {
  let requestId = "";
  let uploadedFile = null;
  let lock = null;

  try {
    const rawPayload = e && e.parameter ? e.parameter.payload : "";
    if (!rawPayload) throw new Error("Data pengumpulan tidak ditemukan.");

    const data = JSON.parse(rawPayload);
    requestId = String(data.requestId || Utilities.getUuid());

    if (String(data.website || "").trim()) throw new Error("Permintaan tidak valid.");

    const studentName = String(data.studentName || "").trim();
    const studentClass = String(data.studentClass || "").trim();
    const originalName = String(data.fileName || "").trim();
    const fileData = String(data.fileData || "");

    if (!studentName || !studentClass || !originalName || !fileData) {
      throw new Error("Nama, kelas, dan file tugas wajib diisi.");
    }
    if (studentName.length > 100 || studentClass.length > 30) {
      throw new Error("Nama atau kelas terlalu panjang.");
    }

    const extensionMatch = originalName.toLowerCase().match(/\.([a-z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : "";
    if (APP_CONFIG.ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
      throw new Error("Format file harus PDF, DOC, atau DOCX.");
    }

    const estimatedBytes = Math.floor(fileData.length * 3 / 4);
    if (estimatedBytes <= 0 || estimatedBytes > APP_CONFIG.MAX_FILE_SIZE) {
      throw new Error("Ukuran file kosong atau melebihi batas 10 MB.");
    }

    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    const bytes = Utilities.base64Decode(fileData);
    if (bytes.length > APP_CONFIG.MAX_FILE_SIZE) {
      throw new Error("Ukuran file melebihi batas 10 MB.");
    }

    const safeOriginalName = originalName
      .replace(/[\\/:*?"<>|#%{}~&]/g, "_")
      .replace(/\s+/g, "_")
      .slice(-120);
    const timeLabel = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss"
    );
    const savedName = timeLabel + "_" + safeOriginalName;
    const blob = Utilities.newBlob(bytes, mimeTypes[extension], savedName);

    const properties = PropertiesService.getScriptProperties();
    const folderId = properties.getProperty("FOLDER_ID");
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    if (!folderId || !spreadsheetId) {
      throw new Error("Server belum disiapkan. Guru perlu menjalankan setup() di Apps Script.");
    }

    lock = LockService.getScriptLock();
    lock.waitLock(30000);

    uploadedFile = DriveApp.getFolderById(folderId).createFile(blob);
    uploadedFile.setDescription(
      "Tugas Mail Merge Surat Resmi dari " + studentName + " (" + studentClass + ")"
    );

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(APP_CONFIG.SHEET_NAME);
    if (!sheet) throw new Error("Sheet pengumpulan tidak ditemukan.");

    sheet.appendRow([
      new Date(), studentName, studentClass, savedName,
      bytes.length, mimeTypes[extension], uploadedFile.getUrl(), requestId
    ]);

    return createResponse_({
      source: "mail-merge-submission",
      requestId: requestId,
      ok: true,
      message: "Tugas berhasil dikumpulkan. Terima kasih!"
    });
  } catch (error) {
    if (uploadedFile) {
      try { uploadedFile.setTrashed(true); } catch (ignored) {}
    }
    return createResponse_({
      source: "mail-merge-submission",
      requestId: requestId,
      ok: false,
      message: error && error.message ? error.message : "Terjadi kesalahan saat menyimpan tugas."
    });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

/**
 * Mengirim hasil ke halaman statis melalui iframe + postMessage.
 * Tidak memerlukan pembacaan respons fetch lintas-origin.
 */
function createResponse_(result) {
  const safeJson = JSON.stringify(result)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  const output = [
    "<!doctype html><html><head><meta charset='utf-8'></head><body>",
    "<script>window.parent.postMessage(" + safeJson + ", '*');</script>",
    "<p>Permintaan selesai. Silakan kembali ke halaman tugas.</p>",
    "</body></html>"
  ].join("");

  return HtmlService.createHtmlOutput(output)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
