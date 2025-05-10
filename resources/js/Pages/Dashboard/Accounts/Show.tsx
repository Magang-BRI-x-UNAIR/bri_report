import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Account, PageProps, AccountTransaction } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
    CreditCard,
    DollarSign,
    User,
    Calendar,
    ChevronLeft,
    Edit,
    TrendingUp,
    TrendingDown,
    ArrowDownUp,
    Package,
    Clock,
    Users,
    Building2,
    Receipt,
    Filter,
    Download,
    Printer,
    Search,
    X,
    AlertCircle,
    Check,
    FileText,
    BarChart4,
    ExternalLink,
} from "lucide-react";

interface AccountsShowProps extends PageProps {
    account: Account;
}

const AccountsShow = () => {
    const { account } = usePage<AccountsShowProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [transactionType, setTransactionType] = useState("all");

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Format time for display
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Format currency for display
    const formatCurrency = (amount: number, currency: string = "IDR") => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate percentage change
    const calculatePercentageChange = (
        newBalance: number,
        previousBalance: number
    ) => {
        if (previousBalance === 0) return 100;
        return (
            ((newBalance - previousBalance) / Math.abs(previousBalance)) * 100
        );
    };

    // Get transaction type (credit/debit) with appropriate styling
    const getTransactionType = (amount: number) => {
        if (amount > 0) {
            return {
                type: "credit",
                label: "Kredit",
                className: "text-green-600 bg-green-50",
                icon: <TrendingUp className="h-4 w-4 text-green-600" />,
            };
        } else {
            return {
                type: "debit",
                label: "Debit",
                className: "text-red-600 bg-red-50",
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
            };
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <Check className="h-3 w-3 mr-1" />
                        Aktif
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak Aktif
                    </span>
                );
            case "blocked":
                return (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        <X className="h-3 w-3 mr-1" />
                        Diblokir
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                        {status}
                    </span>
                );
        }
    };

    // Filter transactions based on search and filters
    const filteredTransactions = account.account_transactions
        .filter((transaction) => {
            // Search term filter
            const searchMatch =
                searchTerm === "" ||
                formatCurrency(transaction.amount).includes(searchTerm);

            // Transaction type filter
            const typeMatch =
                transactionType === "all" ||
                (transactionType === "credit" && transaction.amount > 0) ||
                (transactionType === "debit" && transaction.amount < 0);

            return searchMatch && typeMatch;
        })
        .sort((a, b) => {
            // Simple chronological sorting for now
            // You can expand this based on sortField
            const dateA = new Date(a.created_at || "").getTime();
            const dateB = new Date(b.created_at || "").getTime();

            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });

    return (
        <AuthenticatedLayout>
            <Head title={`Rekening ${account.account_number} | Bank BRI`} />

            <Breadcrumb
                items={[
                    { label: "Rekening", href: route("accounts.index") },
                    { label: `No. ${account.account_number}` },
                ]}
            />

            {/* Account info banner */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] overflow-hidden shadow-lg">
                <div className="relative">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="h-24 w-24 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                            <CreditCard className="h-12 w-12 text-white" />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center justify-center sm:justify-start gap-3">
                                        <h2 className="text-2xl font-bold text-white">
                                            {account.account_number}
                                        </h2>
                                        <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                            BRI-A-
                                            {account.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <Link
                                        href={route(
                                            "clients.show",
                                            account.client.id
                                        )}
                                    >
                                        <p className="text-blue-100 mt-1 hover:underline hover:text-white transition-colors">
                                            Nasabah: {account.client.name}
                                        </p>
                                    </Link>
                                </div>

                                <div className="mt-3 sm:mt-0">
                                    <Link href={route("accounts.index")}>
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
                                <p className="text-blue-100 text-sm">Saldo</p>
                                <p className="text-white text-2xl font-bold mt-1">
                                    {formatCurrency(
                                        account.current_balance,
                                        account.currency
                                    )}
                                </p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-blue-100 text-sm">
                                    Dibuka Pada
                                </p>
                                <p className="text-white text-lg font-medium mt-1">
                                    {formatDate(account.opened_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-[#00529C]" />
                            <h2 className="font-medium text-gray-900">
                                Informasi Rekening
                            </h2>
                        </div>
                        <div>{getStatusBadge(account.status)}</div>
                    </div>

                    <div className="p-5">
                        <div className="mb-6">
                            <div className="h-24 w-24 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-12 w-12 text-[#00529C]" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-gray-900">
                                {account.account_number}
                            </h3>
                            <p className="text-center text-sm text-gray-500">
                                ID: BRI-A-
                                {account.id.toString().padStart(4, "0")}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Nama Nasabah
                                    </p>
                                    <Link
                                        href={route(
                                            "clients.show",
                                            account.client.id
                                        )}
                                    >
                                        <p className="text-sm text-[#00529C] mt-1 hover:underline">
                                            {account.client.name}
                                        </p>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Package className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Jenis Rekening
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {account.account_product.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Kode: {account.account_product.code}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Saldo Saat Ini
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatCurrency(
                                            account.current_balance,
                                            account.currency
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Saldo Tersedia
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatCurrency(
                                            account.available_balance,
                                            account.currency
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Teller
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {account.teller.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {account.teller.position?.name ||
                                            "Teller"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Cabang
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {account.teller.branch?.name || "Pusat"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Dibuka Pada
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatDate(account.opened_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex justify-center space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                >
                                    <FileText className="h-4 w-4" />
                                    Cetak Detail
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-[#00529C] hover:bg-[#003b75]"
                                >
                                    <Edit className="h-4 w-4" />
                                    Ubah Status
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Chart & Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Balance Chart Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BarChart4 className="h-5 w-5 text-[#00529C]" />
                                <h2 className="font-medium text-gray-900">
                                    Grafik Saldo Rekening
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Ekspor
                                </Button>
                            </div>
                        </div>

                        <div className="p-5">
                            {account.account_transactions.length > 0 ? (
                                <div className="h-64 w-full">
                                    {/* This would be your chart component - for demonstration, showing a placeholder */}
                                    <div className="h-full w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <BarChart4 className="h-12 w-12 text-[#00529C]/30 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                Grafik saldo rekening akan
                                                ditampilkan di sini
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                                Gunakan library seperti Chart.js
                                                atau Recharts untuk implementasi
                                                aktual
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BarChart4 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        Belum ada data transaksi
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                        Grafik akan ditampilkan setelah ada
                                        transaksi pada rekening ini
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction List Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Receipt className="h-5 w-5 text-[#00529C]" />
                                <h2 className="font-medium text-gray-900">
                                    Riwayat Transaksi
                                </h2>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C]">
                                    {filteredTransactions.length} Transaksi
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1 hidden sm:flex"
                                >
                                    <Printer className="h-4 w-4" />
                                    Cetak
                                </Button>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-4 bg-gray-50/60 border-b border-gray-100">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative flex-1 min-w-[200px]">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        placeholder="Cari transaksi..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    {searchTerm && (
                                        <button
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            onClick={() => setSearchTerm("")}
                                        >
                                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <select
                                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        value={transactionType}
                                        onChange={(e) =>
                                            setTransactionType(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            Semua Transaksi
                                        </option>
                                        <option value="credit">
                                            Kredit (Masuk)
                                        </option>
                                        <option value="debit">
                                            Debit (Keluar)
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Urutkan
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={sortField}
                                            onChange={(e) =>
                                                setSortField(e.target.value)
                                            }
                                        >
                                            <option value="created_at">
                                                Tanggal
                                            </option>
                                            <option value="amount">
                                                Jumlah
                                            </option>
                                            <option value="balance">
                                                Saldo
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Arah Urutan
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={sortDirection}
                                            onChange={(e) =>
                                                setSortDirection(e.target.value)
                                            }
                                        >
                                            <option value="desc">
                                                Terbaru - Terlama
                                            </option>
                                            <option value="asc">
                                                Terlama - Terbaru
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            className="w-full bg-[#00529C] hover:bg-[#003b75] text-sm h-10"
                                            onClick={() =>
                                                setShowFilters(false)
                                            }
                                        >
                                            Terapkan Filter
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transaction List */}
                        <div className="overflow-x-auto">
                            {filteredTransactions.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Tanggal & Waktu
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Jenis
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Jumlah
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Saldo Sebelumnya
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Saldo Baru
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Perubahan %
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTransactions.map(
                                            (transaction, index) => {
                                                const txType =
                                                    getTransactionType(
                                                        transaction.amount
                                                    );
                                                const percentChange =
                                                    calculatePercentageChange(
                                                        transaction.new_balance,
                                                        transaction.previous_balance
                                                    );
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div>
                                                                {formatDate(
                                                                    transaction.created_at ||
                                                                        ""
                                                                )}
                                                            </div>
                                                            <div className="text-xs">
                                                                {formatTime(
                                                                    transaction.created_at ||
                                                                        ""
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txType.className}`}
                                                            >
                                                                {txType.icon}
                                                                <span className="ml-1">
                                                                    {
                                                                        txType.label
                                                                    }
                                                                </span>
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                                transaction.amount >
                                                                0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {formatCurrency(
                                                                Math.abs(
                                                                    transaction.amount
                                                                ),
                                                                account.currency
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatCurrency(
                                                                transaction.previous_balance,
                                                                account.currency
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                            {formatCurrency(
                                                                transaction.new_balance,
                                                                account.currency
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    percentChange >
                                                                    0
                                                                        ? "bg-green-50 text-green-700"
                                                                        : percentChange <
                                                                          0
                                                                        ? "bg-red-50 text-red-700"
                                                                        : "bg-gray-50 text-gray-700"
                                                                }`}
                                                            >
                                                                {percentChange >
                                                                0 ? (
                                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                                ) : percentChange <
                                                                  0 ? (
                                                                    <TrendingDown className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <ArrowDownUp className="h-3 w-3 mr-1" />
                                                                )}
                                                                {Math.abs(
                                                                    percentChange
                                                                ).toFixed(2)}
                                                                %
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="mx-auto h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                        <Receipt className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Tidak ada transaksi
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                        {searchTerm || transactionType !== "all"
                                            ? "Tidak ada transaksi yang cocok dengan filter yang dipilih. Coba ubah kriteria pencarian Anda."
                                            : "Rekening ini belum memiliki riwayat transaksi."}
                                    </p>
                                    {(searchTerm ||
                                        transactionType !== "all") && (
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setTransactionType("all");
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-1.5" />
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {filteredTransactions.length > 0 && (
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Menampilkan {filteredTransactions.length}{" "}
                                    transaksi
                                </div>
                                <div>
                                    <Link
                                        href="#"
                                        className="text-[#00529C] text-sm flex items-center gap-1 hover:underline"
                                    >
                                        Lihat detail transaksi lengkap
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountsShow;
