"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import axios from "axios";
import {
    CheckCircle2,
    Loader2,
    XCircle,
    ArrowUp,
    ArrowDown,
    Minus,
    FileCheck2,
    CalendarIcon,
    ChevronLeft,
    RefreshCw,
    AlertCircle,
    FileX,
    AlertTriangle,
    FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { ScrollArea } from "@/Components/ui/scroll-area";
import type { PageProps } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PreviewRow {
    account_number: string;
    available_balance?: number;
    previous_available_balance?: number;
    balance_change?: number;
    current_balance?: number;
    previous_balance?: number;
    change_percent: number;
    cif?: string;
    client_name?: string;
    db_account_id?: string;
    db_client_id?: string;
    db_universal_banker_id?: string;
    universal_banker_name?: string;
}
interface PreviewSummary {
    total_rows_in_excel?: number;
    valid_rows?: number;
    skipped_rows?: number;
}
interface PreviewData {
    report_date?: string;
    errors?: { row_number: number; errors: string[] }[];
    valid_rows?: PreviewRow[];
    summary?: PreviewSummary;
}
interface PreviewPageProps extends PageProps {
    batchId: string;
}

// --- Helper Component untuk Menampilkan Perubahan Saldo ---
const BalanceChange = ({
    before,
    after,
    showArrow = true,
}: {
    before: number;
    after: number;
    showArrow?: boolean;
}) => {
    const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const difference = after - before;
    let Icon = Minus;
    let colorClass = "text-gray-600";

    if (difference > 0) {
        Icon = ArrowUp;
        colorClass = "text-emerald-600";
    } else if (difference < 0) {
        Icon = ArrowDown;
        colorClass = "text-red-600";
    }

    const formattedBefore = formatter.format(before);
    const formattedAfter = formatter.format(after);
    const formattedDifference = formatter.format(Math.abs(difference));

    return (
        <div className="space-y-1">
            <div
                className={`flex items-center justify-end gap-1.5 font-semibold ${colorClass}`}
            >
                {showArrow && <Icon className="h-4 w-4" />}
                <span>{formattedAfter}</span>
            </div>
            {before !== after && (
                <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                    <span className="line-through">{formattedBefore}</span>
                    <span className={colorClass}>
                        ({difference > 0 ? "+" : "-"}
                        {formattedDifference})
                    </span>
                </div>
            )}
        </div>
    );
};

// --- Komponen Utama ---
const ImportPreviewPage: React.FC<PreviewPageProps> = ({ batchId }) => {
    const [status, setStatus] = useState<"processing" | "completed" | "failed">(
        "processing"
    );
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [saveProcessing, setSaveProcessing] = useState(false);

    useEffect(() => {
        // Logika polling untuk mendapatkan status
        const intervalId = setInterval(() => {
            axios
                .get(route("dashboard.import.status", { batch_id: batchId }))
                .then((res) => {
                    if (
                        res.data.status === "completed" ||
                        res.data.status === "failed"
                    ) {
                        clearInterval(intervalId);
                        setStatus(res.data.status);
                        if (res.data.status === "completed")
                            setPreviewData(res.data.data);
                        if (res.data.status === "failed")
                            setErrorMessage(res.data.message);
                    }
                })
                .catch((err) => {
                    clearInterval(intervalId);
                    setStatus("failed");
                    setErrorMessage("Gagal terhubung ke server.");
                });
        }, 3000);
        return () => clearInterval(intervalId);
    }, [batchId]);

    // Fungsi konfirmasi import
    const handleConfirmImport = () => {
        if (!previewData || !previewData.valid_rows || !batchId) {
            alert("Data preview tidak ditemukan atau tidak valid.");
            return;
        }

        const payload = {
            dataToSave: JSON.stringify(previewData.valid_rows),
            reportDate: previewData.report_date,
            batchId: batchId,
        };

        router.post(route("dashboard.import.save"), payload, {
            onStart: () => {
                setSaveProcessing(true);
            },
        });
    };

    // --- Render Functions ---
    const renderProcessing = () => (
        <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100/70 rounded-full">
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800">
                            Memproses Data
                        </h3>
                        <p className="text-blue-600 text-sm">
                            Mohon tunggu sebentar...
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="flex flex-col items-center py-16">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full border-8 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                </div>

                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Data Sedang Diproses
                    </h2>
                    <p className="text-gray-600 max-w-md">
                        Sistem sedang memvalidasi data Anda. Data yang valid
                        akan segera ditampilkan untuk diverifikasi.
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const renderFailed = () => (
        <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100/70 rounded-full">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-800">
                            Import Gagal
                        </h3>
                        <p className="text-red-600 text-sm">
                            Terjadi kesalahan saat memproses data
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="flex flex-col items-center py-16">
                <div className="p-5 bg-red-50 rounded-full">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>

                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        Proses Import Gagal
                    </h2>
                    <p className="text-red-600 max-w-md mb-6">
                        {errorMessage ||
                            "Terjadi kesalahan saat memproses file Anda."}
                    </p>

                    <Link href={route("dashboard.import")}>
                        <Button className="bg-red-600 hover:bg-red-700 shadow-md">
                            Upload File Kembali
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    const renderCompleted = () => {
        if (!previewData) return renderFailed();

        const {
            valid_rows = [],
            errors = [],
            summary,
            report_date,
        } = previewData;

        if (valid_rows.length === 0 && errors.length === 0) {
            return (
                <Card className="shadow-xl border-0 overflow-hidden animate-fadeIn">
                    <CardContent className="flex flex-col items-center py-16">
                        <FileX className="h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Tidak Ada Data Ditemukan
                        </h2>
                        <p className="text-gray-600 max-w-sm text-center">
                            File yang Anda unggah tidak berisi data yang dapat
                            diproses. Silakan periksa kembali file Anda dan coba
                            lagi.
                        </p>
                        <Link href={route("dashboard.import")} className="mt-6">
                            <Button className="bg-[#00529C] hover:bg-[#004A8C]">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Kembali ke Halaman Import
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn">
                {/* Kartu Header Utama */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <FileCheck2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Proses Import Selesai
                                    </h2>
                                    <p className="text-white/80 mt-1">
                                        Data telah divalidasi dan siap untuk
                                        dikonfirmasi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Button
                                    onClick={handleConfirmImport}
                                    disabled={
                                        saveProcessing ||
                                        valid_rows.length === 0
                                    }
                                    className="bg-white text-green-700 font-bold hover:bg-green-50 px-6 py-3 h-auto text-base shadow-lg transition-transform hover:scale-105"
                                >
                                    {saveProcessing ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                    )}
                                    Konfirmasi & Simpan
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Kartu Statistik Ringkasan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-md border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Baris File
                            </CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">
                                {summary?.total_rows_in_excel || 0}
                            </div>
                            <p className="text-xs text-gray-500">
                                Total baris yang terdeteksi di file.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">
                                Data Valid
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {valid_rows.length || 0}
                            </div>
                            <p className="text-xs text-gray-500">
                                Data yang siap untuk diimpor.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">
                                Data Invalid/Dilewati
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {summary?.skipped_rows || 0}
                            </div>
                            <p className="text-xs text-gray-500">
                                Data yang tidak akan diimpor karena error.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600">
                                Tanggal Laporan
                            </CardTitle>
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {format(
                                    new Date(report_date || new Date()),
                                    "dd MMM",
                                    { locale: id }
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {format(
                                    new Date(report_date || new Date()),
                                    "yyyy",
                                    { locale: id }
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bagian Detail Data Valid */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <CardHeader>
                        <CardTitle>
                            Detail Data Valid yang Akan Diimpor
                        </CardTitle>
                        <CardDescription>
                            Berikut adalah {valid_rows.length} baris yang akan
                            diperbarui di database setelah Anda konfirmasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] border rounded-lg">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-14 text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Nasabah & Akun</TableHead>
                                        <TableHead>Universal Banker</TableHead>
                                        <TableHead className="text-right">
                                            Saldo Saat Ini
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Saldo Tersedia
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {valid_rows.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-green-50/40"
                                        >
                                            <TableCell className="text-center font-medium text-gray-500">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-800">
                                                    {row.client_name || "N/A"}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {row.account_number ||
                                                        "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {row.universal_banker_name ||
                                                    "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <BalanceChange
                                                    before={Number(
                                                        row.previous_balance ||
                                                            0
                                                    )}
                                                    after={Number(
                                                        row.current_balance || 0
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <BalanceChange
                                                    before={Number(
                                                        row.previous_available_balance ||
                                                            0
                                                    )}
                                                    after={Number(
                                                        row.available_balance ||
                                                            0
                                                    )}
                                                    showArrow={false}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Bagian untuk Error jika ada */}
                {errors && errors.length > 0 && (
                    <Card className="shadow-lg border-l-4 border-l-amber-500">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <CardTitle className="text-amber-800">
                                    Detail Baris yang Dilewati
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {errors.length} baris berikut tidak akan diimpor
                                karena ada kesalahan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px] border rounded-lg p-2">
                                {errors.map((error, idx) => (
                                    <div
                                        key={idx}
                                        className="mb-2 p-3 bg-amber-50/60 rounded-md text-sm"
                                    >
                                        <p className="font-semibold text-amber-900">
                                            Baris #{error.row_number}:{" "}
                                            <span className="font-normal">
                                                {Array.isArray(error.errors)
                                                    ? error.errors.join(", ")
                                                    : JSON.stringify(
                                                          error.errors
                                                      )}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {/* Footer Aksi */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button
                        onClick={handleConfirmImport}
                        disabled={saveProcessing || valid_rows.length === 0}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {saveProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                <span>
                                    Konfirmasi & Simpan {valid_rows.length} Data
                                </span>
                            </>
                        )}
                    </Button>
                    <Link
                        href={route("dashboard.import")}
                        className="w-full sm:w-auto"
                    >
                        <Button variant="outline" className="w-full">
                            <XCircle className="mr-2 h-4 w-4" /> Batalkan &
                            Upload Ulang
                        </Button>
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Preview Import | BRI Report" />

            {/* Header section with background gradient */}
            <div className="space-y-6 mb-8">
                <Breadcrumb
                    items={[
                        {
                            label: "Import Data",
                            href: route("dashboard.import"),
                        },
                        { label: "Preview Import" },
                    ]}
                />
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                    {/* Dekorasi background */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-400/10 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm">
                                <FileCheck2 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Preview Data Import
                            </h1>
                            {/* Status badge yang lebih menonjol di dalam header */}
                            {status !== "processing" && (
                                <div className="ml-3">
                                    {status === "completed" && (
                                        <Badge className="bg-emerald-400/20 text-emerald-50 border-emerald-400/30 backdrop-blur-sm px-3 py-1.5">
                                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                            Siap Import
                                        </Badge>
                                    )}
                                    {status === "failed" && (
                                        <Badge className="bg-red-400/20 text-red-50 border-red-400/30 backdrop-blur-sm px-3 py-1.5">
                                            <XCircle className="h-4 w-4 mr-1.5" />
                                            Gagal
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 mt-1.5">
                            <p className="text-blue-50 text-lg">
                                Review dan konfirmasi perubahan saldo sebelum
                                diimpor ke database.
                            </p>
                            {previewData?.report_date && (
                                <div className="flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-50 text-sm">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Tanggal:{" "}
                                    {format(
                                        new Date(previewData.report_date),
                                        "dd MMMM yyyy",
                                        { locale: id }
                                    )}
                                </div>
                            )}
                            {status === "processing" && (
                                <Badge className="bg-blue-400/20 text-blue-50 border-blue-400/30 backdrop-blur-sm px-3 py-1.5 animate-pulse w-fit">
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    Memproses...
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {status === "processing" && renderProcessing()}
                {status === "failed" && renderFailed()}
                {status === "completed" && renderCompleted()}
            </div>
        </AuthenticatedLayout>
    );
};

export default ImportPreviewPage;
