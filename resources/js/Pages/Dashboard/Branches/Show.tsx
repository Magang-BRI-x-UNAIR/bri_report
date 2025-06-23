import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Branch, PageProps } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MapPin,
    Users,
    User,
    Mail,
    Calendar,
    ChevronLeft,
    Edit,
    ArrowLeftRight,
    PlusCircle,
    Check,
} from "lucide-react";

interface ShowProps extends PageProps {
    branch: Branch;
}

const BranchesShow = () => {
    const { branch } = usePage<ShowProps>().props;

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
            <Head title={`${branch.name} | Cabang BRI`} />

            <Breadcrumb
                items={[
                    { label: "Cabang", href: route("branches.index") },
                    { label: branch.name },
                ]}
            />

            {/* Branch info banner */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] overflow-hidden shadow-lg">
                <div className="relative">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="h-24 w-24 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                            <Building2 className="h-12 w-12 text-white" />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center justify-center sm:justify-start gap-3">
                                        <h2 className="text-2xl font-bold text-white">
                                            {branch.name}
                                        </h2>
                                        <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                            BRI-
                                            {branch.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <p className="text-blue-100 mt-1">
                                        {branch.address}
                                    </p>
                                </div>

                                <div className="mt-3 sm:mt-0">
                                    <Link href={route("branches.index")}>
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
                                    Total Universal Banker
                                </p>
                                <p className="text-white text-2xl font-bold mt-1">
                                    {branch.universal_bankers.length}
                                </p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-blue-100 text-sm">
                                    Didirikan
                                </p>
                                <p className="text-white text-lg font-medium mt-1">
                                    {formatDate(branch.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branch Info Card -  */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-[#00529C]" />
                            <h2 className="font-medium text-gray-900">
                                Informasi Cabang
                            </h2>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="mb-6">
                            <div className="h-24 w-24 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-12 w-12 text-[#00529C]" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-gray-900">
                                {branch.name}
                            </h3>
                            <p className="text-center text-sm text-gray-500">
                                ID: BRI-{branch.id.toString().padStart(4, "0")}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Alamat Cabang
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {branch.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Jumlah Universal Banker
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {branch.universal_bankers.length}{" "}
                                        Universal Banker
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
                                        {formatDate(branch.created_at)}
                                    </p>
                                </div>
                            </div>

                            {branch.created_at !== branch.updated_at && (
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Terakhir Diupdate
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatDate(branch.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* UniversalBanker List Card -  */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-[#00529C]" />
                            <h2 className="font-medium text-gray-900">
                                Daftar Universal Banker
                            </h2>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C]">
                                {branch.universal_bankers.length} Universal
                                Banker
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {branch.universal_bankers.length > 0 ? (
                            branch.universal_bankers.map((universalBanker) => (
                                <div
                                    key={universalBanker.id}
                                    className="p-4 hover:bg-blue-50/30 transition-colors duration-150"
                                >
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                                            <User className="h-6 w-6 text-[#00529C]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {universalBanker.name}
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        Universal Banker
                                                    </span>
                                                    <p className="text-xs text-gray-500 ml-2">
                                                        PN:{" "}
                                                        {universalBanker.nip
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="truncate">
                                                    {universalBanker.email ??
                                                        "Email tidak tersedia"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="mx-auto h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Belum ada Universal Banker
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                    Cabang ini belum memiliki Universal Banker
                                    yang ditugaskan. Anda dapat menambahkan
                                    Universal Banker baru atau memindahkan
                                    Universal Banker yang sudah ada ke cabang
                                    ini.
                                </p>
                                <div className="mt-6 flex justify-center space-x-3">
                                    <Button className="bg-[#00529C] hover:bg-[#003b75] gap-1.5">
                                        <PlusCircle className="h-4 w-4" />
                                        Tambahkan Universal Banker
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {branch.universal_bankers.length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Menampilkan {branch.universal_bankers.length}{" "}
                                Universal Banker
                            </div>
                            <div>
                                <Link href={route("universalBankers.index")}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-sm"
                                    >
                                        Lihat Semua Universal Banker
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default BranchesShow;
