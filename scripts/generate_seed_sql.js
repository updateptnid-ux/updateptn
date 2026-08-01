// scripts/generate_seed_sql.js
// Generate SQL INSERT statements dari data_snbt.json → supabase/seed_prodi_reference.sql

const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../public/data_snbt.json");
const outputPath = path.join(__dirname, "../supabase/seed_prodi_reference.sql");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const escape = (val) => {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return isNaN(val) ? "NULL" : String(val);
  return "'" + String(val).replace(/'/g, "''") + "'";
};

const lines = [];
lines.push("-- ============================================================");
lines.push("-- SEED: prodi_reference — 4.978 PTN & Program Studi SNBT 2025/2026");
lines.push("-- Jalankan di Supabase Dashboard → SQL Editor");
lines.push("-- ============================================================");
lines.push("");
lines.push("-- Kosongkan dulu jika ada data lama");
lines.push("TRUNCATE TABLE public.prodi_reference RESTART IDENTITY CASCADE;");
lines.push("");
lines.push("INSERT INTO public.prodi_reference");
lines.push("  (id, univ, prodi, kode, jenjang, kelompok, rumpun_ilmu, prov, passing_grade_est, keketatan, daya_tampung, peminat, ukt_min, ukt_max)");
lines.push("VALUES");

const rows = data.map((item, i) => {
  const id = escape(item.id);
  const univ = escape(item.univ);
  const prodi = escape(item.prodi);
  const kode = escape(item.kode || null);
  const jenjang = escape(item.jenjang || "S1");
  const kelompok = escape(item.kelompok || "Saintek");
  const rumpun = escape(item.rumpun_ilmu || null);
  const prov = escape(item.prov || null);
  const pg = item.passing_grade_est != null ? Number(item.passing_grade_est) : "NULL";
  const kkt = item.keketatan != null ? Number(item.keketatan) : "NULL";
  const dt = item.daya_tampung != null ? parseInt(item.daya_tampung) : "NULL";
  const pem = item.peminat != null ? parseInt(item.peminat) : "NULL";
  const uktMin = item.ukt_min != null ? Number(item.ukt_min) : "NULL";
  const uktMax = item.ukt_max != null ? Number(item.ukt_max) : "NULL";

  return `  (${id}, ${univ}, ${prodi}, ${kode}, ${jenjang}, ${kelompok}, ${rumpun}, ${prov}, ${pg}, ${kkt}, ${dt}, ${pem}, ${uktMin}, ${uktMax})`;
});

lines.push(rows.join(",\n") + ";");
lines.push("");
lines.push("-- Verifikasi");
lines.push("SELECT COUNT(*) AS total_inserted FROM public.prodi_reference;");

fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");

const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
console.log(`✅ Seed SQL generated: ${outputPath}`);
console.log(`   Records: ${data.length} | File size: ${sizeMB} MB`);
