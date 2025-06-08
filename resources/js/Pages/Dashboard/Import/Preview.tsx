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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
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

// --- Tipe Data ---
interface PreviewRow {
    [key: string]: any;
}
interface PreviewSummary {
    total_rows_in_excel?: number;
}
interface PreviewData {
    report_date?: string;
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
        if (!previewData || !previewData.valid_rows) return;

        router.post(
            route("dashboard.save"),
            {
                dataToSave: previewData.valid_rows,
                reportDate: previewData.report_date,
            },
            {
                onStart: () => setSaveProcessing(true),
                onFinish: () => setSaveProcessing(false),
                onSuccess: () => {
                    // Use SweetAlert or other notification library instead of alert
                    router.visit(route("dashboard.import"), {
                        only: ["flash"],
                        data: { success: true },
                        preserveState: true,
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors)[0];
                    setErrorMessage(`Gagal menyimpan data: ${errorMessage}`);
                },
            }
        );
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
        const { valid_rows = [], summary, report_date } = previewData;

        return (
            <div className="space-y-6">
                {/* Header Info */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 p-6">
                        <div className="absolute -top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FileCheck2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Preview Data Siap Import
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <CalendarIcon className="h-4 w-4 text-white/80" />
                                        <span className="text-white/90">
                                            Tanggal Laporan:{" "}
                                            {format(
                                                new Date(
                                                    report_date || new Date()
                                                ),
                                                "dd MMMM yyyy",
                                                { locale: id }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Badge className="mt-4 md:mt-0 bg-white/20 text-white border-white/30 px-3 py-2 text-sm backdrop-blur-sm">
                                {valid_rows.length || 0} Data Siap Import
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* Data Table */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <ScrollArea className="h-[500px]">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="w-14 text-center bg-gray-100/80 font-semibold text-gray-700">
                                        No
                                    </TableHead>
                                    <TableHead className="bg-gray-100/80 font-semibold text-gray-700">
                                        CIF
                                    </TableHead>
                                    <TableHead className="bg-gray-100/80 font-semibold text-gray-700">
                                        Nama Nasabah
                                    </TableHead>
                                    <TableHead className="bg-gray-100/80 font-semibold text-gray-700">
                                        No. Rekening
                                    </TableHead>
                                    <TableHead className="text-right bg-gray-100/80 font-semibold text-gray-700 whitespace-nowrap">
                                        Saldo Baru
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {valid_rows.map((row, index) => {
                                    const hasBalanceChange =
                                        Number(row.previous_balance) !==
                                        Number(row.current_balance);

                                    return (
                                        <TableRow
                                            key={index}
                                            className={`
                                                border-b border-gray-100 hover:bg-blue-50/30
                                                ${
                                                    hasBalanceChange
                                                        ? "bg-green-50/30"
                                                        : ""
                                                }
                                                ${
                                                    index % 2 !== 0
                                                        ? "bg-gray-50/50"
                                                        : ""
                                                }
                                            `}
                                        >
                                            <TableCell className="font-medium text-center">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-sm">
                                                    {row.client_cif || row.cif}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {row.client_name}
                                                </div>
                                                {row.universal_banker_name && (
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Universal Banker:{" "}
                                                        {
                                                            row.universal_banker_name
                                                        }
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-sm">
                                                    {row.account_number}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <BalanceChange
                                                    before={Number(
                                                        row.previous_balance ||
                                                            row.db_previous_balance ||
                                                            0
                                                    )}
                                                    after={Number(
                                                        row.current_balance ||
                                                            row.editable_current_balance ||
                                                            0
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {valid_rows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <FileX className="h-10 w-10 text-gray-400 mb-2" />
                                                <p className="text-gray-500">
                                                    Tidak ada data valid yang
                                                    dapat diimport
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Card>

                {/* Footer Action Buttons */}
                <Card className="border-0 shadow-md bg-gray-50 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                            <Link href={route("dashboard.import")}>
                                <Button
                                    variant="outline"
                                    disabled={saveProcessing}
                                    className="w-full sm:w-auto border-gray-300"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Kembali & Upload Ulang
                                </Button>
                            </Link>

                            <Button
                                onClick={handleConfirmImport}
                                disabled={
                                    saveProcessing || valid_rows.length === 0
                                }
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-6 min-w-[180px] w-full sm:w-auto shadow-md"
                            >
                                {saveProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        <span className="text-base">
                                            Menyimpan...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        <span className="text-base">
                                            Konfirmasi & Import Data
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {valid_rows.length > 0 && (
                            <div className="text-center text-sm text-gray-500 mt-4">
                                Data yang telah diverifikasi akan disimpan ke
                                database dan mengupdate saldo
                            </div>
                        )}
                    </CardContent>
                </Card>
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
                        { label: "Dashboard", href: route("dashboard.index") },
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
