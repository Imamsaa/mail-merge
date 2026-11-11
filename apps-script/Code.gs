/**
 * MAIL MERGE LPMN — pengumpulan dua file DOCX siswa.
 * Memakai Script Properties FOLDER_ID dan SPREADSHEET_ID yang sudah tersedia.
 */
const APP_CONFIG = {
  NEW_SHEET_NAME: "Pengumpulan_Surat_Resmi",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  DOCX_MIME: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

function doGet(e) {
  const view = e && e.parameter ? e.parameter.view : "";
  if (view === "form") {
    return HtmlService.createHtmlOutputFromFile("SubmissionForm")
      .setTitle("Pengumpulan Tugas Mail Merge LPMN");
  }
  return HtmlService.createHtmlOutput(
    "<h2>Form Pengumpulan Tugas Mail Merge LPMN</h2>" +
    "<p>Buka halaman tugas, lalu klik tombol Buka Form Pengumpulan.</p>"
  );
}

function submitAssignment(formObject) {
  let templateDriveFile = null;
  let resultDriveFile = null;
  let lock = null;

  try {
    if (!formObject) throw new Error("Data form tidak ditemukan.");
    if (String(formObject.website || "").trim()) throw new Error("Permintaan tidak valid.");

    const studentName = String(formObject.studentName || "").trim();
    const studentClass = String(formObject.studentClass || "").trim();
    if (!studentName || !studentClass) throw new Error("Nama dan kelas wajib diisi.");
    if (studentName.length > 100 || studentClass.length > 30) {
      throw new Error("Nama atau kelas terlalu panjang.");
    }

    const templateBlob = validateDocx_(formObject.templateFile, "Template_Surat.docx");
    const resultBlob = validateDocx_(formObject.resultFile, "Hasil_Mail_Merge.docx");

    const properties = PropertiesService.getScriptProperties();
    const folderId = properties.getProperty("FOLDER_ID");
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    if (!folderId || !spreadsheetId) {
      throw new Error("Konfigurasi Drive/Spreadsheet tidak ditemukan. Hubungi guru.");
    }

    lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const folder = DriveApp.getFolderById(folderId);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getOrCreateSubmissionSheet_(spreadsheet);
    const submissionId = Utilities.getUuid();
    const timestamp = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss"
    );
    const studentSlug = safeName_(studentName);
    const shortId = submissionId.substring(0, 8);

    const templateName = "Template_Surat_" + studentSlug + "_" + timestamp + "_" + shortId + ".docx";
    const resultName = "Hasil_Mail_Merge_" + studentSlug + "_" + timestamp + "_" + shortId + ".docx";

    templateDriveFile = folder.createFile(
      Utilities.newBlob(templateBlob.bytes, APP_CONFIG.DOCX_MIME, templateName)
    );
    resultDriveFile = folder.createFile(
      Utilities.newBlob(resultBlob.bytes, APP_CONFIG.DOCX_MIME, resultName)
    );

    templateDriveFile.setDescription("Template surat resmi LPMN dari " + studentName + " (" + studentClass + ")");
    resultDriveFile.setDescription("Hasil Mail Merge LPMN dari " + studentName + " (" + studentClass + ")");

    sheet.appendRow([
      new Date(), studentName, studentClass,
      templateName, templateDriveFile.getUrl(),
      resultName, resultDriveFile.getUrl(),
      templateBlob.bytes.length, resultBlob.bytes.length, submissionId
    ]);
    SpreadsheetApp.flush();

    return {
      ok: true,
      message: "Kedua file berhasil dikumpulkan. Terima kasih!",
      templateFile: templateName,
      resultFile: resultName,
      submissionId: submissionId
    };
  } catch (error) {
    if (templateDriveFile) {
      try { templateDriveFile.setTrashed(true); } catch (ignored) {}
    }
    if (resultDriveFile) {
      try { resultDriveFile.setTrashed(true); } catch (ignored) {}
    }
    throw new Error(error && error.message ? error.message : "Terjadi kesalahan saat menyimpan tugas. Silakan coba lagi.");
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function validateDocx_(blob, label) {
  if (!blob || typeof blob.getBytes !== "function") {
    throw new Error("File " + label + " wajib diunggah.");
  }
  const originalName = String(blob.getName() || "").trim();
  if (!/\.docx$/i.test(originalName)) {
    throw new Error("File " + label + " harus berformat .docx.");
  }
  const bytes = blob.getBytes();
  if (!bytes || bytes.length === 0) throw new Error("File " + label + " kosong.");
  if (bytes.length > APP_CONFIG.MAX_FILE_SIZE) {
    throw new Error("File " + label + " melebihi batas 10 MB.");
  }
  return { bytes: bytes, originalName: originalName };
}

function getOrCreateSubmissionSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(APP_CONFIG.NEW_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(APP_CONFIG.NEW_SHEET_NAME);
    sheet.appendRow([
      "Waktu Pengumpulan", "Nama Siswa", "Kelas",
      "File Template", "Link Template",
      "File Hasil Mail Merge", "Link Hasil Mail Merge",
      "Ukuran Template (Byte)", "Ukuran Hasil (Byte)", "ID Pengumpulan"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10)
      .setFontWeight("bold").setBackground("#172947").setFontColor("#ffffff").setWrap(true);
    sheet.autoResizeColumns(1, 10);
  }
  return sheet;
}

function safeName_(value) {
  return String(value || "Siswa")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50) || "Siswa";
}
