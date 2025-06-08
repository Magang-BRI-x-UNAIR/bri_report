import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { Button } from "@/components/ui/button";
import { FileUp, Users, ChevronRight } from "lucide-react";

const Dashboard = () => {
    const { auth } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Header */}
                    <div className="mb-8 p-6 bg-white shadow-lg sm:rounded-xl border-l-4 border-blue-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Selamat Datang, {auth.user.name}!
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Ini adalah pusat kendali Anda. Kelola Universal
                            Banker dan data mereka dari sini.
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Kartu untuk Halaman Import */}
                        <div className="group overflow-hidden bg-white shadow-lg sm:rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg transition-colors group-hover:bg-blue-200">
                                        <FileUp className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Import Data
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Upload file Excel/CSV untuk data UB
                                            baru.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    <Link href={route("dashboard.import")}>
                                        <Button className="bg-[#00529C] hover:bg-[#004A8C] text-white group">
                                            Mulai Import
                                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Kartu untuk Daftar UB */}
                        <div className="group overflow-hidden bg-white shadow-lg sm:rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg transition-colors group-hover:bg-green-200">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Daftar Universal Banker
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Lihat dan kelola semua data
                                            Universal Banker.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    <Link
                                        href={route("universalBankers.index")}
                                    >
                                        <Button
                                            variant="outline"
                                            className="group"
                                        >
                                            Lihat Daftar
                                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {/* Anda bisa menambahkan kartu aksi lainnya di sini */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
