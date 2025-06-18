"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    FileUp,
    Download,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    Clock,
    FileSpreadsheet,
    InfoIcon,
    Loader2,
    RotateCcw,
    ChevronDown,
    Frown,
} from "lucide-react";
import { Card, CardContent } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import axios from "axios";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";

interface ExportResult {
    status: "processing" | "completed" | "failed" | "not_found";
    message: string;
    file_path?: string;
    file_name?: string;
}

interface ResultPageProps extends PageProps {
    resultId: string;
}

const ProcessingState = ({ message }: { message: string }) => {
    const [dots, setDots] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev >= 3 ? 1 : prev + 1));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="animate-fadeIn bg-white border border-blue-100 rounded-xl p-8 shadow-lg max-w-7xl mx-auto">
            <div className="flex flex-col items-center">
                <div className="relative mb-8">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl"></div>

                    {/* Progress spinner container */}
                    <div className="relative">
                        {/* Main spinner */}
                        <div className="w-28 h-28 rounded-full border-[6px] border-t-blue-600 border-r-blue-200 border-b-blue-200 border-l-blue-200 animate-spin"></div>

                        {/* Inner colored circle */}
                        <div className="absolute inset-[15%] bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center">
                            <Download className="h-10 w-10 text-blue-600 animate-pulse" />
                        </div>

                        {/* Small dots around spinner to show activity */}
                        <div className="absolute top-0 right-2 h-3 w-3 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Membuat Laporan Excel Anda{".".repeat(dots)}
                </h2>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5 w-full">
                    <p className="text-blue-700 flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {message}
                    </p>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                    <div className="bg-blue-600 h-full animate-progressBar"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <FileSpreadsheet className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Format File</p>
                            <p className="font-medium">
                                Microsoft Excel (.xlsx)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <Clock className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Estimasi Waktu
                            </p>
                            <p className="font-medium">1-3 menit</p>
                        </div>
                    </div>
                </div>

                <div className="text-center bg-amber-50 p-4 rounded-lg border border-amber-100 w-full">
                    <div className="flex items-center justify-center mb-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        <p className="font-medium text-amber-700">
                            Mohon Tunggu
                        </p>
                    </div>
                    <p className="text-sm text-amber-600">
                        Proses ini berjalan di background. Halaman akan
                        diperbarui otomatis saat laporan siap diunduh. Mohon
                        jangan tutup halaman ini.
                    </p>
                </div>
            </div>
        </div>
    );
};

const CompletedState = ({
    result,
    resultId,
}: {
    result: ExportResult;
    resultId: string;
}) => {
    const currentDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="animate-fadeIn">
            <div className="bg-white border border-green-200 rounded-xl p-8 shadow-lg max-w-7xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full blur-md"></div>
                        <div className="relative p-5 rounded-full bg-green-50 border-2 border-green-200">
                            <CheckCircle2
                                className="h-14 w-14 text-green-600"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>
                </div>

                <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
                    Laporan Berhasil Dibuat!
                </h2>

                <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
                    <p className="text-green-700 text-lg">{result.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Nama File</p>
                        <p className="font-medium text-gray-800 flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                            {result.file_name || "report.xlsx"}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Waktu Pembuatan</p>
                        <p className="font-medium text-gray-800 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-green-600" />
                            {currentDate}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <a
                        href={route("dashboard.export.download", {
                            result_id: resultId,
                        })}
                    >
                        <Button className="bg-green-600 hover:bg-green-700 w-full text-base h-auto py-4 px-6 gap-3 font-medium shadow-md hover:shadow-lg transition-all duration-200 group">
                            <Download className="h-5 w-5 mr-2" />
                            Unduh Laporan
                        </Button>
                    </a>

                    <div className="grid grid-cols-2 gap-3">
                        <Link href={route("dashboard.export")}>
                            <Button
                                variant="outline"
                                className="w-full border-gray-300"
                            >
                                <FileUp className="h-4 w-4 mr-2" />
                                Buat Laporan Baru
                            </Button>
                        </Link>
                        <Link href={route("dashboard.index")}>
                            <Button
                                variant="outline"
                                className="w-full border-gray-300"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Laporan ini tersedia untuk diunduh selama 24 jam.</p>
                <p className="mt-1">
                    <InfoIcon className="h-3.5 w-3.5 inline-block mr-1" />
                    Memuat data kinerja Universal Banker untuk periode yang
                    dipilih.
                </p>
            </div>
        </div>
    );
};

const FailedState = ({ result }: { result: ExportResult }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <div className="bg-white border border-red-200 rounded-xl p-8 shadow-lg mb-4">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-6">
                        {/* Error icon with glow effect */}
                        <div className="absolute inset-0 bg-red-100/70 rounded-full blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-full border-2 border-red-200">
                            <XCircle
                                className="h-14 w-14 text-red-600"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Export Laporan Gagal
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Mohon maaf, terjadi kesalahan saat membuat laporan Excel
                        Anda.
                    </p>

                    <Alert
                        variant="destructive"
                        className="text-left mb-4 w-full"
                    >
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <div>
                                <AlertTitle className="font-semibold mb-1">
                                    Pesan Error:
                                </AlertTitle>
                                <AlertDescription className="text-sm">
                                    {result.message ||
                                        "Terjadi kesalahan yang tidak diketahui."}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>

                    <Collapsible
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        className="w-full border rounded-lg overflow-hidden"
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex w-full justify-between border-0 rounded-none"
                            >
                                <span className="flex items-center">
                                    <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                                    Informasi Detail Error
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                        isOpen ? "transform rotate-180" : ""
                                    }`}
                                />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="bg-gray-50 p-3 text-sm">
                            <div className="text-left">
                                <p className="font-medium text-gray-700 mb-1">
                                    Kemungkinan Penyebab:
                                </p>
                                <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
                                    <li>
                                        Data input tidak lengkap atau tidak
                                        valid
                                    </li>
                                    <li>Masalah koneksi dengan database</li>
                                    <li>
                                        Server sedang sibuk melayani permintaan
                                        lain
                                    </li>
                                    <li>
                                        File tidak dapat ditulis ke penyimpanan
                                    </li>
                                </ul>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-center gap-3">
                    <Link href={route("dashboard.export")} className="w-full">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 py-2.5">
                            <RotateCcw className="h-4 w-4" />
                            Coba Kembali
                        </Button>
                    </Link>
                    <Link href={route("dashboard.index")} className="w-full">
                        <Button
                            variant="outline"
                            className="w-full border-gray-300 gap-2 py-2.5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="text-center">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                    <Frown className="h-4 w-4" />
                    <span>Butuh bantuan? Silakan hubungi tim IT Support</span>
                </div>
            </div>
        </div>
    );
};

const ExportResultPage: React.FC<ResultPageProps> = ({ resultId }) => {
    const [status, setStatus] = useState<
        "processing" | "completed" | "failed" | "unknown"
    >("processing");
    const [result, setResult] = useState<ExportResult | null>(null);

    useEffect(() => {
        if (!resultId) {
            setStatus("failed");
            setResult({
                status: "failed",
                message: "ID Proses tidak valid atau tidak ditemukan.",
            });
            return;
        }

        const checkStatus = () => {
            axios
                .get(route("dashboard.export.status", { result_id: resultId }))
                .then((res) => {
                    const data: ExportResult = res.data;
                    if (
                        data &&
                        (data.status === "completed" ||
                            data.status === "failed")
                    ) {
                        setStatus(data.status);
                        setResult(data);
                        clearInterval(intervalId);
                    } else if (data && data.status === "processing") {
                        setResult(data);
                    } else {
                        setStatus("failed");
                        setResult({
                            status: "failed",
                            message:
                                "Sesi export tidak ditemukan atau telah kedaluwarsa.",
                        });
                        clearInterval(intervalId);
                    }
                })
                .catch(() => {
                    setStatus("failed");
                    setResult({
                        status: "failed",
                        message:
                            "Gagal menghubungi server untuk mendapatkan status.",
                    });
                    clearInterval(intervalId);
                });
        };
        checkStatus();
        const intervalId = setInterval(checkStatus, 3000);
        return () => clearInterval(intervalId);
    }, [resultId]);

    const renderContent = () => {
        switch (status) {
            case "completed":
                return <CompletedState result={result!} resultId={resultId} />;
            case "failed":
                return <FailedState result={result!} />;
            case "processing":
            default:
                return (
                    <ProcessingState
                        message={
                            result?.message || "Menginisialisasi proses..."
                        }
                    />
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Hasil Export Laporan" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
                        <CardContent className="py-12 px-6 w-full">
                            {renderContent()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ExportResultPage;
