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
} from "lucide-react";
import { Card, CardContent } from "@/Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import axios from "axios";

interface ExportResult {
    status: "processing" | "completed" | "failed" | "not_found";
    message: string;
    file_path?: string;
    file_name?: string;
}

interface ResultPageProps extends PageProps {
    resultId: string;
}

const ProcessingState = ({ message }: { message: string }) => (
    <div className="text-center animate-fadeIn">
        <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full border-8 border-t-blue-600 border-r-blue-100 border-b-blue-100 border-l-blue-100 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Download className="h-10 w-10 text-blue-500" />
            </div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Membuat Laporan Anda...
        </h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
            Proses ini berjalan di background, Anda bisa menunggu dengan aman.
        </p>
    </div>
);

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
            <div className="bg-white border border-green-200 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
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

const FailedState = ({ result }: { result: ExportResult }) => (
    <div className="text-center animate-fadeIn">
        <div className="p-4 rounded-full bg-red-100 inline-block mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Export Gagal</h2>
        <Alert variant="destructive" className="mt-4 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pesan Error:</AlertTitle>
            <AlertDescription>
                {result.message || "Terjadi kesalahan yang tidak diketahui."}
            </AlertDescription>
        </Alert>
        <div className="mt-8">
            <Link href={route("dashboard.export")}>
                <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                </Button>
            </Link>
        </div>
    </div>
);

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
