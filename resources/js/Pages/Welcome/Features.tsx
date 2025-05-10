"use client";

import { useEffect, useState } from "react";
import {
    FileUp,
    FileSpreadsheet,
    BarChart3,
    Clock,
    Download,
    Layers,
    Database,
    Settings,
    Shield,
    Users,
    Zap,
    LineChart,
} from "lucide-react";

const Features = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const element = document.getElementById("features-section");
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, []);

    const features = [
        {
            icon: <FileUp className="h-7 w-7" />,
            title: "Upload Data CSV",
            description:
                "Upload data mentah dalam format CSV langsung melalui platform tanpa perlu pra-pemrosesan manual.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <Database className="h-7 w-7" />,
            title: "Proses Otomatis",
            description:
                "Sistem secara otomatis memproses, menghitung, dan menganalisis data sesuai kebutuhan format reporting BRI.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
        {
            icon: <Settings className="h-7 w-7" />,
            title: "Transformasi Format",
            description:
                "Mengubah struktur data mentah menjadi format yang terstandarisasi sesuai kebutuhan laporan.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <Layers className="h-7 w-7" />,
            title: "Penyimpanan Terpusat",
            description:
                "Semua data tersimpan dengan aman di database terpusat yang dapat diakses kapan saja oleh tim yang berwenang.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
        {
            icon: <BarChart3 className="h-7 w-7" />,
            title: "Visualisasi Data",
            description:
                "Lihat data dalam bentuk tabel dan grafik interaktif untuk analisis yang lebih mendalam dan cepat.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <Download className="h-7 w-7" />,
            title: "Export Fleksibel",
            description:
                "Export laporan dalam berbagai format seperti CSV, Excel, atau PDF sesuai kebutuhan tim dan manajemen.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
        {
            icon: <Clock className="h-7 w-7" />,
            title: "Efisiensi Waktu",
            description:
                "Hemat waktu hingga 90% dibandingkan proses manual untuk pembuatan dan analisis laporan.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <FileSpreadsheet className="h-7 w-7" />,
            title: "Template Siap Pakai",
            description:
                "Berbagai template laporan siap pakai sesuai standar BRI untuk memudahkan pembuatan report secara konsisten.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
        {
            icon: <Shield className="h-7 w-7" />,
            title: "Keamanan Data",
            description:
                "Perlindungan data dengan enkripsi end-to-end dan kontrol akses berbasis peran untuk keamanan maksimal.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <Users className="h-7 w-7" />,
            title: "Kolaborasi Tim",
            description:
                "Fitur kolaborasi yang memungkinkan beberapa pengguna bekerja pada laporan yang sama secara bersamaan.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
        {
            icon: <Zap className="h-7 w-7" />,
            title: "Performa Tinggi",
            description:
                "Dioptimalkan untuk kecepatan dan efisiensi bahkan saat memproses dataset yang besar dan kompleks.",
            color: "bg-blue-50",
            iconColor: "text-[#00529C]",
            borderColor: "border-blue-100",
        },
        {
            icon: <LineChart className="h-7 w-7" />,
            title: "Analisis Tren",
            description:
                "Fitur analisis tren untuk membantu mengidentifikasi pola dan membuat prediksi berdasarkan data historis.",
            color: "bg-orange-50",
            iconColor: "text-[#F37021]",
            borderColor: "border-orange-100",
        },
    ];

    return (
        <section
            id="features-section"
            className="bg-white py-24 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[#00529C]/5 blur-3xl"></div>
                    <div className="absolute bottom-20 left-0 w-96 h-96 rounded-full bg-[#F37021]/5 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-[#00529C]/10 text-[#00529C] px-4 py-1 rounded-full text-sm font-medium mb-4">
                            Fitur Unggulan
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Fitur Unggulan Platform
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Mengotomatisasi proses pengolahan report dari data
                            mentah CSV hingga laporan yang terstruktur dan mudah
                            dianalisis
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`transition-all duration-700 delay-${
                                    index * 100
                                } transform ${
                                    isVisible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-10 opacity-0"
                                }`}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <div
                                    className={`${
                                        feature.color
                                    } p-3 inline-block rounded-lg mb-5 transition-all duration-300 ${
                                        hoveredFeature === index
                                            ? "scale-110 shadow-md"
                                            : ""
                                    }`}
                                >
                                    <div className={`${feature.iconColor}`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Feature highlight */}
                    <div
                        className={`mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-1000 transform ${
                            isVisible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                        }`}
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center bg-[#00529C]/10 text-[#00529C] px-3 py-1 rounded-full text-sm font-medium mb-4">
                                    <Zap className="h-4 w-4 mr-1" />
                                    Fitur Unggulan
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Transformasi Data Otomatis
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Platform kami menggunakan algoritma canggih
                                    untuk secara otomatis mendeteksi dan
                                    mentransformasi data mentah menjadi format
                                    yang terstruktur, menghilangkan kebutuhan
                                    untuk pemrosesan manual yang memakan waktu.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">
                                            Deteksi otomatis struktur data CSV
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">
                                            Pemetaan kolom cerdas ke format
                                            laporan
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">
                                            Validasi data otomatis untuk
                                            mengurangi kesalahan
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-lg font-semibold text-gray-900">
                                            Transformasi Data
                                        </div>
                                        <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                                            Aktif
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-8 bg-gray-100 rounded-md w-full"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 bg-gray-100 rounded-md"></div>
                                            <div className="h-24 bg-gray-100 rounded-md"></div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 rounded-full bg-[#00529C]"></div>
                                            <div className="h-1 flex-grow bg-gradient-to-r from-[#00529C] to-[#F37021]"></div>
                                            <div className="h-6 w-6 rounded-full bg-[#F37021]"></div>
                                        </div>
                                        <div className="h-8 bg-gray-100 rounded-md w-3/4"></div>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -top-4 -left-4 bg-[#00529C]/10 w-16 h-16 rounded-full"></div>
                                <div className="absolute -bottom-4 -right-4 bg-[#F37021]/10 w-16 h-16 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
