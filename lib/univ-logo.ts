/**
 * Utility: University Logo via Local Assets with Clearbit Fallback
 * Dipakai di seluruh platform untuk menampilkan logo PTN secara ringan & offline-first.
 */

export const LOCAL_UNIV_LOGOS: Record<string, string> = {
  "ISBI-ACEH": "/logo-univ/intitut/Logo-ISBI-Aceh-removebg-preview.png",
  "INSTITUT SENI BUDAYA INDONESIA BANDUNG": "/logo-univ/intitut/Logo_Institut_Seni_Budaya_Indonesia_Bandung-removebg-preview.png",
  "INSTITUT SENI INDONESIA PADANGPANJANG": "/logo-univ/intitut/Logo_Institut_Seni_Indonesia_Padangpanjang-removebg-preview.png",
  "INSTITUT TEKNOLOGI BANDUNG": "/logo-univ/intitut/Logo_Institut_Teknologi_Bandung-removebg-preview.png",
  "INSTITUT TEKNOLOGI KALIMANTAN": "/logo-univ/intitut/Logo_Institut_Teknologi_Kalimantan-removebg-preview.png",
  "INSTITUT TEKNOLOGI SUMATERA": "/logo-univ/intitut/Logo_Institut_Teknologi_Sumatera-removebg-preview.png",
  "INSTITUT  BJ HABIBIE PARE": "/logo-univ/intitut/Logo_Institut__BJ_Habibie_pare-removebg-preview.png",
  "IPB": "/logo-univ/intitut/Logo_IPB-removebg-preview.png",
  "ISBI TANAH PAPUA": "/logo-univ/intitut/Logo_ISBI_Tanah_Papua-removebg-preview.png",
  "ISI BALI": "/logo-univ/intitut/Logo_ISI_Bali-removebg-preview.png",
  "ISI SURAKARTA": "/logo-univ/intitut/Logo_ISI_Surakarta-removebg-preview.png",
  "ISI YOGYAKARTA": "/logo-univ/intitut/Logo_ISI_Yogyakarta-removebg-preview.png",
  "ITS": "/logo-univ/intitut/Logo_ITS-removebg-preview.png",
  "PENS": "/logo-univ/poltek/Logo_PENS-removebg-preview.png",
  "POLITANI NEGERI KUPANG": "/logo-univ/poltek/Logo_Politani_Negeri_Kupang-removebg-preview.png",
  "POLITEKNIK-NEGERI-INDRAMAYU": "/logo-univ/poltek/Logo_Politeknik-Negeri-Indramayu-removebg-preview.png",
  "POLITEKNIK MANUFAKTUR BANDUNG": "/logo-univ/poltek/Logo_Politeknik_Manufaktur_Bandung-removebg-preview.png",
  "POLITEKNIK MANUFAKTUR NEGERI BANGKA BELITUNG": "/logo-univ/poltek/Logo_Politeknik_Manufaktur_Negeri_Bangka_Belitung-removebg-preview.png",
  "POLITEKNIK MARITIM NEGERI INDONESIA": "/logo-univ/poltek/Logo_Politeknik_Maritim_Negeri_Indonesia-removebg-preview.png",
  "POLITEKNIK NEGERI AMBON": "/logo-univ/poltek/Logo_Politeknik_Negeri_Ambon-removebg-preview.png",
  "POLITEKNIK NEGERI BALI": "/logo-univ/poltek/Logo_Politeknik_Negeri_Bali-removebg-preview.png",
  "POLITEKNIK NEGERI BALIKPAPAN": "/logo-univ/poltek/Logo_Politeknik_Negeri_Balikpapan-removebg-preview.png",
  "POLITEKNIK NEGERI BANDUNG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Bandung-removebg-preview.png",
  "POLITEKNIK NEGERI BANJARMASIN": "/logo-univ/poltek/Logo_Politeknik_Negeri_Banjarmasin-removebg-preview.png",
  "POLITEKNIK NEGERI BANYUWANGI": "/logo-univ/poltek/Logo_Politeknik_Negeri_Banyuwangi-removebg-preview.png",
  "POLITEKNIK NEGERI BATAM": "/logo-univ/poltek/Logo_Politeknik_Negeri_Batam-removebg-preview.png",
  "POLITEKNIK NEGERI BENGKALIS": "/logo-univ/poltek/Logo_Politeknik_Negeri_Bengkalis-removebg-preview.png",
  "POLITEKNIK NEGERI CILACAP": "/logo-univ/poltek/Logo_Politeknik_Negeri_Cilacap-removebg-preview.png",
  "POLITEKNIK NEGERI FAKFAK": "/logo-univ/poltek/Logo_Politeknik_Negeri_Fakfak-removebg-preview.png",
  "POLITEKNIK NEGERI JAKARTA": "/logo-univ/poltek/Logo_Politeknik_Negeri_jakarta-removebg-preview.png",
  "POLITEKNIK NEGERI JEMBER": "/logo-univ/poltek/Logo_Politeknik_Negeri_Jember-removebg-preview.png",
  "POLITEKNIK NEGERI KETAPANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_ketapang-removebg-preview.png",
  "POLITEKNIK NEGERI LAMPUNG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Lampung-removebg-preview.png",
  "POLITEKNIK NEGERI LHOKSEUMAWE": "/logo-univ/poltek/Logo_Politeknik_Negeri_Lhokseumawe-removebg-preview.png",
  "POLITEKNIK NEGERI MADURA": "/logo-univ/poltek/Logo_Politeknik_Negeri_Madura-removebg-preview.png",
  "POLITEKNIK NEGERI MALANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Malang-removebg-preview.png",
  "POLITEKNIK NEGERI MANADO": "/logo-univ/poltek/Logo_Politeknik_Negeri_Manado-removebg-preview.png",
  "POLITEKNIK NEGERI MEDAN": "/logo-univ/poltek/Logo_Politeknik_Negeri_Medan-removebg-preview.png",
  "POLITEKNIK NEGERI MEDIA KREATIF": "/logo-univ/poltek/Logo_Politeknik_Negeri_Media_Kreatif-removebg-preview.png",
  "POLITEKNIK NEGERI NUNUKAN": "/logo-univ/poltek/Logo_Politeknik_Negeri_Nunukan-removebg-preview.png",
  "POLITEKNIK NEGERI NUSA UTARA": "/logo-univ/poltek/Logo_Politeknik_Negeri_Nusa_Utara-removebg-preview.png",
  "POLITEKNIK NEGERI PADANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Padang-removebg-preview.png",
  "POLITEKNIK NEGERI PANGKAJENE KEPULAUAN": "/logo-univ/poltek/Logo_Politeknik_Negeri_Pangkajene_Kepulauan-removebg-preview.png",
  "POLITEKNIK NEGERI PONTIANAK": "/logo-univ/poltek/Logo_Politeknik_Negeri_Pontianak-removebg-preview.png",
  "POLITEKNIK NEGERI SAMARINDA": "/logo-univ/poltek/Logo_Politeknik_Negeri_Samarinda-removebg-preview.png",
  "POLITEKNIK NEGERI SAMBAS": "/logo-univ/poltek/Logo_Politeknik_Negeri_Sambas-removebg-preview.png",
  "POLITEKNIK NEGERI SEMARANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Semarang-removebg-preview.png",
  "POLITEKNIK NEGERI SRIWIJAYA": "/logo-univ/poltek/Logo_Politeknik_Negeri_Sriwijaya-removebg-preview.png",
  "POLITEKNIK NEGERI SUBANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Subang-removebg-preview.png",
  "POLITEKNIK NEGERI TANAH LAUT": "/logo-univ/poltek/Logo_Politeknik_Negeri_Tanah_Laut-removebg-preview.png",
  "POLITEKNIK NEGERI UJUNG PANDANG": "/logo-univ/poltek/Logo_Politeknik_Negeri_Ujung_Pandang-removebg-preview.png",
  "POLITEKNIK PERIKANAN NEGERI": "/logo-univ/poltek/Logo_Politeknik_Perikanan_Negeri-removebg-preview.png",
  "POLITEKNIK PERKAPALAN NEGERI SURABAYA": "/logo-univ/poltek/Logo_Politeknik_Perkapalan_Negeri_Surabaya-removebg-preview.png",
  "POLITEKNIK PERTANIAN NEGERI PAYAKUMBUH": "/logo-univ/poltek/Logo_Politeknik_Pertanian_Negeri_Payakumbuh-removebg-preview.png",
  "POLITEKNIK PERTANIAN NEGERI SAMARINDA": "/logo-univ/poltek/Logo_Politeknik_Pertanian_Negeri_Samarinda-removebg-preview.png",
  "POLITEKNIK NEGERI MADIUN": "/logo-univ/poltek/Politeknik_Negeri_Madiun-removebg-preview.png",
  "LAMBANG UIN AR-RANIRY": "/logo-univ/uin/Lambang_UIN_Ar-Raniry-removebg-preview.png",
  "UIN ALAUDDIN": "/logo-univ/uin/Logo_UIN_Alauddin-removebg-preview.png",
  "UIN ANTASARI BANJARMASIN": "/logo-univ/uin/Logo_UIN_Antasari_Banjarmasin-removebg-preview.png",
  "UIN IMAM BONJOL": "/logo-univ/uin/Logo_UIN_Imam_Bonjol-removebg-preview.png",
  "UIN PALU": "/logo-univ/uin/Logo_UIN_Palu-removebg-preview.png",
  "UIN SYARIF HIDAYATULLAH JAKARTA": "/logo-univ/uin/Logo_UIN_Syarif_Hidayatullah_Jakarta.png",
  "UIN K.H. ABDURRAHMAN WAHID PEKALONGAN": "/logo-univ/uin/UIN K.H. ABDURRAHMAN WAHID PEKALONGAN.png",
  "UIN MAHMUD YUNUS BATUSANGKAR": "/logo-univ/uin/UIN MAHMUD YUNUS BATUSANGKAR.png",
  "UIN MALANG": "/logo-univ/uin/UIN MALANG.png",
  "UIN MATARAM": "/logo-univ/uin/UIN MATARAM.png",
  "UIN PROFESOR KIAI HAJI SAIFUDDIN ZUHRI PURWOKERTO": "/logo-univ/uin/UIN PROFESOR KIAI HAJI SAIFUDDIN ZUHRI PURWOKERTO.png",
  "UIN RADEN FATAH": "/logo-univ/uin/UIN RADEN FATAH.png",
  "UIN RADEN INTAN LAMPUNG": "/logo-univ/uin/UIN RADEN INTAN LAMPUNG.png",
  "UIN RADEN MAS SAID SURAKARTA": "/logo-univ/uin/UIN RADEN MAS SAID SURAKARTA.png",
  "UIN SALATIGA": "/logo-univ/uin/UIN SALATIGA.png",
  "UIN SJECH M. DJAMIL DJAMBEK BUKITTINGGI": "/logo-univ/uin/UIN SJECH M. DJAMIL DJAMBEK BUKITTINGGI.png",
  "UIN SULTAN AJI MUHAMMAD IDRIS SAMARINDA": "/logo-univ/uin/UIN SULTAN AJI MUHAMMAD IDRIS SAMARINDA.png",
  "UIN SULTAN MAULANA HASANUDDIN BANTEN": "/logo-univ/uin/UIN SULTAN MAULANA HASANUDDIN BANTEN.png",
  "UIN SULTAN SYARIF KASIM": "/logo-univ/uin/UIN SULTAN SYARIF KASIM.png",
  "UIN SULTAN THAHA SAIFUDDIN JAMBI": "/logo-univ/uin/UIN SULTAN THAHA SAIFUDDIN JAMBI.png",
  "UIN SUMATERA UTARA": "/logo-univ/uin/UIN SUMATERA UTARA.png",
  "UIN SUNAN AMPEL SURABAYA": "/logo-univ/uin/UIN SUNAN AMPEL SURABAYA.png",
  "UIN SUNAN GUNUNG DJATI": "/logo-univ/uin/UIN SUNAN GUNUNG DJATI.png",
  "UIN SUNAN KALIJAGA": "/logo-univ/uin/UIN SUNAN KALIJAGA.png",
  "UIN SYEKH ALI HASAN AHMAD ADDARY PADANGSIDIMPUAN": "/logo-univ/uin/UIN SYEKH ALI HASAN AHMAD ADDARY PADANGSIDIMPUAN.png",
  "UIN WALISONGO": "/logo-univ/uin/UIN WALISONGO.png",
  "UNIVERSITAS AIRLANGGA": "/logo-univ/univ/UNIVERSITAS AIRLANGGA.png",
  "UNIVERSITAS ANDALAS": "/logo-univ/univ/UNIVERSITAS ANDALAS.png",
  "UNIVERSITAS BANGKA BELITUNG": "/logo-univ/univ/UNIVERSITAS BANGKA BELITUNG.png",
  "UNIVERSITAS BENGKULU": "/logo-univ/univ/Universitas Bengkulu.png",
  "UNIVERSITAS BORNEO TARAKAN": "/logo-univ/univ/UNIVERSITAS BORNEO TARAKAN.png",
  "UNIVERSITAS BRAWIJAYA": "/logo-univ/univ/UNIVERSITAS BRAWIJAYA.png",
  "UNIVERSITAS CENDERAWASIH": "/logo-univ/univ/UNIVERSITAS CENDERAWASIH.png",
  "UNIVERSITAS DIPONEGORO": "/logo-univ/univ/Universitas Diponegoro.png",
  "UNIVERSITAS GADJAH MADA": "/logo-univ/univ/Universitas Gadjah Mada.png",
  "UGM": "/logo-univ/univ/Universitas Gadjah Mada.png",
  "UM-CBT UGM": "/logo-univ/univ/Universitas Gadjah Mada.png",
  "UM UGM": "/logo-univ/univ/Universitas Gadjah Mada.png",
  "UNIVERSITAS HALU OLEO": "/logo-univ/univ/Universitas Halu Oleo.png",
  "UNIVERSITAS HASANUDDIN": "/logo-univ/univ/Universitas Hasanuddin.png",
  "UNIVERSITAS INDONESIA": "/logo-univ/univ/Universitas Indonesia.png",
  "UI": "/logo-univ/univ/Universitas Indonesia.png",
  "SIMAK UI": "/logo-univ/univ/Universitas Indonesia.png",
  "SMMPTN-BARAT": "/logo-univ/univ/Universitas Syiah Kuala.png",
  "SMMPTN BARAT": "/logo-univ/univ/Universitas Syiah Kuala.png",
  "UNIVERSITAS JAMBI": "/logo-univ/univ/Universitas Jambi.png",
  "UNIVERSITAS JEMBER": "/logo-univ/univ/Universitas Jember.png",
  "UNIVERSITAS JENDERAL SOEDIRMAN": "/logo-univ/univ/Universitas Jenderal Soedirman.png",
  "UNIVERSITAS KHAIRUN": "/logo-univ/univ/Universitas Khairun.png",
  "UNIVERSITAS LAMBUNG MANGKURAT": "/logo-univ/univ/Universitas Lambung Mangkurat.png",
  "UNIVERSITAS LAMPUNG": "/logo-univ/univ/Universitas Lampung.png",
  "UNIVERSITAS MALIKUSSALEH": "/logo-univ/univ/Universitas MalikussaleH.png",
  "UNIVERSITAS MARITIM RAJA ALI HAJI": "/logo-univ/univ/Universitas Maritim Raja Ali Haji.png",
  "UNIVERSITAS MATARAM": "/logo-univ/univ/Universitas Mataram.png",
  "UNIVERSITAS MULAWARMAN": "/logo-univ/univ/Universitas Mulawarman.png",
  "UNIVERSITAS MUSAMUS MERAUKE": "/logo-univ/univ/Universitas Musamus Merauke.png",
  "UNIVERSITAS NEGERI GORONTALO": "/logo-univ/univ/Universitas Negeri Gorontalo.png",
  "UNIVERSITAS NEGERI JAKARTA": "/logo-univ/univ/Universitas Negeri Jakarta.png",
  "UNIVERSITAS NEGERI MAKASSAR": "/logo-univ/univ/Universitas Negeri Makassar.png",
  "UNIVERSITAS NEGERI MALANG": "/logo-univ/univ/Universitas Negeri Malang.png",
  "UNIVERSITAS NEGERI MANADO": "/logo-univ/univ/Universitas Negeri Manado.png",
  "UNIVERSITAS NEGERI MEDAN": "/logo-univ/univ/Universitas Negeri Medan.png",
  "UNIVERSITAS NEGERI PADANG": "/logo-univ/univ/Universitas Negeri Padang.png",
  "UNIVERSITAS NEGERI SEMARANG": "/logo-univ/univ/Universitas Negeri Semarang.png",
  "UNIVERSITAS NEGERI SURABAYA": "/logo-univ/univ/Universitas Negeri Surabaya.png",
  "UNIVERSITAS NEGERI YOGYAKARTA": "/logo-univ/univ/Universitas Negeri Yogyakarta.png",
  "UNIVERSITAS NUSA CENDANA": "/logo-univ/univ/Universitas Nusa Cendana.png",
  "UNIVERSITAS PADJADJARAN": "/logo-univ/univ/Universitas Padjadjaran.png",
  "UNIVERSITAS PALANGKA RAYA": "/logo-univ/univ/Universitas Palangka Raya.png",
  "UNIVERSITAS PAPUA": "/logo-univ/univ/Universitas Papua.png",
  "UNIVERSITAS PATTIMURA": "/logo-univ/univ/Universitas Pattimura.png",
  "UNIVERSITAS PENDIDIKAN GANESHA": "/logo-univ/univ/Universitas Pendidikan Ganesha.png",
  "UNIVERSITAS PENDIDIKAN INDONESIA": "/logo-univ/univ/Universitas Pendidikan Indonesia.png",
  "UNIVERSITAS RIAU": "/logo-univ/univ/Universitas Riau.png",
  "UNIVERSITAS SAM RATULANGI": "/logo-univ/univ/Universitas Sam Ratulangi.png",
  "UNIVERSITAS SAMUDRA": "/logo-univ/univ/Universitas Samudra.png",
  "UNIVERSITAS SEBELAS MARET": "/logo-univ/univ/Universitas Sebelas Maret.png",
  "UNIVERSITAS SEMBILANBELAS NOVEMBER KOLAKA": "/logo-univ/univ/Universitas Sembilanbelas November Kolaka.png",
  "UNIVERSITAS SILIWANGI": "/logo-univ/univ/Universitas Siliwangi.png",
  "UNIVERSITAS SINGAPERBANGSA KARAWANG": "/logo-univ/univ/Universitas Singaperbangsa Karawang.png",
  "UNIVERSITAS SRIWIJAYA": "/logo-univ/univ/Universitas Sriwijaya.png",
  "UNIVERSITAS SULAWESI BARAT": "/logo-univ/univ/Universitas Sulawesi Barat.png",
  "UNIVERSITAS SULTAN AGENG TIRTAYASA": "/logo-univ/univ/Universitas Sultan Ageng Tirtayasa.png",
  "UNIVERSITAS SUMATERA UTARA": "/logo-univ/univ/Universitas Sumatera Utara.png",
  "UNIVERSITAS SYIAH KUALA": "/logo-univ/univ/Universitas Syiah Kuala.png",
  "UNIVERSITAS TADULAKO": "/logo-univ/univ/Universitas Tadulako.png",
  "UNIVERSITAS TANJUNGPURA": "/logo-univ/univ/Universitas Tanjungpura.png",
  "UNIVERSITAS TEUKU UMAR": "/logo-univ/univ/Universitas Teuku Umar.png",
  "UNIVERSITAS TIDAR": "/logo-univ/univ/Universitas Tidar.png",
  "UNIVERSITAS TIMOR": "/logo-univ/univ/Universitas Timor.png",
  "UNIVERSITAS TRUNOJOYO MADURA": "/logo-univ/univ/Universitas Trunojoyo Madura.png",
  "UNIVERSITAS UDAYANA": "/logo-univ/univ/Universitas Udayana.png",
  "UPN VETERAN JAKARTA": "/logo-univ/univ/UPN Veteran Jakarta.png",
  "UPN VETERAN JAWA TIMUR": "/logo-univ/univ/UPN Veteran Jawa Timur.png",
  "UPN VETERAN YOGYAKARTA": "/logo-univ/univ/UPN Veteran Yogyakarta.png"
};

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
    return `https://logo.clearbit.com/${domain}`;
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
