import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | UpdatePTN",
  description: "Syarat dan ketentuan penggunaan platform UpdatePTN",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            Syarat & Ketentuan
          </h1>
          <p className="text-sm text-slate-500">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Penerimaan Ketentuan</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dengan mengakses dan menggunakan platform UpdatePTN ("Platform"), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui syarat ini, Anda tidak diperkenankan menggunakan Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Definisi</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>"Platform"</strong> mengacu pada situs web dan aplikasi UpdatePTN beserta seluruh layanannya.</li>
              <li><strong>"Pengguna"</strong> adalah setiap individu yang mendaftar dan menggunakan Platform.</li>
              <li><strong>"Konten"</strong> mencakup soal, pembahasan, video, modul, live class, dan materi pembelajaran lainnya.</li>
              <li><strong>"Paket Premium"</strong> adalah layanan berbayar dengan fitur tambahan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Pendaftaran Akun</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>3.1.</strong> Pengguna wajib berusia minimal 13 tahun atau mendapatkan izin dari orang tua/wali untuk menggunakan Platform.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>3.2.</strong> Pengguna bertanggung jawab menjaga kerahasiaan informasi akun (email dan password) dan tidak diperkenankan membagikan akses kepada pihak lain.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>3.3.</strong> UpdatePTN berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Layanan dan Konten</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.1. Akses Konten:</strong> Pengguna mendapatkan akses non-eksklusif dan tidak dapat dipindahtangankan kepada konten selama masa berlangganan aktif.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.2. Try Out IRT:</strong> Sistem penilaian Item Response Theory (IRT) merupakan estimasi berdasarkan data historis dan tidak menjamin hasil ujian resmi.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.3. Cek Peluang PTN:</strong> Fitur rasionalisasi dan prediksi passing grade bersifat estimasi berdasarkan data tahun sebelumnya dan tidak menjamin kelulusan.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.4. Live Class:</strong> Jadwal live class dapat berubah sewaktu-waktu. Rekaman (replay) tersedia bagi pengguna premium.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Pembayaran dan Pengembalian Dana</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>5.1. Harga:</strong> Harga paket dapat berubah sewaktu-waktu. Harga yang berlaku adalah harga saat transaksi dilakukan.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>5.2. Metode Pembayaran:</strong> Kami menerima pembayaran melalui payment gateway resmi (Midtrans) dengan metode transfer bank, e-wallet, dan virtual account.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>5.3. Pengembalian Dana:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Pengembalian dana hanya berlaku untuk paket yang belum diakses sama sekali (0% progress) dalam 7 hari sejak pembelian.</li>
              <li>Khusus Paket Platinum VIP dengan garansi uang kembali: Berlaku jika pengguna tidak lulus SNBT dengan syarat:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Mengikuti minimal 80% live class yang dijadwalkan</li>
                  <li>Menyelesaikan minimal 10 try out lengkap</li>
                  <li>Melampirkan bukti hasil SNBT resmi</li>
                  <li>Klaim diajukan maksimal 30 hari setelah pengumuman SNBT</li>
                </ul>
              </li>
              <li>Pengembalian dana diproses dalam 14 hari kerja.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">6. Hak Kekayaan Intelektual</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>6.1.</strong> Seluruh konten di Platform (termasuk soal, pembahasan, video, modul, logo, dan desain) adalah milik UpdatePTN dan dilindungi oleh hak cipta.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>6.2.</strong> Pengguna <strong>DILARANG KERAS</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Mengunduh, menyalin, atau mendistribusikan konten tanpa izin tertulis</li>
              <li>Menggunakan konten untuk kepentingan komersial</li>
              <li>Membagikan akun atau akses kepada pihak lain</li>
              <li>Melakukan scraping, crawling, atau reverse engineering terhadap Platform</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>6.3.</strong> Pelanggaran akan dikenakan sanksi hukum sesuai UU No. 28 Tahun 2014 tentang Hak Cipta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">7. Larangan Penggunaan</h2>
            <p className="text-sm text-slate-600 leading-relaxed">Pengguna dilarang:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Menggunakan Platform untuk tujuan ilegal atau melanggar hukum</li>
              <li>Mengunggah konten yang mengandung virus, malware, atau kode berbahaya</li>
              <li>Melakukan tindakan yang dapat mengganggu atau merusak sistem Platform</li>
              <li>Menyalahgunakan fitur (seperti spam, bot, atau manipulasi hasil try out)</li>
              <li>Melakukan tindakan diskriminasi, pelecehan, atau kekerasan verbal terhadap pengguna lain</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">8. Pembatasan Tanggung Jawab</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>8.1.</strong> UpdatePTN tidak bertanggung jawab atas kegagalan kelulusan SNBT, UTBK, atau ujian mandiri PTN.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>8.2.</strong> Platform disediakan "sebagaimana adanya" tanpa jaminan ketersediaan 100% (dapat terjadi maintenance atau gangguan teknis).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>8.3.</strong> UpdatePTN tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan atau ketidakmampuan menggunakan Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">9. Perubahan Layanan dan Ketentuan</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>9.1.</strong> UpdatePTN berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja dengan atau tanpa pemberitahuan.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>9.2.</strong> Syarat & Ketentuan ini dapat diperbarui sewaktu-waktu. Pengguna akan diberitahu melalui email atau notifikasi di Platform.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>9.3.</strong> Penggunaan Platform setelah perubahan ketentuan dianggap sebagai persetujuan atas perubahan tersebut.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">10. Hukum yang Berlaku</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Syarat & Ketentuan ini diatur berdasarkan hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui musyawarah atau melalui pengadilan di wilayah hukum Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">11. Kontak</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan terkait Syarat & Ketentuan ini, hubungi kami:
            </p>
            <ul className="list-none space-y-2 text-sm text-slate-600">
              <li><strong>Email:</strong> updateptnid@gmail.com</li>
              <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
              <li><strong>Alamat:</strong> Jakarta, Indonesia</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Dengan melanjutkan penggunaan Platform UpdatePTN, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
