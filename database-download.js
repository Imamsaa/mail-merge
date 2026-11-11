/* Builds the provided 15-row database as an Excel workbook in the browser. */
(() => {
  "use strict";

  const rows = [
    ["Nomor_Surat", "Kecamatan", "Kabupaten", "Nama", "Perihal"],
    ["001/ORG/XI/2026", "Purwodadi", "Grobogan", "Ahmad Fauzi", "Permohonan Kerja Sama"],
    ["002/ORG/XI/2026", "Wirosari", "Grobogan", "Budi Santoso", "Undangan Pertemuan"],
    ["003/ORG/XI/2026", "Toroh", "Grobogan", "Siti Aminah", "Pemberitahuan Kegiatan"],
    ["004/ORG/XI/2026", "Godong", "Grobogan", "Agus Setiawan", "Permohonan Bantuan"],
    ["005/ORG/XI/2026", "Gubug", "Grobogan", "Dewi Lestari", "Permohonan Data"],
    ["006/ORG/XI/2026", "Tegowanu", "Grobogan", "Rizky Pratama", "Undangan Rapat Koordinasi"],
    ["007/ORG/XI/2026", "Brati", "Grobogan", "Nur Hidayah", "Surat Keterangan"],
    ["008/ORG/XI/2026", "Klambu", "Grobogan", "Fajar Maulana", "Pemberitahuan Hasil Kegiatan"],
    ["009/ORG/XI/2026", "Penawangan", "Grobogan", "Rina Wulandari", "Permohonan Izin"],
    ["010/ORG/XI/2026", "Geyer", "Grobogan", "Dimas Saputra", "Penyampaian Laporan"],
    ["011/ORG/XI/2026", "Karangrayung", "Grobogan", "Siti Nurhaliza", "Permohonan Rekomendasi"],
    ["012/ORG/XI/2026", "Ngaringan", "Grobogan", "Andi Kurniawan", "Undangan Acara"],
    ["013/ORG/XI/2026", "Kedungjati", "Grobogan", "Maya Anggraini", "Pemberitahuan Perubahan Jadwal"],
    ["014/ORG/XI/2026", "Gabus", "Grobogan", "Arif Rahman", "Tindak Lanjut Permohonan"],
    ["015/ORG/XI/2026", "Pulokulon", "Grobogan", "Lina Marlina", "Permohonan Informasi"]
  ];

  const encoder = new TextEncoder();
  const xmlEscape = value => String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  function columnName(index) {
    let name = "";
    while (index > 0) {
      const remainder = (index - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      index = Math.floor((index - 1) / 26);
    }
    return name;
  }

  const sheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => {
      const ref = columnName(colIndex + 1) + (rowIndex + 1);
      return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' +
        xmlEscape(value) + '</t></is></c>';
    }).join("");
    return '<row r="' + (rowIndex + 1) + '">' + cells + '</row>';
  }).join("");

  const worksheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetData>' + sheetRows + '</sheetData></worksheet>';

  const workbookXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>';

  const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '</Relationships>';

  const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '</Types>';

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function u16(value) {
    return new Uint8Array([value & 255, (value >>> 8) & 255]);
  }
  function u32(value) {
    return new Uint8Array([
      value & 255, (value >>> 8) & 255,
      (value >>> 16) & 255, (value >>> 24) & 255
    ]);
  }
  function join(parts) {
    const size = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) { result.set(part, offset); offset += part.length; }
    return result;
  }

  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let localOffset = 0;

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = encoder.encode(file.content);
      const checksum = crc32(dataBytes);

      const localHeader = join([
        u32(0x04034b50), u16(20), u16(0x0800), u16(0),
        u16(0), u16(0), u32(checksum), u32(dataBytes.length),
        u32(dataBytes.length), u16(nameBytes.length), u16(0)
      ]);
      localParts.push(localHeader, nameBytes, dataBytes);

      const centralHeader = join([
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0),
        u16(0), u16(0), u32(checksum), u32(dataBytes.length),
        u32(dataBytes.length), u16(nameBytes.length), u16(0),
        u16(0), u16(0), u16(0), u32(0), u32(localOffset)
      ]);
      centralParts.push(centralHeader, nameBytes);
      localOffset += localHeader.length + nameBytes.length + dataBytes.length;
    }

    const centralDirectory = join(centralParts);
    const localData = join(localParts);
    const endRecord = join([
      u32(0x06054b50), u16(0), u16(0),
      u16(files.length), u16(files.length),
      u32(centralDirectory.length), u32(localData.length), u16(0)
    ]);
    return join([localData, centralDirectory, endRecord]);
  }

  function downloadWorkbook() {
    const files = [
      { name: "[Content_Types].xml", content: contentTypes },
      { name: "_rels/.rels", content: rootRels },
      { name: "xl/workbook.xml", content: workbookXml },
      { name: "xl/_rels/workbook.xml.rels", content: workbookRels },
      { name: "xl/worksheets/sheet1.xml", content: worksheetXml }
    ];
    const archive = makeZip(files);
    const blob = new Blob([archive], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Data_surat.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const button = document.getElementById("downloadDatabase");
  if (button) {
    button.addEventListener("click", event => {
      event.preventDefault();
      downloadWorkbook();
    });
  }
})();
