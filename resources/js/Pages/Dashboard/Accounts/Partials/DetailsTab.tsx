import { Link } from "@inertiajs/react";
import { Account, AccountTransaction } from "@/types";
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
    CreditCard,
    User,
    Calendar,
    FileText,
    Wallet,
    ArrowUpRight,
    Receipt,
    CalendarDays,
    Mail,
    Phone,
    MessageSquare,
    Building2,
    UserX,
    Briefcase,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DetailsTabProps {
    account: Account;
    processedTransactions: AccountTransaction[];
    transactionStats: {
        totalTransactions: number;
        creditCount: number;
        debitCount: number;
        totalCredit: number;
        totalDebit: number;
        recentTransactions: number;
        recentCredits: number;
        recentDebits: number;
        recentTotalCredit: number;
        recentTotalDebit: number;
    };
}

const DetailsTab: React.FC<DetailsTabProps> = ({
    account,
    processedTransactions,
    transactionStats,
}) => {
    return (
        <div className="space-y-6">
            {/* Account Information */}
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Informasi Rekening
                            </CardTitle>
                            <CardDescription className="text-blue-700/70">
                                Detail dan pengaturan rekening
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                Informasi Dasar
                            </h3>
                            <div className="rounded-lg bg-gray-50/50 border border-gray-100 overflow-hidden">
                                <div className="flex items-center p-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <span className="text-sm text-gray-600 flex-1">
                                        Nomor Rekening
                                    </span>
                                    <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">
                                        {account.account_number}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <span className="text-sm text-gray-600 flex-1">
                                        Jenis Rekening
                                    </span>
                                    <span className="text-sm font-medium">
                                        {account.account_product?.name ||
                                            "Tabungan"}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <span className="text-sm text-gray-600 flex-1">
                                        Mata Uang
                                    </span>
                                    <span className="text-sm font-medium flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                                            {account.currency || "IDR"}
                                        </div>
                                        {account.currency || "Rupiah Indonesia"}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <span className="text-sm text-gray-600 flex-1">
                                        Tanggal Dibuka
                                    </span>
                                    <span className="text-sm font-medium flex items-center">
                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                        {formatDate(account.opened_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <Wallet className="h-4 w-4 mr-2 text-blue-600" />
                                Informasi Keuangan
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                    <div className="text-xs font-medium text-blue-600 uppercase mb-1">
                                        Saldo Saat Ini
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {formatCurrency(
                                            account.current_balance
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-blue-700 flex items-center">
                                        <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                                        Saldo tersedia:{" "}
                                        {formatCurrency(
                                            account.available_balance
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-xs font-medium text-gray-500 mb-1">
                                            Total Entri
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 flex items-center">
                                            <Receipt className="h-4 w-4 mr-1.5 text-gray-500" />
                                            {transactionStats.totalTransactions}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-xs font-medium text-gray-500 mb-1">
                                            Perubahan Terakhir
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {processedTransactions.length > 0
                                                ? formatDate(
                                                      processedTransactions[
                                                          processedTransactions.length -
                                                              1
                                                      ].date
                                                  )
                                                : "Belum ada perubahan"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
                                        <div className="text-xs font-medium text-emerald-700 mb-1">
                                            Kredit
                                        </div>
                                        <div className="text-lg font-medium text-emerald-800">
                                            {transactionStats.creditCount}{" "}
                                            <span className="text-xs text-emerald-600">
                                                entri
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-100">
                                        <div className="text-xs font-medium text-rose-700 mb-1">
                                            Debit
                                        </div>
                                        <div className="text-lg font-medium text-rose-800">
                                            {transactionStats.debitCount}{" "}
                                            <span className="text-xs text-rose-600">
                                                entri
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-emerald-800">
                                <User className="h-5 w-5 text-emerald-600" />
                                Informasi Nasabah
                            </CardTitle>
                            <CardDescription className="text-emerald-700/70">
                                Detail nasabah pemilik rekening ini
                            </CardDescription>
                        </div>
                        <Link href={route("clients.show", account.client.id)}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50"
                            >
                                <User className="h-4 w-4" />
                                Lihat Profil Nasabah
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Client avatar and primary info */}
                            <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center mb-3 shadow-sm border-2 border-white">
                                    <span className="text-3xl font-bold text-emerald-700">
                                        {account.client.name?.charAt(0) || "N"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 text-center md:text-left mb-1">
                                    {account.client.name}
                                </h3>
                            </div>

                            {/* Client details in two columns */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-0 rounded-lg bg-gray-50/50 border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-100/70 px-4 py-2">
                                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center">
                                            <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                            Informasi Identitas
                                        </h4>
                                    </div>

                                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                                        <span className="text-sm text-gray-600 flex-1">
                                            CIF
                                        </span>
                                        <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                            {account.client.cif ||
                                                "Tidak tersedia"}
                                        </span>
                                    </div>

                                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <span className="text-sm text-gray-600 flex-1">
                                            Bergabung Sejak
                                        </span>
                                        <span className="text-sm font-medium flex items-center">
                                            <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                            {account.client.joined_at
                                                ? formatDate(
                                                      account.client.joined_at
                                                  )
                                                : "Tidak tersedia"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-0 rounded-lg bg-gray-50/50 border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-100/70 px-4 py-2">
                                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center">
                                            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                            Informasi Kontak
                                        </h4>
                                    </div>

                                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                                        <span className="text-sm text-gray-600 flex-1">
                                            Email
                                        </span>
                                        <a
                                            href={`mailto:${
                                                account.client.email || ""
                                            }`}
                                            className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                        >
                                            <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            {account.client.email ||
                                                "Tidak tersedia"}
                                        </a>
                                    </div>

                                    <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                                        <span className="text-sm text-gray-600 flex-1">
                                            Telepon
                                        </span>
                                        <a
                                            href={`tel:${
                                                account.client.phone || ""
                                            }`}
                                            className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                        >
                                            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            {account.client.phone ||
                                                "Tidak tersedia"}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Universal Banker Information */}
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Briefcase className="h-5 w-5 text-slate-600" />
                                Informasi Universal Banker
                            </CardTitle>
                            <CardDescription className="text-slate-700/70">
                                Detail Universal Banker yang ditugaskan untuk
                                rekening ini
                            </CardDescription>
                        </div>
                        {account.universal_banker && (
                            <Link
                                href={route(
                                    "universalBankers.show",
                                    account.universal_banker?.id
                                )}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50"
                                >
                                    <User className="h-4 w-4" />
                                    Lihat Profil Universal Banker
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {account.universal_banker ? (
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Banker avatar and primary info */}
                                <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center mb-3 shadow-sm border-2 border-white">
                                        <span className="text-3xl font-bold text-slate-700">
                                            {account.universal_banker.name?.charAt(
                                                0
                                            ) || "U"}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 text-center md:text-left mb-1">
                                        {account.universal_banker.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 text-center md:text-left">
                                        Universal Banker
                                    </p>
                                </div>

                                {/* Banker details in two columns */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-0 rounded-lg bg-gray-50/50 border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-100/70 px-4 py-2">
                                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center">
                                                <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                Informasi Personal
                                            </h4>
                                        </div>
                                        <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                                            <span className="text-sm text-gray-600 flex-1">
                                                NIP
                                            </span>
                                            <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                {account.universal_banker.nip}
                                            </span>
                                        </div>
                                        <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                                            <span className="text-sm text-gray-600 flex-1">
                                                Kantor Cabang
                                            </span>
                                            <span className="text-sm font-medium flex items-center">
                                                <Building2 className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                {account.universal_banker.branch
                                                    ?.name || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-0 rounded-lg bg-gray-50/50 border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-100/70 px-4 py-2">
                                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center">
                                                <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                Informasi Kontak
                                            </h4>
                                        </div>
                                        <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                                            <span className="text-sm text-gray-600 flex-1">
                                                Email
                                            </span>
                                            <a
                                                href={`mailto:${
                                                    account.universal_banker
                                                        .email || ""
                                                }`}
                                                className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                            >
                                                <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                {account.universal_banker
                                                    .email || "Tidak tersedia"}
                                            </a>
                                        </div>
                                        <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                                            <span className="text-sm text-gray-600 flex-1">
                                                Telepon
                                            </span>
                                            <a
                                                href={`tel:${
                                                    account.universal_banker
                                                        .phone || ""
                                                }`}
                                                className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                            >
                                                <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                {account.universal_banker
                                                    .phone || "Tidak tersedia"}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-gray-100 p-3 mb-3">
                                <UserX className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">
                                Belum Ada Universal Banker
                            </h3>
                            <p className="text-gray-500 mt-1 max-w-sm text-sm">
                                Saat ini belum ada Universal Banker yang
                                ditugaskan untuk rekening ini.
                            </p>
                        </div>
                    )}
                </CardContent>
                {account.universal_banker && (
                    <CardFooter className="px-6 py-4 bg-gray-50/50 border-t">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-sm text-gray-500">
                                Ditugaskan sejak{" "}
                                <span className="font-medium text-gray-600">
                                    {formatDate(
                                        account.universal_banker.created_at
                                    )}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Hubungi
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default DetailsTab;
