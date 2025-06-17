"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
    AlertCircle,
    CalendarIcon,
    ChevronLeft,
    FileSpreadsheet,
    UploadCloud,
    Users,
    FileUp,
    Eye,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import { cn, formatFileSize } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import type { PageProps } from "@/types";
interface DashboardImportPageProps extends PageProps {
    flash?: {
        error?: string;
    };
}

const DashboardImport = () => {
    const { flash } = usePage<DashboardImportPageProps>().props;
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(
        null
    );

    const [fileSize, setFileSize] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            file: null as File | null,
            report_date: new Date(),
        });

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            // Validasi tipe file sisi klien bisa dipertahankan
            const allowedExtensions = [".xlsx", ".xls", ".csv"];
            const fileExtension = selectedFile.name.slice(
                ((selectedFile.name.lastIndexOf(".") - 1) >>> 0) + 2
            );

            if (
                !allowedExtensions.includes(`.${fileExtension.toLowerCase()}`)
            ) {
                setData("file", null);
                setUploadedFileName(null);
                setFileSize(null);
                alert(
                    "Format file tidak didukung. Harap unggah file Excel (.xls, .xlsx) atau CSV (.csv)."
                );
                return;
            }
            clearErrors("file");
            setData("file", selectedFile);
            setUploadedFileName(selectedFile.name);
            setFileSize(formatFileSize(selectedFile.size));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files?.[0] || null;
        handleFileChange(droppedFile);
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setData("report_date", date);
            clearErrors("report_date");
        }
    };

    // Fungsi untuk submit form, sekarang menjadi sangat sederhana
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("dashboard.import.process"));
    };

    const resetForm = () => {
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setUploadedFileName(null);
        setFileSize(null);
        clearErrors();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Import Data Universal Banker" />

            <div className="space-y-6 mb-10">
                <Breadcrumb items={[{ label: "Import Data" }]} />
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm">
                                <FileUp className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Import Data Universal Banker
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-50 text-lg">
                            Import data secara massal menggunakan file Excel
                            atau CSV.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Form utama untuk upload */}
                <form onSubmit={handleSubmit}>
                    <Card className="shadow-xl border-0">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-800">
                                Unggah File Data
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                                Pilih atau seret file dan tentukan tanggal
                                import.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Menampilkan flash error dari server jika ada */}
                            {flash?.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>
                                        Gagal Memulai Proses
                                    </AlertTitle>
                                    <AlertDescription>
                                        {flash.error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Area Drag and Drop */}
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                    dragOver
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:border-blue-400",
                                    errors.file && "border-red-500 bg-red-50"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) =>
                                        handleFileChange(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                    className="hidden"
                                    disabled={processing}
                                />
                                <div
                                    className={`p-4 rounded-full ${
                                        uploadedFileName
                                            ? "bg-blue-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <FileSpreadsheet
                                        className={`h-10 w-10 ${
                                            uploadedFileName
                                                ? "text-blue-600"
                                                : "text-gray-400"
                                        }`}
                                    />
                                </div>
                                {!uploadedFileName ? (
                                    <>
                                        <p className="mt-4 text-lg text-gray-700">
                                            Seret file atau{" "}
                                            <span className="text-blue-600 font-semibold">
                                                pilih file
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mendukung: XLSX, XLS, CSV (Max.
                                            20MB)
                                        </p>
                                    </>
                                ) : (
                                    <div className="mt-4 text-center">
                                        <p className="text-lg font-medium text-gray-800">
                                            {uploadedFileName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {fileSize}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {errors.file && (
                                <p className="text-sm text-red-600 mt-2">
                                    {errors.file}
                                </p>
                            )}

                            {/* Input Tanggal */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Import{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-10",
                                                !data.report_date &&
                                                    "text-muted-foreground",
                                                errors.report_date &&
                                                    "border-red-500"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.report_date ? (
                                                format(
                                                    data.report_date,
                                                    "dd MMMM yyyy",
                                                    { locale: id }
                                                )
                                            ) : (
                                                <span>Pilih tanggal</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={data.report_date}
                                            onSelect={handleDateChange}
                                            initialFocus
                                            locale={id}
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date("2000-01-01")
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.report_date && (
                                    <p className="text-sm text-red-600 mt-2">
                                        {errors.report_date}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6 flex justify-end items-center">
                            <div className="flex gap-3">
                                {uploadedFileName && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resetForm}
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="bg-[#00529C] hover:bg-[#004A8C] min-w-[150px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                            Memulai...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" />{" "}
                                            Proses & Lanjutkan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default DashboardImport;
