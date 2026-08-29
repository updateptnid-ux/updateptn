import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | UpdatePTN",
  description: "Kebijakan privasi dan perlindungan data pengguna UpdatePTN",
};

export default function PrivacyPolicyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-slate-500">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Pendahuluan</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              UpdatePTN ("kami", "Platform") berkomitmen melindungi privasi dan data pribadi pengguna. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda sesuai dengan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (PDP)</li>
              <li>UU No. 19 Tahun 2016 tentang Informasi dan Transaksi Elektronik (ITE)</li>
              <li>Peraturan terkait lainnya yang berlaku di Indonesia</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Data yang Kami Kumpulkan</h2>
            
            <h3 className="text-base font-bold text-slate-800 mt-4">2.1. Data yang Anda Berikan Langsung</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Informasi Akun:</strong> Nama lengkap, email, password (terenkripsi), nomor telepon</li>
              <li><strong>Informasi Profil:</strong> Sekolah, kelas, jurusan pilihan SNBT, provinsi asal</li>
              <li><strong>Data Akademik:</strong> Hasil try out, jawaban soal, progress belajar, nilai rapor (opsional untuk SNBP)</li>
              <li><strong>Data Pembayaran:</strong> Informasi transaksi (melalui payment gateway Midtrans - kami TIDAK menyimpan data kartu kredit/debit)</li>
            </ul>

            <h3 className="text-base font-bold text-slate-800 mt-4">2.2. Data yang Dikumpulkan Otomatis</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Data Teknis:</strong> Alamat IP, jenis perangkat, sistem operasi, browser, resolusi layar</li>
              <li><strong>Data Penggunaan:</strong> Halaman yang dikunjungi, waktu akses, durasi sesi, klik tombol</li>
              <li><strong>Cookies:</strong> Kami menggunakan cookies untuk autentikasi dan analitik (lihat bagian Cookies)</li>
            </ul>

            <h3 className="text-base font-bold text-slate-800 mt-4">2.3. Data dari Pihak Ketiga</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Google OAuth:</strong> Jika Anda login dengan Google, kami menerima nama, email, dan foto profil</li>
              <li><strong>Payment Gateway:</strong> Status pembayaran dan ID transaksi dari Midtrans</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Tujuan Penggunaan Data</h2>
            <p className="text-sm text-slate-600 leading-relaxed">Kami menggunakan data Anda untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Penyediaan Layanan:</strong> Autentikasi akun, akses konten, hasil try out, fitur cek peluang PTN</li>
              <li><strong>Personalisasi:</strong> Rekomendasi soal berdasarkan kemampuan, tracking progress belajar</li>
              <li><strong>Komunikasi:</strong> Email notifikasi (jadwal live class, pengumuman penting, reminder try out)</li>
              <li><strong>Pembayaran:</strong> Verifikasi transaksi, penerbitan invoice, aktivasi paket premium</li>
              <li><strong>Keamanan:</strong> Deteksi fraud, pencegahan akses tidak sah, monitoring aktivitas mencurigakan</li>
              <li><strong>Analitik & Improvement:</strong> Menganalisis penggunaan fitur untuk meningkatkan kualitas Platform</li>
              <li><strong>Compliance:</strong> Memenuhi kewajiban hukum (seperti audit keuangan atau permintaan penegak hukum)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Penyimpanan Data</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.1. Lokasi:</strong> Data disimpan di server cloud Supabase (berbasis PostgreSQL) dengan lokasi server di region Singapore/Asia Pacific.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.2. Durasi Penyimpanan:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Data akun aktif: Selama akun masih digunakan + 2 tahun setelah tidak aktif</li>
              <li>Data akademik (try out, progress): 5 tahun sejak pengguna lulus SNBT atau menutup akun</li>
              <li>Data transaksi: 10 tahun (sesuai ketentuan perpajakan Indonesia)</li>
              <li>Log aktivitas: 1 tahun</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>4.3. Keamanan:</strong> Kami menerapkan enkripsi SSL/TLS, password hashing (bcrypt), role-based access control (RLS), dan backup rutin.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Pembagian Data kepada Pihak Ketiga</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami <strong>TIDAK menjual</strong> data pribadi Anda. Data hanya dibagikan dalam kondisi berikut:
            </p>
            
            <h3 className="text-base font-bold text-slate-800 mt-4">5.1. Penyedia Layanan Terpercaya</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Supabase:</strong> Database & autentikasi (dengan Data Processing Agreement)</li>
              <li><strong>Midtrans:</strong> Payment gateway untuk transaksi</li>
              <li><strong>Vercel/Netlify:</strong> Hosting dan CDN</li>
              <li><strong>Google Analytics/Posthog:</strong> Analitik penggunaan (data anonim)</li>
            </ul>

            <h3 className="text-base font-bold text-slate-800 mt-4">5.2. Kewajiban Hukum</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami dapat membagikan data jika diwajibkan oleh hukum (seperti perintah pengadilan, investigasi pidana, atau audit perpajakan).
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-4">5.3. Merger atau Akuisisi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jika terjadi merger, akuisisi, atau penjualan aset, data dapat ditransfer ke entitas baru dengan pemberitahuan kepada Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">6. Hak Pengguna atas Data Pribadi</h2>
            <p className="text-sm text-slate-600 leading-relaxed">Sesuai UU PDP, Anda memiliki hak:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Hak Akses:</strong> Meminta salinan data pribadi yang kami miliki</li>
              <li><strong>Hak Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat</li>
              <li><strong>Hak Penghapusan:</strong> Meminta penghapusan data (kecuali data yang wajib disimpan untuk compliance)</li>
              <li><strong>Hak Portabilitas:</strong> Mengunduh data dalam format yang dapat dibaca (JSON/CSV)</li>
              <li><strong>Hak Penarikan Persetujuan:</strong> Mencabut izin penggunaan data (dapat mempengaruhi layanan)</li>
              <li><strong>Hak Keberatan:</strong> Menolak penggunaan data untuk keperluan tertentu (seperti email marketing)</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Untuk mengajukan permintaan hak di atas, hubungi: <strong>updateptnid@gmail.com</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">7. Cookies dan Teknologi Pelacakan</h2>
            
            <h3 className="text-base font-bold text-slate-800 mt-4">7.1. Jenis Cookies yang Kami Gunakan</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Essential Cookies:</strong> Diperlukan untuk autentikasi dan fungsi dasar (tidak dapat ditolak)</li>
              <li><strong>Analytics Cookies:</strong> Mengukur performa dan penggunaan fitur (dapat ditolak)</li>
              <li><strong>Preference Cookies:</strong> Menyimpan pilihan bahasa, tema, dll.</li>
            </ul>

            <h3 className="text-base font-bold text-slate-800 mt-4">7.2. Cara Mengelola Cookies</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda dapat menghapus atau memblokir cookies melalui pengaturan browser. Namun, ini dapat mempengaruhi fungsi Platform (seperti logout otomatis).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">8. Keamanan Data</h2>
            <p className="text-sm text-slate-600 leading-relaxed">Kami menerapkan langkah keamanan berlapis:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li><strong>Enkripsi:</strong> HTTPS/TLS untuk semua komunikasi</li>
              <li><strong>Autentikasi:</strong> Password hashing dengan bcrypt, support 2FA (opsional)</li>
              <li><strong>Database Security:</strong> Row Level Security (RLS) di Supabase, IP whitelisting</li>
              <li><strong>Monitoring:</strong> Log aktivitas mencurigakan, rate limiting untuk mencegah brute force</li>
              <li><strong>Backup:</strong> Backup harian dengan enkripsi</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Namun, tidak ada sistem yang 100% aman. Kami mendorong Anda untuk menggunakan password yang kuat dan tidak membagikan akun kepada orang lain.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">9. Data Anak di Bawah Umur</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform kami diperuntukkan bagi siswa SMA (umumnya 15-18 tahun). Untuk pengguna di bawah 18 tahun, kami mendorong orang tua/wali untuk:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Mendampingi proses pendaftaran dan memberikan persetujuan</li>
              <li>Mengawasi aktivitas penggunaan Platform</li>
              <li>Menghubungi kami jika ada kekhawatiran terkait privasi anak</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Jika kami mengetahui bahwa kami secara tidak sengaja mengumpulkan data dari anak di bawah 13 tahun tanpa persetujuan orang tua, kami akan segera menghapus data tersebut.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">10. Transfer Data Lintas Negara</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Data Anda dapat diproses di server di luar Indonesia (region Asia Pacific) untuk alasan efisiensi dan ketersediaan. Kami memastikan bahwa penyedia layanan tersebut memenuhi standar keamanan yang setara dengan regulasi Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">11. Perubahan Kebijakan Privasi</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu untuk mencerminkan perubahan praktik atau regulasi. Perubahan signifikan akan diberitahukan melalui:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Email notifikasi ke alamat yang terdaftar</li>
              <li>Pop-up atau banner di Platform</li>
              <li>Update tanggal "Terakhir diperbarui" di bagian atas halaman ini</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Penggunaan Platform setelah perubahan dianggap sebagai persetujuan atas kebijakan yang baru.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">12. Penghapusan Akun</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda dapat menghapus akun melalui menu Pengaturan → Hapus Akun atau dengan menghubungi tim kami. Setelah penghapusan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>Data pribadi akan dihapus dalam 30 hari</li>
              <li>Data transaksi tetap disimpan 10 tahun untuk keperluan audit (sesuai hukum)</li>
              <li>Data yang telah dianonimkan (untuk statistik agregat) tidak akan dihapus</li>
              <li>Akses ke konten premium akan langsung dicabut</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">13. Kontak & Pengaduan</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan, kekhawatiran, atau ingin mengajukan pengaduan terkait privasi, hubungi:
            </p>
            <ul className="list-none space-y-2 text-sm text-slate-600 mt-3">
              <li><strong>Data Protection Officer (DPO):</strong> updateptnid@gmail.com</li>
              <li><strong>Email Support:</strong> updateptnid@gmail.com</li>
              <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
              <li><strong>Alamat:</strong> Jakarta, Indonesia</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Kami akan merespons dalam 7 hari kerja. Jika Anda tidak puas dengan tanggapan kami, Anda dapat mengajukan pengaduan ke:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 mt-2">
              <li><strong>Kementerian Komunikasi dan Informatika (Kominfo)</strong></li>
              <li><strong>Badan Perlindungan Data Pribadi</strong> (setelah operasional penuh)</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Dengan menggunakan Platform UpdatePTN, Anda menyatakan telah membaca, memahami, dan menyetujui Kebijakan Privasi ini. Kami menghargai kepercayaan Anda dan berkomitmen untuk melindungi data pribadi Anda dengan sebaik-baiknya.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
