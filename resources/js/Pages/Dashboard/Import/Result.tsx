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
    FileUp,
    BarChart3,
    DatabaseZap,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import type { PageProps } from "@/types";

// Tipe untuk data hasil dari cache
interface SaveResult {
    status: "saving" | "completed" | "failed";
    message: string;
    processed_count?: number;
}

interface ResultPageProps extends PageProps {
    resultId: string;
}

const SavingState = () => (
    <div className="text-center">
        <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full border-8 border-t-blue-600 border-r-blue-100 border-b-blue-100 border-l-blue-100 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <DatabaseZap className="h-10 w-10 text-blue-500" />
            </div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Menyimpan Data ke Database...
        </h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Proses ini berjalan di background dan mungkin memerlukan beberapa
            saat. Anda bisa meninggalkan halaman ini dan kembali lagi nanti.
        </p>
    </div>
);

const CompletedState = ({ result }: { result: SaveResult }) => (
    <div className="text-center">
        <div className="p-4 rounded-full bg-green-100 inline-block mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Import Berhasil</h2>
        <p className="mt-2 text-lg text-gray-600">
            {result.message ||
                `${result.processed_count || 0} data berhasil disimpan.`}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={route("dashboard.import")}>
                <Button className="bg-[#00529C] hover:bg-[#004A8C] w-full sm:w-auto">
                    <FileUp className="h-4 w-4 mr-2" />
                    Import Data Lain
                </Button>
            </Link>
            <Link href={route("dashboard.index")}>
                <Button variant="outline" className="w-full sm:w-auto">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Kembali ke Dashboard
                </Button>
            </Link>
        </div>
    </div>
);

const FailedState = ({ result }: { result: SaveResult }) => (
    <div className="text-center">
        <div className="p-4 rounded-full bg-red-100 inline-block mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Import Gagal</h2>
        <p className="mt-2 text-lg text-red-600 bg-red-50 p-3 rounded-md">
            {result.message || "Terjadi kesalahan yang tidak diketahui."}
        </p>
        <div className="mt-8">
            <Link href={route("dashboard.import")}>
                <Button variant="destructive" className="w-full sm:w-auto">
                    <Users className="h-4 w-4 mr-2" />
                    Coba Lagi
                </Button>
            </Link>
        </div>
    </div>
);

const ResultPage: React.FC<ResultPageProps> = ({ resultId }) => {
    const [status, setStatus] = useState<
        "saving" | "completed" | "failed" | "unknown"
    >("saving");
    const [result, setResult] = useState<SaveResult | null>(null);

    useEffect(() => {
        if (!resultId) {
            setStatus("failed");
            setResult({ status: "failed", message: "ID Proses tidak valid." });
            return;
        }

        const intervalId = setInterval(() => {
            axios
                .get(route("dashboard.save.status", { result_id: resultId }))
                .then((res) => {
                    const data: SaveResult = res.data;
                    if (
                        data &&
                        (data.status === "completed" ||
                            data.status === "failed")
                    ) {
                        clearInterval(intervalId);
                        setStatus(data.status);
                        setResult(data);
                    } else if (!data) {
                        // Jika cache tidak ditemukan (mungkin expired)
                        clearInterval(intervalId);
                        setStatus("failed");
                        setResult({
                            status: "failed",
                            message:
                                "Sesi import tidak ditemukan atau telah kedaluwarsa.",
                        });
                    }
                })
                .catch((err) => {
                    clearInterval(intervalId);
                    setStatus("failed");
                    setResult({
                        status: "failed",
                        message:
                            "Gagal menghubungi server untuk mendapatkan status.",
                    });
                });
        }, 3000); // Polling setiap 3 detik

        return () => clearInterval(intervalId);
    }, [resultId]);

    const renderContent = () => {
        switch (status) {
            case "completed":
                return <CompletedState result={result!} />;
            case "failed":
                return <FailedState result={result!} />;
            case "saving":
            default:
                return <SavingState />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Hasil Import" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Import Data",
                                    href: route("dashboard.import"),
                                },
                                { label: "Hasil" },
                            ]}
                        />
                    </div>
                    <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden animate-fadeIn">
                        <CardContent className="py-12 px-6">
                            {renderContent()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ResultPage;
