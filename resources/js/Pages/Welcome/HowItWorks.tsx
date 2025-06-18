"use client";

import { useEffect, useState, useRef } from "react";
import {
    FileUp,
    BarChart3,
    Download,
    ArrowRight,
    RefreshCw,
    Database,
} from "lucide-react";

const HowItWorks = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const element = document.getElementById("how-it-works-section");
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, []);

    // Auto-advance steps
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isVisible]);

    const steps = [
        {
            icon: <FileUp className="h-8 w-8" />,
            title: "Upload Data CSV",
            description:
                "Unggah file CSV yang berisi data mentah yang ingin diproses. Sistem kami mendukung berbagai format data input.",
            color: "from-[#00529C] to-[#0063b8]",
        },
        {
            icon: <Database className="h-8 w-8" />,
            title: "Transformasi & Pemrosesan",
            description:
                "Data akan otomatis diproses, distruktur ulang, dan dihitung sesuai dengan format yang diperlukan untuk laporan BRI.",
            color: "from-[#F37021] to-[#ff8c47]",
        },
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: "Visualisasi & Analisis",
            description:
                "Lihat data dalam bentuk tabel dan grafik interaktif yang memudahkan analisis dan pengambilan keputusan.",
            color: "from-[#00529C] to-[#0063b8]",
        },
        {
            icon: <Download className="h-8 w-8" />,
            title: "Export & Distribusi",
            description:
                "Export laporan dalam format yang diinginkan (CSV, Excel, PDF) untuk keperluan distribusi atau dokumentasi.",
            color: "from-[#F37021] to-[#ff8c47]",
        },
    ];

    return (
        <section
            id="how-it-works-section"
            ref={sectionRef}
            className="py-24 bg-gradient-to-br from-white to-gray-50 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-block bg-[#00529C]/10 text-[#00529C] px-4 py-1 rounded-full text-sm font-medium mb-4">
                        Proses Sederhana
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Cara Kerja Platform
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Empat langkah sederhana untuk mengubah data mentah
                        menjadi laporan terstruktur yang siap digunakan
                    </p>
                </div>

                <div className="relative">
                    {/* Desktop view */}
                    <div className="hidden lg:block">
                        {/* Timeline connector */}
                        <div className="absolute left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-[#00529C] to-[#F37021] transform -translate-x-1/2 rounded-full"></div>

                        {/* Steps */}
                        <div className="relative">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`relative mb-24 last:mb-0 transition-all duration-1000 delay-${
                                        index * 200
                                    } transform ${
                                        isVisible
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-10 opacity-0"
                                    }`}
                                >
                                    <div
                                        className={`flex items-center ${
                                            index % 2 === 0
                                                ? ""
                                                : "flex-row-reverse"
                                        }`}
                                    >
                                        {/* Content */}
                                        <div
                                            className={`w-5/12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 ${
                                                activeStep === index
                                                    ? "scale-105 shadow-xl border-[#00529C]/20"
                                                    : ""
                                            } ${
                                                index % 2 === 0
                                                    ? "text-right pr-12"
                                                    : "text-left pl-12"
                                            }`}
                                        >
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${
                                                step.color
                                            } text-white shadow-lg z-10 transition-all duration-500 ${
                                                activeStep === index
                                                    ? "scale-110 shadow-xl"
                                                    : ""
                                            }`}
                                        >
                                            {step.icon}
                                        </div>

                                        {/* Second half - empty for layout */}
                                        <div className="w-5/12"></div>
                                    </div>

                                    {/* Arrow connector (only show between steps, not after the last one) */}
                                    {index < steps.length - 1 && (
                                        <div className="flex justify-center my-4">
                                            <ArrowRight
                                                className={`h-6 w-6 text-[#F37021] transform ${
                                                    index % 2 === 0
                                                        ? "rotate-90"
                                                        : "-rotate-90"
                                                }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile view - vertical timeline */}
                    <div className="lg:hidden">
                        {/* Timeline connector */}
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00529C] to-[#F37021] transform -translate-x-1/2"></div>

                        {/* Steps */}
                        <div className="relative pl-16">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`relative mb-16 last:mb-0 transition-all duration-1000 delay-${
                                        index * 200
                                    } transform ${
                                        isVisible
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-10 opacity-0"
                                    }`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`absolute left-0 transform -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${
                                            step.color
                                        } text-white shadow-lg z-10 transition-all duration-500 ${
                                            activeStep === index
                                                ? "scale-110 shadow-xl"
                                                : ""
                                        }`}
                                    >
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <div
                                        className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-500 ${
                                            activeStep === index
                                                ? "shadow-xl border-[#00529C]/20"
                                                : ""
                                        }`}
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Arrow connector (only show between steps, not after the last one) */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-0 transform -translate-x-1/2 mt-8">
                                            <ArrowRight className="h-6 w-6 text-[#F37021] transform rotate-90" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center mt-12 space-x-2">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveStep(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                activeStep === index
                                    ? "bg-[#F37021] w-8"
                                    : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to step ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Call to action */}
                <div
                    className={`mt-16 text-center transition-all duration-1000 delay-1000 ${
                        isVisible ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="inline-block p-1 bg-gradient-to-r from-[#00529C] to-[#F37021] rounded-lg">
                        <a
                            href={route("login")}
                            className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Mulai Gunakan Platform
                            <ArrowRight className="ml-2 h-5 w-5 text-[#F37021]" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
