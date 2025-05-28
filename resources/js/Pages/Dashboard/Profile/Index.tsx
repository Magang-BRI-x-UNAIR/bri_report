import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import { PageProps, User } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/Components/ui/card";
import {
    UserCircle,
    Mail,
    Building2,
    CalendarCheck2,
    Edit2,
    ShieldCheck,
    Info,
    Phone,
    MapPin,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ProfileIndexPageProps extends PageProps {
    user: User;
}

const ProfileIndexPage = () => {
    const { user } = usePage<ProfileIndexPageProps>().props;

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Profil ${user.name} | Bank BRI`} />
            <Breadcrumb items={[{ label: "Profil Saya" }]} />

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Profile Header Card */}
                <Card className="shadow-xl overflow-hidden rounded-lg">
                    <div className="p-6 bg-gradient-to-br from-[#00529C] via-[#0063B8] to-[#0175D4] text-white rounded-t-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                                    <UserCircle className="h-10 w-10 mr-3 opacity-80" />
                                    {user.name}
                                </h1>
                            </div>
                            <Link href={route("profile.edit")}>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 w-full sm:w-auto"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Profil
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 bg-white rounded-b-lg">
                        {/* Detail Kolom Kiri */}
                        <div className="space-y-5">
                            <div className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium text-gray-700">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Nomor Telepon
                                    </p>
                                    {user.phone ? (
                                        <p className="font-medium text-gray-700">
                                            {user.phone}
                                        </p>
                                    ) : (
                                        <p className="italic text-gray-400">
                                            Belum diatur
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Unit Kerja/Cabang
                                    </p>
                                    <p className="font-medium text-gray-700">
                                        {user.branch?.name || (
                                            <span className="italic text-gray-400">
                                                Belum diatur
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Kolom Kanan */}
                        <div className="space-y-5">
                            <div className="flex items-start space-x-3">
                                <CalendarCheck2 className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Tanggal Bergabung
                                    </p>
                                    <p className="font-medium text-gray-700">
                                        {formatDate(user.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <ShieldCheck
                                    className={`h-5 w-5 mt-1 ${
                                        user.email_verified_at
                                            ? "text-green-500"
                                            : "text-amber-500"
                                    }`}
                                />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Status Email
                                    </p>
                                    {user.email_verified_at ? (
                                        <p className="font-medium text-green-600">
                                            Terverifikasi (
                                            {formatDateTime(
                                                user.email_verified_at
                                            )}
                                            )
                                        </p>
                                    ) : (
                                        <p className="font-medium text-amber-600">
                                            Belum Diverifikasi
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Alamat
                                    </p>
                                    {user.address ? (
                                        <p className="font-medium text-gray-700">
                                            {user.address}
                                        </p>
                                    ) : (
                                        <p className="italic text-gray-400">
                                            Belum diatur
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 p-4 border-t">
                        <div className="flex items-center text-xs text-gray-600">
                            <Info className="h-4 w-4 mr-2 text-blue-500" />
                            <span>
                                Untuk mengubah informasi profil, password, atau
                                menghapus akun, silakan akses halaman "Edit
                                Profil".
                            </span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProfileIndexPage;
