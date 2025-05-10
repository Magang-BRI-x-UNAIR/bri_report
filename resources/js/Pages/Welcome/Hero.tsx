"use client";

import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    BarChart2,
    Clock,
    FileSpreadsheet,
    ChevronDown,
} from "lucide-react";

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        setIsVisible(true);

        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#003b75] via-[#00529C] to-[#0063b8] text-white">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-xl"></div>
                    <div className="absolute top-60 right-20 w-60 h-60 rounded-full bg-[#F37021]/20 blur-xl"></div>
                    <div className="absolute bottom-40 left-1/3 w-80 h-80 rounded-full bg-blue-400/20 blur-xl"></div>
                </div>
                <div className="absolute top-0 right-0 opacity-20">
                    <svg
                        width="400"
                        height="400"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="75" cy="25" r="20" fill="currentColor" />
                        <circle cx="25" cy="75" r="20" fill="currentColor" />
                        <circle cx="75" cy="75" r="20" fill="currentColor" />
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left column - Text content */}
                    <div
                        className={`text-left transition-all duration-1000 transform ${
                            isVisible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                        }`}
                    >
                        <div className="inline-block bg-[#F37021]/20 text-[#F37021] px-4 py-1 rounded-full text-sm font-medium mb-6 border border-[#F37021]/30">
                            Platform Laporan Terintegrasi
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Modernisasi Pengelolaan{" "}
                            <span className="text-[#F37021] relative">
                                Report BRI
                                <svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    height="6"
                                    viewBox="0 0 200 6"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 5C1 5 46 1 99.5 1C153 1 199 5 199 5"
                                        stroke="#F37021"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
                            Transformasi proses manual menjadi sistem otomatis.
                            Upload data, proses secara instan, dan dapatkan
                            report dalam format yang Anda butuhkan.
                        </p>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
                            <Link
                                href="/dashboard"
                                className="group bg-gradient-to-r from-[#F37021] to-[#ff8c47] text-white hover:from-[#e05f10] hover:to-[#ff7c30] font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-300 text-center flex items-center justify-center"
                            >
                                Mulai Sekarang
                                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/learn-more"
                                className="border-2 border-white text-white hover:bg-white hover:text-[#00529C] font-semibold px-8 py-4 rounded-lg transition-all duration-300 text-center"
                            >
                                Pelajari Lebih Lanjut
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-6 mt-8">
                            <div className="flex items-center text-blue-100">
                                <Clock className="h-5 w-5 mr-2 text-[#F37021]" />
                                <span>Hemat Waktu</span>
                            </div>
                            <div className="flex items-center text-blue-100">
                                <FileSpreadsheet className="h-5 w-5 mr-2 text-[#F37021]" />
                                <span>Format Fleksibel</span>
                            </div>
                            <div className="flex items-center text-blue-100">
                                <BarChart2 className="h-5 w-5 mr-2 text-[#F37021]" />
                                <span>Analisis Mendalam</span>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Image/Illustration */}
                    <div
                        className={`relative transition-all duration-1000 delay-300 transform ${
                            isVisible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                        }`}
                    >
                        <div className="relative">
                            {/* Background shape */}
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#F37021]/10 rounded-full blur-md"></div>

                            {/* Dashboard mockup */}
                            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                                <div className="bg-gray-100 h-8 flex items-center px-4 border-b border-gray-200">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
                                            <div className="h-4 w-48 bg-gray-100 rounded-md mt-2"></div>
                                        </div>
                                        <div className="h-8 w-24 bg-[#00529C] rounded-md"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <div className="h-8 w-8 bg-blue-500/20 rounded-md mb-2 flex items-center justify-center">
                                                <div className="h-4 w-4 bg-blue-500 rounded-sm"></div>
                                            </div>
                                            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                                            <div className="h-6 w-1/2 bg-gray-300 rounded-md mt-2"></div>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                            <div className="h-8 w-8 bg-orange-500/20 rounded-md mb-2 flex items-center justify-center">
                                                <div className="h-4 w-4 bg-orange-500 rounded-sm"></div>
                                            </div>
                                            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                                            <div className="h-6 w-1/2 bg-gray-300 rounded-md mt-2"></div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                            <div className="h-8 w-8 bg-green-500/20 rounded-md mb-2 flex items-center justify-center">
                                                <div className="h-4 w-4 bg-green-500 rounded-sm"></div>
                                            </div>
                                            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                                            <div className="h-6 w-1/2 bg-gray-300 rounded-md mt-2"></div>
                                        </div>
                                    </div>
                                    <div className="h-40 bg-gray-100 rounded-lg border border-gray-200 p-3">
                                        <div className="flex justify-between mb-2">
                                            <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                            <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="flex items-end h-24 pt-4">
                                            <div className="w-1/12 h-1/3 bg-blue-200 rounded-t"></div>
                                            <div className="w-1/12 h-1/2 bg-blue-300 rounded-t mx-1"></div>
                                            <div className="w-1/12 h-2/3 bg-blue-400 rounded-t"></div>
                                            <div className="w-1/12 h-1/4 bg-blue-200 rounded-t mx-1"></div>
                                            <div className="w-1/12 h-3/4 bg-blue-500 rounded-t"></div>
                                            <div className="w-1/12 h-1/3 bg-blue-300 rounded-t mx-1"></div>
                                            <div className="w-1/12 h-5/6 bg-blue-600 rounded-t"></div>
                                            <div className="w-1/12 h-1/2 bg-blue-400 rounded-t mx-1"></div>
                                            <div className="w-1/12 h-1/4 bg-blue-200 rounded-t"></div>
                                            <div className="w-1/12 h-2/3 bg-blue-400 rounded-t mx-1"></div>
                                            <div className="w-1/12 h-1/3 bg-blue-300 rounded-t"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-6 -left-6 bg-white p-3 rounded-lg shadow-lg transform rotate-6 border-2 border-[#F37021]/20">
                                <FileSpreadsheet className="h-6 w-6 text-[#F37021]" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg transform -rotate-6 border-2 border-[#00529C]/20">
                                <BarChart2 className="h-6 w-6 text-[#00529C]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="relative z-10 bg-white/10 backdrop-blur-sm border-t border-white/20 py-6 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="p-4">
                            <div className="text-3xl font-bold mb-1">98%</div>
                            <div className="text-blue-100">
                                Peningkatan Efisiensi
                            </div>
                        </div>
                        <div className="p-4 border-y md:border-y-0 md:border-x border-white/20">
                            <div className="text-3xl font-bold mb-1">15x</div>
                            <div className="text-blue-100">Lebih Cepat</div>
                        </div>
                        <div className="p-4">
                            <div className="text-3xl font-bold mb-1">24/7</div>
                            <div className="text-blue-100">
                                Akses Kapan Saja
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div
                className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
                    scrolled ? "opacity-0" : "opacity-100"
                }`}
            >
                <div className="flex flex-col items-center text-white/70">
                    <span className="text-sm mb-2">
                        Scroll untuk melihat lebih
                    </span>
                    <ChevronDown className="h-5 w-5 animate-bounce" />
                </div>
            </div>

            {/* Wave divider */}
            <div className="relative z-10">
                <svg
                    className="w-full h-16 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="currentColor"
                        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default Hero;
