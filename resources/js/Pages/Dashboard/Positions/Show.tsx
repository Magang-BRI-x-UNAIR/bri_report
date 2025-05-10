import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, User } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import {
    Briefcase,
    FileText,
    Users,
    User as UserIcon,
    Mail,
    Calendar,
    ChevronLeft,
    Edit,
    ArrowLeftRight,
    PlusCircle,
    Check,
    FileQuestion,
} from "lucide-react";

interface Position {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users: User[];
}

interface ShowProps extends PageProps {
    position: Position;
}

const PositionsShow = () => {
    const { position } = usePage<ShowProps>().props;

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${position.name} | Jabatan BRI`} />

            <Breadcrumb
                items={[
                    { label: "Jabatan", href: route("positions.index") },
                    { label: position.name },
                ]}
            />

            {/* Position info banner */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] overflow-hidden shadow-lg">
                <div className="relative">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="h-24 w-24 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                            <Briefcase className="h-12 w-12 text-white" />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center justify-center sm:justify-start gap-3">
                                        <h2 className="text-2xl font-bold text-white">
                                            {position.name}
                                        </h2>
                                        <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                            BRI-POS-
                                            {position.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <p className="text-blue-100 mt-1 line-clamp-2">
                                        {position.description}
                                    </p>
                                </div>

                                <div className="mt-3 sm:mt-0">
                                    <Link href={route("positions.index")}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-gray-600"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>Kembali</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900/30 border-t border-blue-400/20">
                        <div className="grid grid-cols-2 md:grid-cols-2 divide-x divide-blue-400/20">
                            <div className="p-4 text-center">
                                <p className="text-blue-100 text-sm">
                                    Total Teller
                                </p>
                                <p className="text-white text-2xl font-bold mt-1">
                                    {position.users.length}
                                </p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-blue-100 text-sm">Dibuat</p>
                                <p className="text-white text-lg font-medium mt-1">
                                    {formatDate(position.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Position Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Briefcase className="h-5 w-5 text-[#00529C]" />
                            <h2 className="font-medium text-gray-900">
                                Informasi Jabatan
                            </h2>
                        </div>
                        <Link href={route("positions.edit", position.id)}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Edit"
                            >
                                <Edit className="h-4 w-4 text-gray-500 hover:text-amber-500" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="p-5">
                        <div className="mb-6">
                            <div className="h-24 w-24 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="h-12 w-12 text-[#00529C]" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-gray-900">
                                {position.name}
                            </h3>
                            <p className="text-center text-sm text-gray-500">
                                ID: BRI-POS-
                                {position.id.toString().padStart(4, "0")}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Deskripsi Jabatan
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {position.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Jumlah Teller
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {position.users.length} Orang
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Terdaftar Sejak
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatDate(position.created_at)}
                                    </p>
                                </div>
                            </div>

                            {position.created_at !== position.updated_at && (
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Terakhir Diupdate
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatDate(position.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Position Users List Card */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-[#00529C]" />
                            <h2 className="font-medium text-gray-900">
                                Daftar Teller dengan Jabatan {position.name}
                            </h2>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C]">
                                {position.users.length} Teller
                            </span>
                            <Button
                                size="sm"
                                className="h-9 gap-1 bg-[#00529C] hover:bg-[#003b75]"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Tambah Teller
                            </Button>
                        </div>
                    </div>

                    {/* User Stats Summary */}
                    {position.users.length > 0 && (
                        <div className="bg-gray-50/60 p-3 border-b border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-center p-2 border-r border-gray-200">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">
                                            Teller Terverifikasi
                                        </p>
                                        <p className="text-lg font-medium text-green-600">
                                            {
                                                position.users.filter(
                                                    (u) => u.email_verified_at
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center p-2">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">
                                            Menunggu Verifikasi
                                        </p>
                                        <p className="text-lg font-medium text-amber-600">
                                            {
                                                position.users.filter(
                                                    (u) => !u.email_verified_at
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-gray-100">
                        {position.users.length > 0 ? (
                            position.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-4 hover:bg-blue-50/30 transition-colors duration-150"
                                >
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                                            <UserIcon className="h-6 w-6 text-[#00529C]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.name}
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        {position.name}
                                                    </span>
                                                    <p className="text-xs text-gray-500 ml-2">
                                                        ID:{" "}
                                                        {user.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="truncate">
                                                    {user.email}
                                                </span>
                                            </div>

                                            {user.email_verified_at ? (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Email Terverifikasi
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                        Belum Terverifikasi
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            <Link
                                                href={`/users/${user.id}`}
                                                className="text-[#00529C] text-sm hover:underline px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="mx-auto h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                    <FileQuestion className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Belum ada Teller
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                    Jabatan ini belum memiliki pengguna yang
                                    ditugaskan. Anda dapat menambahkan pengguna
                                    baru atau memindahkan pengguna yang sudah
                                    ada ke jabatan ini.
                                </p>
                                <div className="mt-6 flex justify-center space-x-3">
                                    <Button className="bg-[#00529C] hover:bg-[#003b75] gap-1.5">
                                        <PlusCircle className="h-4 w-4" />
                                        Tambahkan Teller
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {position.users.length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Menampilkan {position.users.length} pengguna
                            </div>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-sm"
                                >
                                    Lihat Semua Teller
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default PositionsShow;
