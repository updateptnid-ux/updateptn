const fs = require('fs');
const path = require('path');

const logoDir = 'c:\\Users\\zonaa\\OneDrive\\Dokumen\\kera\\updateptn-platform-main\\public\\logo-univ';
const subdirs = ['intitut', 'poltek', 'uin', 'univ'];
const localLogos = {};

subdirs.forEach(subdir => {
  const dirPath = path.join(logoDir, subdir);
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (!file.endsWith('.png')) return;
    
    // Clean name for matching
    let cleanName = file.replace('.png', '')
                        .replace(/-removebg-preview/gi, '')
                        .replace(/Logo_/gi, '')
                        .replace(/Logo-/gi, '')
                        .replace(/_/g, ' ')
                        .toUpperCase()
                        .trim();
    
    localLogos[cleanName] = `/logo-univ/${subdir}/${file}`;
  });
});

const libFilePath = 'c:\\Users\\zonaa\\OneDrive\\Dokumen\\kera\\updateptn-platform-main\\lib\\univ-logo.ts';

const newContent = `/**
 * Utility: University Logo via Local Assets with Clearbit Fallback
 * Dipakai di seluruh platform untuk menampilkan logo PTN secara ringan & offline-first.
 */

export const LOCAL_UNIV_LOGOS: Record<string, string> = ${JSON.stringify(localLogos, null, 2)};

export const UNIV_DOMAINS: Record<string, string> = {
  "UNIVERSITAS INDONESIA": "ui.ac.id",
  "UI": "ui.ac.id",
  "INSTITUT TEKNOLOGI BANDUNG": "itb.ac.id",
  "ITB": "itb.ac.id",
  "UNIVERSITAS GADJAH MADA": "ugm.ac.id",
  "UGM": "ugm.ac.id",
  "UNIVERSITAS BRAWIJAYA": "ub.ac.id",
  "UB": "ub.ac.id",
  "UNIVERSITAS PADJADJARAN": "unpad.ac.id",
  "UNPAD": "unpad.ac.id",
  "UNIVERSITAS DIPONEGORO": "undip.ac.id",
  "UNDIP": "undip.ac.id",
  "UNIVERSITAS AIRLANGGA": "unair.ac.id",
  "UNAIR": "unair.ac.id",
  "INSTITUT TEKNOLOGI SEPULUH NOPEMBER": "its.ac.id",
  "ITS": "its.ac.id",
  "UNIVERSITAS HASANUDDIN": "unhas.ac.id",
  "UNHAS": "unhas.ac.id",
  "UNIVERSITAS SEBELAS MARET": "uns.ac.id",
  "UNS": "uns.ac.id",
  "UNIVERSITAS PENDIDIKAN INDONESIA": "upi.edu",
  "UPI": "upi.edu",
  "UNIVERSITAS NEGERI YOGYAKARTA": "uny.ac.id",
  "UNY": "uny.ac.id",
  "UNIVERSITAS NEGERI MALANG": "um.ac.id",
  "UNIVERSITAS NEGERI SURABAYA": "unesa.ac.id",
  "UNIVERSITAS NEGERI SEMARANG": "unnes.ac.id",
  "UNIVERSITAS ANDALAS": "unand.ac.id",
  "UNAND": "unand.ac.id",
  "UNIVERSITAS SUMATERA UTARA": "usu.ac.id",
  "USU": "usu.ac.id",
  "UNIVERSITAS SRIWIJAYA": "unsri.ac.id",
  "UNIVERSITAS LAMBUNG MANGKURAT": "ulm.ac.id",
  "UNIVERSITAS MULAWARMAN": "unmul.ac.id",
  "UNIVERSITAS SAM RATULANGI": "unsrat.ac.id",
  "UNIVERSITAS PATTIMURA": "unpatti.ac.id",
  "UNIVERSITAS CENDERAWASIH": "uncen.ac.id",
  "UNIVERSITAS TADULAKO": "untad.ac.id",
  "UNIVERSITAS HALUOLEO": "uho.ac.id",
  "UNIVERSITAS NUSA CENDANA": "undana.ac.id",
  "UNIVERSITAS MATARAM": "unram.ac.id",
  "UNIVERSITAS RIAU": "unri.ac.id",
  "UNIVERSITAS BENGKULU": "unib.ac.id",
  "UNIVERSITAS JAMBI": "unja.ac.id",
  "UNIVERSITAS LAMPUNG": "unila.ac.id",
  "UNIVERSITAS TANJUNGPURA": "untan.ac.id",
  "UNIVERSITAS PALANGKA RAYA": "upr.ac.id",
  "UNIVERSITAS JEMBER": "unej.ac.id",
  "UNIVERSITAS SYIAH KUALA": "usk.ac.id",
  "UNIVERSITAS MALIKUSSALEH": "unimal.ac.id",
  "UNIVERSITAS SULTAN AGENG TIRTAYASA": "untirta.ac.id",
  "UNIVERSITAS SINGAPERBANGSA KARAWANG": "unsika.ac.id",
  "UNIVERSITAS BORNEO TARAKAN": "borneo.ac.id",
  "UNIVERSITAS TRUNOJOYO": "trunojoyo.ac.id",
  "UNIVERSITAS TIDAR": "untidar.ac.id",
  "UNIVERSITAS BANGKA BELITUNG": "ubb.ac.id",
  "UNIVERSITAS KHAIRUN": "unkhair.ac.id",
  "POLITEKNIK NEGERI JAKARTA": "pnj.ac.id",
};

/**
 * Dapatkan domain universitas dari nama lengkapnya.
 */
export function getUnivDomain(name?: string | null): string | null {
  if (!name) return null;
  const n = name.toUpperCase().trim();

  if (UNIV_DOMAINS[n]) return UNIV_DOMAINS[n];

  for (const [key, domain] of Object.entries(UNIV_DOMAINS)) {
    if (n.includes(key) || key.includes(n)) return domain;
  }
  return null;
}

/**
 * Dapatkan URL logo universitas: Prioritaskan file lokal, fallback ke Clearbit API.
 */
export function getUnivLogoUrl(name?: string | null): string | null {
  if (!name) return null;
  const cleanSearch = name.toUpperCase().trim();

  // 1. Coba exact match ke local logos
  if (LOCAL_UNIV_LOGOS[cleanSearch]) {
    return LOCAL_UNIV_LOGOS[cleanSearch];
  }

  // 2. Coba partial match ke local logos
  for (const [key, path] of Object.entries(LOCAL_UNIV_LOGOS)) {
    if (cleanSearch.includes(key) || key.includes(cleanSearch)) {
      return path;
    }
  }

  // 3. Fallback ke Clearbit API jika ada domainnya
  const domain = getUnivDomain(name);
  if (domain) {
    return \`https://logo.clearbit.com/\${domain}\`;
  }

  return null;
}

/**
 * Dapatkan 2 huruf inisial universitas untuk AvatarFallback.
 */
export function getUnivInitials(name?: string | null): string {
  if (!name) return "??";
  const clean = name
    .toUpperCase()
    .replace("UNIVERSITAS ", "")
    .replace("INSTITUT ", "")
    .replace("POLITEKNIK ", "")
    .trim();
  const words = clean.split(" ").filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.substring(0, 2).toUpperCase();
}
`;

fs.writeFileSync(libFilePath, newContent, 'utf-8');
console.log("univ-logo.ts updated successfully!");
