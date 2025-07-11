"use client";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { PageProps } from "@/types";
import { Button } from "@/components/ui/button";
import {
    FileUp,
    Users,
    ChevronRight,
    LineChart,
    UserCheck,
    Calendar,
    ArrowUpRight,
    LayoutDashboard,
    Clock,
    BriefcaseBusiness,
    FileDown,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/Components/ui/card";

interface DashboardStats {
    totalUniversalBankers: number;
    totalClients: number;
    totalActiveAccounts: number;
    totalPortfolio: number;
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
}

const Dashboard = () => {
    const { auth, stats } = usePage<DashboardPageProps>().props;
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setIsLoaded(true);
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const displayStats: DashboardStats = stats || {
        totalUniversalBankers: 0,
        totalClients: 0,
        totalActiveAccounts: 0,
        totalPortfolio: 0,
    };

    const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(currentTime);

    const formattedTime = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(currentTime);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard | BRI Report" />
            <div
                className={`space-y-6 transition-opacity duration-500 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Top Bar with Date and Welcome */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-3">
                            <LayoutDashboard className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Dashboard
                            </h2>
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formattedDate}</span>
                                <span className="text-gray-300">|</span>
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Section - Memperbaiki overflow */}
                <div className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 md:p-8 shadow-2xl">
                    {/* Background Elements */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9Ii4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxMCIvPjwvZz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_80%)]"></div>
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
                    <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="inline-block rounded-lg bg-white/10 backdrop-blur-md px-4 py-1.5 mb-4 text-sm text-white/90 border border-white/20">
                            BRI Report Portal
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                            Selamat Datang, {auth.user.name}!
                        </h1>
                        <p className="mt-2 max-w-2xl text-blue-50 text-base md:text-lg leading-relaxed">
                            Platform terpusat untuk analisis dan pemantauan
                            kinerja Universal Banker. Lihat ringkasan data
                            terbaru di bawah.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-6">
                            <Link href={route("dashboard.import")}>
                                <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all">
                                    <FileUp className="h-4 w-4 mr-2" />
                                    Import Data Saldo
                                </Button>
                            </Link>
                            <Link href={route("dashboard.export")}>
                                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export Data Saldo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards with Enhanced Design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Link
                        href={route("universalBankers.index")}
                        className="w-full"
                    >
                        <Card className="group overflow-visible border-0 bg-gradient-to-br from-blue-50 to-blue-100/30 shadow-sm hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-md">
                                        <UserCheck className="h-4 w-4" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-blue-600 opacity-70" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                                    {displayStats.totalUniversalBankers}
                                </div>
                                <p className="text-sm font-medium text-blue-800/70">
                                    Universal Banker
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Aktif di sistem
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route("clients.index")} className="w-full">
                        <Card className="group overflow-visible border-0 bg-gradient-to-br from-green-50 to-green-100/30 shadow-sm hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-md">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-emerald-600 opacity-70" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors">
                                    {displayStats.totalClients}
                                </div>
                                <p className="text-sm font-medium text-emerald-800/70">
                                    Nasabah Aktif
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Terdaftar di sistem
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route("accounts.index")} className="w-full">
                        <Card className="group overflow-visible border-0 bg-gradient-to-br from-amber-50 to-amber-100/30 shadow-sm hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-2.5 bg-amber-600 text-white rounded-lg shadow-md">
                                        <LineChart className="h-4 w-4" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-amber-600 opacity-70" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors">
                                    {displayStats.totalActiveAccounts}
                                </div>
                                <p className="text-sm font-medium text-amber-800/70">
                                    Rekening Aktif
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Dengan transaksi terbaru
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Actions Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold tracking-tight text-gray-800">
                            Aksi Cepat
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                        <Card className="group overflow-hidden border border-transparent bg-white hover:border-blue-200 shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-2">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 p-6 mb-4">
                                    <FileUp className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Import Data Saldo
                                </CardTitle>
                                <CardDescription>
                                    Unggah file untuk memperbarui data saldo
                                    nasabah terbaru
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <Link
                                    href={route("dashboard.import")}
                                    className="w-full"
                                >
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
                                        Mulai Import
                                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        <Card className="group overflow-hidden border border-transparent bg-white hover:border-green-200 shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-2">
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 -mx-6 -mt-6 p-6 mb-4">
                                    <FileDown className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Export Data Saldo
                                </CardTitle>
                                <CardDescription>
                                    Unduh data saldo nasabah dalam format Excel
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <Link
                                    href={route("dashboard.export")}
                                    className="w-full"
                                >
                                    <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors">
                                        Unduh Data
                                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        <Card className="group overflow-hidden border border-transparent bg-white hover:border-emerald-200 shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-2">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-600 -mx-6 -mt-6 p-6 mb-4">
                                    <BriefcaseBusiness className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Kelola Universal Banker
                                </CardTitle>
                                <CardDescription>
                                    Lihat, tambah, atau edit semua data
                                    Universal Banker
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <Link
                                    href={route("universalBankers.index")}
                                    className="w-full"
                                >
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors">
                                        Lihat Daftar
                                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
