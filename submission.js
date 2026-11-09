(() => {
  "use strict";

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const allowedExtensions = ["pdf", "doc", "docx"];
  const form = document.getElementById("submissionForm");
  if (!form) return;

  const nameInput = document.getElementById("studentName");
  const classInput = document.getElementById("studentClass");
  const fileInput = document.getElementById("taskFile");
  const selectedFileName = document.getElementById("selectedFileName");
  const submitButton = document.getElementById("submitButton");
  const statusBox = document.getElementById("submissionStatus");
  const configWarning = document.getElementById("configWarning");

  const config = window.MAIL_MERGE_CONFIG || {};
  const endpoint = String(config.APPS_SCRIPT_URL || "").trim();
  const isConfigured = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint);

  if (!isConfigured) {
    configWarning.hidden = false;
    submitButton.disabled = true;
    submitButton.title = "URL Apps Script belum dikonfigurasi.";
  }

  let activeRequestId = "";
  let responseTimer = null;
  const iframe = document.createElement("iframe");
  iframe.name = "mailMergeSubmissionFrame";
  iframe.title = "Pengiriman tugas";
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = "submission-status show " + type;
  }

  function setBusy(isBusy) {
    submitButton.disabled = isBusy || !isConfigured;
    submitButton.innerHTML = isBusy
      ? "<span aria-hidden='true'>…</span> Mengirim..."
      : "<span aria-hidden='true'>↗</span> Kirim Tugas";
  }

  function getExtension(fileName) {
    const parts = String(fileName || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const separator = result.indexOf(",");
        if (separator < 0) return reject(new Error("File tidak dapat dibaca."));
        resolve(result.slice(separator + 1));
      };
      reader.onerror = () => reject(new Error("Gagal membaca file. Coba pilih file lain."));
      reader.readAsDataURL(file);
    });
  }

  function sendWithHiddenForm(payload) {
    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = endpoint;
    hiddenForm.target = iframe.name;
    hiddenForm.enctype = "application/x-www-form-urlencoded";
    hiddenForm.acceptCharset = "UTF-8";
    hiddenForm.style.display = "none";

    const payloadInput = document.createElement("input");
    payloadInput.type = "hidden";
    payloadInput.name = "payload";
    payloadInput.value = JSON.stringify(payload);
    hiddenForm.appendChild(payloadInput);

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    hiddenForm.remove();
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    selectedFileName.textContent = file
      ? "File dipilih: " + file.name + " (" + (file.size / 1024 / 1024).toFixed(2) + " MB)"
      : "Belum ada file dipilih.";
  });

  window.addEventListener("message", (event) => {
    const result = event.data;
    if (!result || result.source !== "mail-merge-submission") return;
    if (!activeRequestId || result.requestId !== activeRequestId) return;

    window.clearTimeout(responseTimer);
    activeRequestId = "";
    setBusy(false);

    if (result.ok) {
      showStatus(result.message || "Tugas berhasil dikumpulkan.", "success");
      form.reset();
      selectedFileName.textContent = "Belum ada file dipilih.";
    } else {
      showStatus(result.message || "Tugas gagal dikirim. Periksa file dan coba lagi.", "error");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isConfigured) {
      showStatus("Form belum aktif. Guru perlu memasukkan URL deployment Apps Script.", "error");
      return;
    }

    const studentName = nameInput.value.trim();
    const studentClass = classInput.value.trim();
    const file = fileInput.files && fileInput.files[0];
    const extension = file ? getExtension(file.name) : "";

    if (!studentName || !studentClass || !file) {
      showStatus("Lengkapi nama, kelas, dan pilih file tugas terlebih dahulu.", "error");
      return;
    }
    if (!allowedExtensions.includes(extension)) {
      showStatus("Format file harus PDF, DOC, atau DOCX.", "error");
      return;
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      showStatus("Ukuran file harus lebih dari 0 dan tidak boleh melebihi 10 MB.", "error");
      return;
    }

    setBusy(true);
    showStatus("Menyiapkan file dan mengirim tugas. Jangan tutup halaman ini dahulu...", "info");

    try {
      const fileData = await readFileAsBase64(file);
      activeRequestId = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "req-" + Date.now() + "-" + Math.random().toString(16).slice(2);

      sendWithHiddenForm({
        requestId: activeRequestId,
        studentName,
        studentClass,
        fileName: file.name,
        fileSize: file.size,
        fileData,
        website: document.getElementById("website").value
      });

      responseTimer = window.setTimeout(() => {
        if (!activeRequestId) return;
        activeRequestId = "";
        setBusy(false);
        showStatus(
          "Belum ada konfirmasi dari server. Periksa koneksi internet atau hubungi guru untuk memastikan tugas sudah masuk. Jangan langsung mengirim berkali-kali.",
          "error"
        );
      }, 90000);
    } catch (error) {
      activeRequestId = "";
      setBusy(false);
      showStatus(error && error.message ? error.message : "Terjadi kesalahan saat menyiapkan file.", "error");
    }
  });
})();
