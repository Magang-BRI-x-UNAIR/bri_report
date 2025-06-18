import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";
import {
    Check,
    ArrowRight,
    PieChart,
    ShieldCheck,
    Users,
    GanttChart,
    BookOpen,
    GraduationCap,
} from "lucide-react";

const AboutPage = () => {
    return (
        <GuestLayout title="About">
            <Head title="About" />

            <div className="bg-gradient-to-r from-[#003b75] to-[#00529C] text-white py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <p className="mb-4 inline-block px-4 py-1 bg-[#F37021]/20 rounded-full text-sm font-medium">
                            Kerja Sama BRI x Universitas Airlangga
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Inovasi Melalui Kolaborasi Industri & Akademisi
                        </h1>
                        <p className="text-xl mb-8 text-gray-100">
                            BRI Report adalah platform terintegrasi hasil
                            kolaborasi BRI dan Universitas Airlangga yang
                            dirancang untuk meningkatkan efisiensi pelaporan
                            perbankan melalui teknologi inovatif.
                        </p>
                        <a
                            href="#learn-more"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#F37021] to-[#ff8c47] rounded-lg text-white font-medium transition-all hover:shadow-xl hover:-translate-y-0.5 duration-300"
                        >
                            Pelajari Lebih Lanjut
                            <ArrowRight size={16} className="ml-2" />
                        </a>
                    </div>
                </div>

                {/* Abstract shapes background */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10">
                    <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/20"></div>
                    <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full bg-white/10"></div>
                    <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/15"></div>
                </div>
            </div>

            {/* Collaboration Overview */}
            <div id="learn-more" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-sm uppercase text-[#F37021] font-bold tracking-wider mb-3">
                            Program Magang
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Tentang Kolaborasi Kami
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#003b75] to-[#00529C] mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <h4 className="text-2xl font-semibold text-gray-900 mb-5">
                                Sinergi Pengetahuan dan Praktik Perbankan
                            </h4>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                Program magang BRI x Universitas Airlangga
                                merupakan wujud nyata kolaborasi antara dunia
                                industri perbankan dengan institusi pendidikan
                                tinggi. Melalui program ini, kami mengembangkan
                                solusi teknologi inovatif yang menggabungkan
                                keahlian praktis dunia perbankan dengan riset
                                akademis terkini.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center text-center">
                                    <img
                                        src="/images/bri-logo.png"
                                        alt="BRI Logo"
                                        className="h-14 mb-3"
                                    />
                                    <p className="text-gray-700 text-sm">
                                        Pengalaman dan keahlian dalam industri
                                        perbankan
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center text-center">
                                    <img
                                        src="/images/unair-logo.png"
                                        alt="Universitas Airlangga Logo"
                                        className="h-14 mb-3"
                                    />
                                    <p className="text-gray-700 text-sm">
                                        Inovasi dan penelitian akademis terdepan
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed">
                                BRI Report adalah hasil nyata dari kolaborasi
                                ini. Platform ini mendemonstrasikan bagaimana
                                sinergi antara industri dan akademisi dapat
                                menghasilkan solusi teknologi yang menjawab
                                tantangan nyata dalam dunia perbankan.
                            </p>
                        </div>

                        <div className="relative h-[400px] md:h-auto rounded-xl overflow-hidden shadow-xl order-1 md:order-2">
                            <img
                                src="/images/logo.png"
                                alt="BRI x UNAIR Collaboration"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#003b75]/80 to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <p className="text-lg font-semibold mb-2">
                                        Kerja Sama Strategis
                                    </p>
                                    <p className="text-sm opacity-90">
                                        Memadukan praktik industri dan inovasi
                                        akademis
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Objectives */}
            <div className="py-20 bg-gradient-to-r from-[#003b75]/5 to-[#00529C]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm uppercase text-[#F37021] font-bold tracking-wider mb-3">
                            Tujuan Proyek
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Sasaran Pengembangan BRI Report
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#003b75] to-[#00529C] mx-auto mb-8"></div>
                        <p className="max-w-3xl mx-auto text-gray-600">
                            Proyek magang ini berfokus pada beberapa tujuan
                            strategis untuk mengembangkan sistem pelaporan yang
                            lebih efisien dan handal.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors duration-300"></div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <BookOpen
                                    size={22}
                                    className="mr-3 text-[#003b75]"
                                />
                                Tujuan Pembelajaran
                            </h4>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#F37021] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Mengaplikasikan konsep akademis dalam
                                        lingkungan kerja nyata
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#F37021] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Memperdalam pemahaman tentang sistem
                                        informasi perbankan
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#F37021] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Mengembangkan keterampilan teknis dalam
                                        pengembangan web
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#F37021] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Memahami proses bisnis dan regulasi di
                                        industri perbankan
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 group-hover:bg-orange-100 transition-colors duration-300"></div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <GraduationCap
                                    size={22}
                                    className="mr-3 text-[#F37021]"
                                />
                                Tujuan Pengembangan
                            </h4>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#003b75] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Mengembangkan platform pelaporan yang
                                        mudah digunakan dan efisien
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#003b75] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Mengotomatisasi proses pelaporan untuk
                                        mengurangi kesalahan manual
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#003b75] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Mengintegrasikan sistem dengan data
                                        sumber yang beragam
                                    </span>
                                </li>
                                <li className="flex">
                                    <Check
                                        size={20}
                                        className="text-[#003b75] mr-3 shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Menyediakan visualisasi data yang
                                        informatif untuk pengambilan keputusan
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Features */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm uppercase text-[#F37021] font-bold tracking-wider mb-3">
                            Fitur Unggulan
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Solusi Terintegrasi untuk Kebutuhan Pelaporan
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#003b75] to-[#00529C] mx-auto mb-8"></div>
                        <p className="max-w-3xl mx-auto text-gray-600">
                            BRI Report menawarkan berbagai fitur canggih yang
                            dikembangkan melalui program magang BRI x
                            Universitas Airlangga.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#003b75] transition-colors duration-300">
                                    <PieChart
                                        size={24}
                                        className="text-[#003b75] group-hover:text-white transition-colors duration-300"
                                    />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                    Visualisasi Data Interaktif
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Dashboard dengan grafik interaktif yang
                                    memudahkan analisis dan interpretasi data
                                    keuangan secara cepat.
                                </p>
                                <div className="pt-2">
                                    <a
                                        href="#"
                                        className="text-[#00529C] font-medium flex items-center hover:text-[#F37021] transition-colors"
                                    >
                                        <span>Pelajari lebih lanjut</span>
                                        <ArrowRight
                                            size={16}
                                            className="ml-2"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#F37021] transition-colors duration-300">
                                    <GanttChart
                                        size={24}
                                        className="text-[#F37021] group-hover:text-white transition-colors duration-300"
                                    />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                    Templat Laporan Kustom
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Sesuaikan laporan dengan kebutuhan spesifik
                                    bank, dengan template yang dapat
                                    dimodifikasi dan ekspor multi-format.
                                </p>
                                <div className="pt-2">
                                    <a
                                        href="#"
                                        className="text-[#00529C] font-medium flex items-center hover:text-[#F37021] transition-colors"
                                    >
                                        <span>Pelajari lebih lanjut</span>
                                        <ArrowRight
                                            size={16}
                                            className="ml-2"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-green-600 transition-colors duration-300">
                                    <ShieldCheck
                                        size={24}
                                        className="text-green-600 group-hover:text-white transition-colors duration-300"
                                    />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                    Keamanan Data Terjamin
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Implementasi standar keamanan perbankan
                                    tertinggi dengan enkripsi end-to-end dan
                                    manajemen akses berlapis.
                                </p>
                                <div className="pt-2">
                                    <a
                                        href="#"
                                        className="text-[#00529C] font-medium flex items-center hover:text-[#F37021] transition-colors"
                                    >
                                        <span>Pelajari lebih lanjut</span>
                                        <ArrowRight
                                            size={16}
                                            className="ml-2"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technology Stack */}
            <div className="py-20 bg-gradient-to-r from-[#003b75]/5 to-[#00529C]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm uppercase text-[#F37021] font-bold tracking-wider mb-3">
                            Stack Teknologi
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Dibangun dengan Teknologi Modern
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#003b75] to-[#00529C] mx-auto"></div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-md">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3 shadow-md flex items-center justify-center">
                                    <img
                                        src="/images/laravel.png"
                                        alt="Laravel"
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <p className="font-medium text-gray-800">
                                    Laravel
                                </p>
                                <p className="text-sm text-gray-500 text-center mt-1">
                                    Backend Framework
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3 shadow-md flex items-center justify-center">
                                    <img
                                        src="/images/react.png"
                                        alt="React"
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <p className="font-medium text-gray-800">
                                    React
                                </p>
                                <p className="text-sm text-gray-500 text-center mt-1">
                                    Frontend Library
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3 shadow-md flex items-center justify-center">
                                    <img
                                        src="/images/inertia.png"
                                        alt="Inertia.js"
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <p className="font-medium text-gray-800">
                                    Inertia.js
                                </p>
                                <p className="text-sm text-gray-500 text-center mt-1">
                                    SPA Adapter
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3 shadow-md flex items-center justify-center">
                                    <img
                                        src="/images/tailwind.png"
                                        alt="Tailwind CSS"
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <p className="font-medium text-gray-800">
                                    Tailwind CSS
                                </p>
                                <p className="text-sm text-gray-500 text-center mt-1">
                                    Styling Framework
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm uppercase text-[#F37021] font-bold tracking-wider mb-3">
                            Tim Proyek
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Kolaborasi Mahasiswa & Profesional
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#003b75] to-[#00529C] mx-auto mb-8"></div>
                        <p className="max-w-3xl mx-auto text-gray-600">
                            Proyek BRI Report dikembangkan oleh tim mahasiswa
                            Universitas Airlangga yang berbakat di bawah
                            bimbingan profesional dari BRI.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Team UNAIR */}
                        <div className="bg-blue-50 rounded-xl p-8 relative overflow-hidden">
                            <div className="mb-6">
                                <img
                                    src="/images/unair-logo.png"
                                    alt="UNAIR"
                                    className="h-12 w-auto mb-4"
                                />
                                <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Tim Universitas Airlangga
                                </h4>
                                <p className="text-gray-700">
                                    Mahasiswa berbakat dari Fakultas Sains dan
                                    Teknologi Universitas Airlangga
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users
                                            size={20}
                                            className="text-[#003b75]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Mahasiswa Program Magang
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            M Bimo Bayu Bagaskara
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users
                                            size={20}
                                            className="text-[#003b75]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Mahasiswa Program Magang
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Naufal Zaki Riyadi
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users
                                            size={20}
                                            className="text-[#003b75]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Dosen Pembimbing
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Purbandini, S.Si., M.Kom.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team BRI */}
                        <div className="bg-orange-50 rounded-xl p-8 relative overflow-hidden">
                            <div className="mb-6">
                                <img
                                    src="/images/bri-logo.png"
                                    alt="BRI"
                                    className="h-12 w-auto mb-4"
                                />
                                <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Tim Bank BRI
                                </h4>
                                <p className="text-gray-700">
                                    Profesional berpengalaman dari divisi
                                    teknologi dan bisnis BRI
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Users
                                            size={20}
                                            className="text-[#F37021]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Pembimbing Lapangan
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Bu Yohana
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Users
                                            size={20}
                                            className="text-[#F37021]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Pengawas Proyek
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Universal Banker
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default AboutPage;
