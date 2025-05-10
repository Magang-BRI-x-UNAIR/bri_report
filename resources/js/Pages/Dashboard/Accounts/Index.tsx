import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Account, PageProps } from "@/types";
import { Head, usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    CreditCard,
    ChevronRight,
    ListFilter,
    ArrowUpDown,
    X,
    Eye,
    Users,
    BadgeInfo,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";

interface AccountsIndexProps extends PageProps {
    accounts: Account[];
}

const AccountsIndex = () => {
    const { accounts }: AccountsIndexProps =
        usePage<AccountsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("account_number");
    const [sortDirection, setSortDirection] = useState("asc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");

    // Get unique account products for filter
    const uniqueProducts = [
        ...new Map(
            accounts.map((account) => [
                account.account_product.id,
                account.account_product,
            ])
        ).values(),
    ];

    // Format currency
    const formatCurrency = (amount: number, currency: string = "IDR") => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Filter accounts based on search term and filters
    const filteredAccounts = accounts
        .filter((account) => {
            // Search term filter
            const searchMatch =
                account.account_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                account.client.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                account.account_product.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            // Status filter
            const statusMatch =
                statusFilter === "all" ||
                account.status.toLowerCase() === statusFilter;

            // Product filter
            const productMatch =
                productFilter === "all" ||
                account.account_product.id.toString() === productFilter;

            return searchMatch && statusMatch && productMatch;
        })
        .sort((a, b) => {
            if (sortField === "account_number") {
                return sortDirection === "asc"
                    ? a.account_number.localeCompare(b.account_number)
                    : b.account_number.localeCompare(a.account_number);
            } else if (sortField === "client_name") {
                return sortDirection === "asc"
                    ? a.client.name.localeCompare(b.client.name)
                    : b.client.name.localeCompare(a.client.name);
            } else if (sortField === "balance") {
                return sortDirection === "asc"
                    ? a.current_balance - b.current_balance
                    : b.current_balance - a.current_balance;
            } else if (sortField === "teller") {
                return sortDirection === "asc"
                    ? a.teller.name.localeCompare(b.teller.name)
                    : b.teller.name.localeCompare(a.teller.name);
            } else if (sortField === "product") {
                return sortDirection === "asc"
                    ? a.account_product.name.localeCompare(
                          b.account_product.name
                      )
                    : b.account_product.name.localeCompare(
                          a.account_product.name
                      );
            } else if (sortField === "status") {
                return sortDirection === "asc"
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            return 0;
        });

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Aktif
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak Aktif
                    </span>
                );
            case "blocked":
                return (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Diblokir
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                        <BadgeInfo className="h-3 w-3 mr-1" />
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Rekening | Bank BRI" />
            <Breadcrumb items={[{ label: "Rekening" }]} />

            {/* Hero Section with Animated Background */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Rekening
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua rekening nasabah Bank BRI
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {accounts.length} Rekening Terdaftar
                            </span>
                            <span className="inline-flex items-center rounded-full bg-green-700/40 px-2.5 py-1 text-xs font-medium text-white">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {
                                    accounts.filter(
                                        (acc) =>
                                            acc.status.toLowerCase() ===
                                            "active"
                                    ).length
                                }{" "}
                                Rekening Aktif
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                {/* Search and filter section */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-gray-200 pl-10 pr-10 focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm shadow-sm"
                                placeholder="Cari rekening berdasarkan nomor, nama nasabah, atau produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <ListFilter className="h-4 w-4 mr-2 text-[#00529C]" />
                                Filter & Urut
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel (Expandable) */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Urutkan Berdasarkan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={sortField}
                                        onChange={(e) =>
                                            handleSort(e.target.value)
                                        }
                                    >
                                        <option value="account_number">
                                            Nomor Rekening
                                        </option>
                                        <option value="client_name">
                                            Nama Nasabah
                                        </option>
                                        <option value="teller">Teller</option>
                                        <option value="balance">Saldo</option>
                                        <option value="product">
                                            Jenis Produk
                                        </option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arah Urutan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={sortDirection}
                                        onChange={(e) =>
                                            setSortDirection(e.target.value)
                                        }
                                    >
                                        <option value="asc">
                                            Ascending (A-Z / Terendah-Tertinggi)
                                        </option>
                                        <option value="desc">
                                            Descending (Z-A /
                                            Tertinggi-Terendah)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status Rekening
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            Semua Status
                                        </option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">
                                            Tidak Aktif
                                        </option>
                                        <option value="blocked">
                                            Diblokir
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Produk Rekening
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={productFilter}
                                        onChange={(e) =>
                                            setProductFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            Semua Produk
                                        </option>
                                        {uniqueProducts.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        className="bg-[#00529C] hover:bg-[#003b75] text-white px-4 py-2 h-10 text-sm w-full"
                                        onClick={() => setShowFilters(false)}
                                    >
                                        Terapkan Filter
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search results counter */}
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C] mr-2">
                            {filteredAccounts.length}
                        </span>
                        rekening ditemukan
                    </div>
                </div>

                {/* Accounts Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    No.
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("account_number")}
                                >
                                    <div className="flex items-center">
                                        Nomor Rekening
                                        {sortField === "account_number" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("client_name")}
                                >
                                    <div className="flex items-center">
                                        Nasabah
                                        {sortField === "client_name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("teller")}
                                >
                                    <div className="flex items-center">
                                        Teller
                                        {sortField === "teller" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("product")}
                                >
                                    <div className="flex items-center">
                                        Produk
                                        {sortField === "product" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("balance")}
                                >
                                    <div className="flex items-center">
                                        Saldo
                                        {sortField === "balance" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center">
                                        Status
                                        {sortField === "status" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account, index) => (
                                    <tr
                                        key={account.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {account.account_number}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        ID: BRI-A-
                                                        {account.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route(
                                                    "clients.show",
                                                    account.client.id
                                                )}
                                                className="hover:underline"
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {account.client.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        CIF:{" "}
                                                        {account.client.cif}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {account.teller.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center bg-blue-50 rounded-md px-2 py-1">
                                                <div>
                                                    <div className="text-sm font-medium text-[#00529C]">
                                                        {
                                                            account
                                                                .account_product
                                                                .name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-blue-600">
                                                        {
                                                            account
                                                                .account_product
                                                                .code
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(
                                                            account.current_balance,
                                                            account.currency
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Available:{" "}
                                                        {formatCurrency(
                                                            account.available_balance,
                                                            account.currency
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {getStatusBadge(account.status)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <Link
                                                    href={route(
                                                        "accounts.show",
                                                        account.id
                                                    )}
                                                    className="rounded-lg p-2 text-[#00529C] hover:bg-blue-50 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        {searchTerm ||
                                        statusFilter !== "all" ||
                                        productFilter !== "all" ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada rekening yang
                                                    sesuai
                                                </p>
                                                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                                                    Coba gunakan kata kunci lain
                                                    atau kurangi filter
                                                    pencarian
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        clearSearch();
                                                        setStatusFilter("all");
                                                        setProductFilter("all");
                                                    }}
                                                    className="mt-4 inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Hapus Filter
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="rounded-full bg-blue-50 p-4 mb-3">
                                                    <CreditCard className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data rekening
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Belum ada rekening yang
                                                    terdaftar dalam sistem.
                                                    Rekening dapat dibuat
                                                    melalui profil nasabah.
                                                </p>
                                                <Link
                                                    href={route(
                                                        "clients.index"
                                                    )}
                                                >
                                                    <Button className="mt-6 inline-flex items-center rounded-lg bg-[#00529C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-colors duration-200 shadow-sm">
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Lihat Daftar Nasabah
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer info section */}
                {filteredAccounts.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            Menampilkan {filteredAccounts.length} dari{" "}
                            {accounts.length} rekening
                        </div>
                        <div className="flex justify-center">
                            <nav
                                className="inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronRight className="h-4 w-4 transform rotate-180" />
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-[#00529C] hover:bg-blue-100"
                                >
                                    1
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </a>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountsIndex;
