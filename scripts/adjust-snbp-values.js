const fs = require('fs');
const path = require('path');

// Read current SNBP data
const dataPath = path.join(__dirname, '..', 'public', 'data_snbp.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
// Remove BOM if present
const cleanData = rawData.replace(/^\uFEFF/, '').trim();
const data = JSON.parse(cleanData);

console.log(`📊 Total data: ${data.length} records`);

// Find min/max current values
const currentValues = data.map(d => d.estimasi_nilai_raport);
const minValue = Math.min(...currentValues);
const maxValue = Math.max(...currentValues);
console.log(`📉 Current range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}`);

/**
 * REALISTIC SNBP VALUE ADJUSTMENT WITH UNIVERSITY TIERS
 * 
 * TIER S (Top 3 PTN):
 *   - UI, ITB, UGM
 *   - Kedokteran/Teknik Top: 90-93
 *   - Jurusan Favorit: 87-91
 *   - Jurusan Biasa: 84-88
 * 
 * TIER A (Top 10 PTN):
 *   - IPB, ITS, UNPAD, UNDIP, UNAIR, UNHAS, USU
 *   - Kedokteran/Teknik: 88-91
 *   - Jurusan Favorit: 85-89
 *   - Jurusan Biasa: 82-86
 * 
 * TIER B (PTN Besar Lainnya):
 *   - Jurusan Top: 84-88
 *   - Jurusan Favorit: 81-85
 *   - Jurusan Biasa: 78-83
 * 
 * TIER C (PTN Regional):
 *   - Jurusan Top: 80-84
 *   - Jurusan Favorit: 77-81
 *   - Jurusan Biasa: 74-79
 */

// Define university tiers
const TIER_S = ['UNIVERSITAS INDONESIA', 'INSTITUT TEKNOLOGI BANDUNG', 'UNIVERSITAS GADJAH MADA'];
const TIER_A = [
  'INSTITUT PERTANIAN BOGOR',
  'INSTITUT TEKNOLOGI SEPULUH NOPEMBER',
  'UNIVERSITAS PADJADJARAN',
  'UNIVERSITAS DIPONEGORO',
  'UNIVERSITAS AIRLANGGA',
  'UNIVERSITAS HASANUDDIN',
  'UNIVERSITAS SUMATERA UTARA',
  'UNIVERSITAS BRAWIJAYA'
];

// Check if major is top competitive
function isTopMajor(prodiName) {
  const name = prodiName.toLowerCase();
  return (
    name.includes('kedokteran') ||
    name.includes('teknik informatika') ||
    name.includes('ilmu komputer') ||
    name.includes('teknik elektro') ||
    name.includes('farmasi') ||
    name.includes('hukum')
  );
}

function isFavoriteMajor(prodiName, rasio) {
  const name = prodiName.toLowerCase();
  return (
    rasio >= 2.5 ||
    name.includes('teknik') ||
    name.includes('akuntansi') ||
    name.includes('manajemen') ||
    name.includes('psikologi') ||
    name.includes('komunikasi')
  );
}

// Adjust logic based on university tier + major type
const adjustedData = data.map(item => {
  const ptn = (item.ptn_name || '').toUpperCase();
  const prodiName = item.nama_prodi || '';
  const rasio = item.rasio_keketatan || 1;
  
  let minVal, maxVal;
  
  // Determine tier
  if (TIER_S.includes(ptn)) {
    // TIER S: UI, ITB, UGM
    if (isTopMajor(prodiName)) {
      [minVal, maxVal] = [90, 93]; // Kedokteran UI/ITB/UGM
    } else if (isFavoriteMajor(prodiName, rasio)) {
      [minVal, maxVal] = [87, 91]; // Teknik, Hukum, etc
    } else {
      [minVal, maxVal] = [84, 88]; // Jurusan biasa
    }
  } else if (TIER_A.includes(ptn)) {
    // TIER A: IPB, ITS, UNPAD, etc
    if (isTopMajor(prodiName)) {
      [minVal, maxVal] = [88, 91];
    } else if (isFavoriteMajor(prodiName, rasio)) {
      [minVal, maxVal] = [85, 89];
    } else {
      [minVal, maxVal] = [82, 86];
    }
  } else {
    // TIER B/C: PTN lainnya
    const isLargeUniv = rasio >= 2.0;
    if (isTopMajor(prodiName)) {
      [minVal, maxVal] = isLargeUniv ? [84, 88] : [80, 84];
    } else if (isFavoriteMajor(prodiName, rasio)) {
      [minVal, maxVal] = isLargeUniv ? [81, 85] : [77, 81];
    } else {
      [minVal, maxVal] = isLargeUniv ? [78, 83] : [74, 79];
    }
  }
  
  // Generate random value in range
  const newEstimasi = minVal + Math.random() * (maxVal - minVal);
  const rounded = Math.round(newEstimasi * 100) / 100;
  
  return {
    ...item,
    estimasi_nilai_raport: rounded,
    nilai_raport: rounded,
  };
});

// Check new range
const newValues = adjustedData.map(d => d.estimasi_nilai_raport);
const newMin = Math.min(...newValues);
const newMax = Math.max(...newValues);
const newAvg = newValues.reduce((a, b) => a + b, 0) / newValues.length;

console.log(`📈 New range: ${newMin.toFixed(2)} - ${newMax.toFixed(2)}`);
console.log(`📊 Average: ${newAvg.toFixed(2)}`);

// Count distribution
const ranges = {
  'below75': newValues.filter(v => v < 75).length,
  '75-80': newValues.filter(v => v >= 75 && v < 80).length,
  '80-85': newValues.filter(v => v >= 80 && v < 85).length,
  '85-90': newValues.filter(v => v >= 85 && v < 90).length,
  '90-95': newValues.filter(v => v >= 90 && v < 95).length,
  'above95': newValues.filter(v => v >= 95).length,
};

console.log('\n📊 Distribution:');
Object.entries(ranges).forEach(([range, count]) => {
  const percentage = ((count / data.length) * 100).toFixed(1);
  console.log(`   ${range}: ${count} (${percentage}%)`);
});

// Sample top universities
console.log('\n🎓 Sample Top Universities (Kedokteran):');
const samples = adjustedData.filter(d => 
  d.nama_prodi?.toLowerCase().includes('kedokteran') &&
  (d.ptn_name?.includes('INDONESIA') || d.ptn_name?.includes('BANDUNG') || d.ptn_name?.includes('GADJAH'))
).slice(0, 5);

samples.forEach(s => {
  console.log(`   ${s.ptn_name} - ${s.nama_prodi}: ${s.estimasi_nilai_raport.toFixed(2)}`);
});

// Save adjusted data
fs.writeFileSync(dataPath, JSON.stringify(adjustedData, null, 2));
console.log(`\n✅ Successfully adjusted ${data.length} records`);
console.log(`💾 Saved to: ${dataPath}`);
console.log(`🎯 Values now REALISTIC with proper university tiers!`);
