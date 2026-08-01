const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'data_snbt_2025_2026_FIXED.csv');
const outputPath = path.join(__dirname, '..', 'public', 'data_snbt.json');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

try {
  const text = fs.readFileSync(csvPath, 'utf-8');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 5) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    records.push({
      id: obj.id,
      univ: obj.univ,
      prodi: obj.prodi,
      kode: obj.kode,
      jenjang: obj.jenjang,
      kelompok: obj.kelompok,
      rumpun_ilmu: obj.rumpun_ilmu,
      prov: obj.prov,
      passing_grade_est: parseFloat(obj.passing_grade_est) || 500,
      keketatan: parseFloat(obj.keketatan_2025) || 5,
      daya_tampung: parseInt(obj.daya_tampung_2026) || 30,
      peminat: parseInt(obj.peminat_2025) || 200,
      ukt_min: parseFloat(obj.ukt_min) || 500000,
      ukt_max: parseFloat(obj.ukt_max) || 15000000
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
  console.log(`Successfully converted ${records.length} PTN/Prodi records to public/data_snbt.json`);
} catch (err) {
  console.error("Error converting CSV to JSON:", err);
}
