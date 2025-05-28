import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Client, PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    User,
    FileText,
    Mail,
    Phone,
    Calendar,
    Clock,
    CreditCard,
    ChevronLeft,
    ArrowRight,
    DollarSign,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpDown,
    BadgeInfo,
    Eye,
    Plus,
    Users,
    Edit,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";

interface ClientsShowPageProps extends PageProps {
    client: Client;
}

const ClientsShow = () => {
    const { client } = usePage<ClientsShowPageProps>().props;
    const [sortField, setSortField] = useState<string>("opened_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Sort accounts
    const sortedAccounts = [...client.accounts].sort((a, b) => {
        if (sortField === "account_number") {
            return sortDirection === "asc"
                ? a.account_number.localeCompare(b.account_number)
                : b.account_number.localeCompare(a.account_number);
        } else if (sortField === "current_balance") {
            return sortDirection === "asc"
                ? a.current_balance - b.current_balance
                : b.current_balance - a.current_balance;
        } else if (sortField === "opened_at") {
            return sortDirection === "asc"
                ? new Date(a.opened_at).getTime() -
                      new Date(b.opened_at).getTime()
                : new Date(b.opened_at).getTime() -
                      new Date(a.opened_at).getTime();
        } else if (sortField === "status") {
            return sortDirection === "asc"
                ? a.status.localeCompare(b.status)
                : b.status.localeCompare(a.status);
        } else if (sortField === "product") {
            return sortDirection === "asc"
                ? a.account_product.name.localeCompare(b.account_product.name)
                : b.account_product.name.localeCompare(a.account_product.name);
        }
        return 0;
    });

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

    // Format time
    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get account status badge
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

    // Get total balance of all accounts
    const totalBalance = client.accounts.reduce(
        (sum, account) => sum + account.current_balance,
        0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Nasabah: ${client.name} | Bank BRI`} />

            <Breadcrumb
                items={[
                    { label: "Nasabah", href: route("clients.index") },
                    { label: client.name },
                ]}
            />

            {/* Modern Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-white/10">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                {client.name}
                                {client.accounts.length > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-1 text-sm font-medium text-white border border-green-400/30">
                                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                        Nasabah Aktif
                                    </span>
                                )}
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Lihat detail dan kelola informasi rekening nasabah
                            Bank BRI
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                Manajemen Nasabah
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                CIF: {client.cif}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                ID: BRI-C-
                                {client.id.toString().padStart(4, "0")}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Bergabung: {formatDate(client.joined_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("clients.index")}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kembali ke Daftar</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-col mb-8 gap-6">
                {/* Client Info Cards */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Contact Information */}
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Informasi Kontak
                                </h3>
                                <div className="space-y-3">
                                    {client.email ? (
                                        <div className="flex items-start">
                                            <Mail className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Email
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {client.email}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start">
                                            <Mail className="h-4 w-4 text-gray-300 mt-0.5 mr-2" />
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Email
                                                </div>
                                                <div className="text-sm text-gray-400 italic">
                                                    Tidak ada email
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {client.phone ? (
                                        <div className="flex items-start">
                                            <Phone className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Telepon
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start">
                                            <Phone className="h-4 w-4 text-gray-300 mt-0.5 mr-2" />
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Telepon
                                                </div>
                                                <div className="text-sm text-gray-400 italic">
                                                    Tidak ada nomor telepon
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Summary */}
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Ringkasan Rekening
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-0.5">
                                                Jumlah Rekening
                                            </div>
                                            <div className="text-sm text-gray-900 font-medium">
                                                {client.accounts.length}{" "}
                                                rekening
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <DollarSign className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-0.5">
                                                Total Saldo
                                            </div>
                                            <div className="text-sm text-gray-900 font-medium">
                                                {formatCurrency(totalBalance)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date Information */}
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Informasi Tanggal
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-0.5">
                                                Tanggal Bergabung
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(client.joined_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-0.5">
                                                Terakhir Diperbarui
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(client.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                                    <BadgeInfo className="h-4 w-4 mr-1" />
                                    Status Nasabah
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                        <div className="text-sm text-gray-800 font-medium">
                                            {client.accounts.length > 0
                                                ? "Nasabah Aktif"
                                                : "Nasabah Tanpa Rekening"}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <ArrowRight className="h-4 w-4 text-blue-600 mr-2" />
                                        <div className="text-sm text-gray-800">
                                            Lama menjadi nasabah:{" "}
                                            {Math.floor(
                                                (new Date().getTime() -
                                                    new Date(
                                                        client.joined_at
                                                    ).getTime()) /
                                                    (1000 * 60 * 60 * 24 * 30)
                                            )}{" "}
                                            bulan
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounts Section - Without Tabs */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-6">
                    <div className="mb-5 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-[#00529C]" />
                            Daftar Rekening Nasabah ({client.accounts.length})
                        </h3>
                        <Link
                            href={route("clients.accounts.create", client.id)}
                        >
                            <Button
                                className="gap-1.5 bg-[#00529C] hover:bg-[#003b75]"
                                size="sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Rekening</span>
                            </Button>
                        </Link>
                    </div>

                    {client.accounts.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            No.
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                            onClick={() =>
                                                handleSort("account_number")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Nomor Rekening
                                                {sortField ===
                                                    "account_number" && (
                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                            onClick={() =>
                                                handleSort("product")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Produk
                                                {sortField === "product" && (
                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                            onClick={() =>
                                                handleSort("current_balance")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Saldo
                                                {sortField ===
                                                    "current_balance" && (
                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                            onClick={() =>
                                                handleSort("opened_at")
                                            }
                                        >
                                            <div className="flex items-center">
                                                Tanggal Dibuka
                                                {sortField === "opened_at" && (
                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                            onClick={() => handleSort("status")}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {sortField === "status" && (
                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Dibuat Oleh
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {sortedAccounts.map((account, index) => (
                                        <tr
                                            key={account.id}
                                            className="hover:bg-blue-50/40 transition-colors duration-150"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                account.account_number
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {account.currency}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5">
                                                <div className="flex items-center bg-blue-50 px-2.5 py-1.5 rounded-md max-w-fit">
                                                    <div>
                                                        <span className="text-sm font-medium text-blue-800">
                                                            {
                                                                account
                                                                    .account_product
                                                                    .name
                                                            }
                                                        </span>
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
                                            <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                                                <div className="font-medium text-gray-900">
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
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    {formatDate(
                                                        account.opened_at
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                                                {getStatusBadge(account.status)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                                                <div className="flex items-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {
                                                                account
                                                                    .universal_banker
                                                                    .name
                                                            }
                                                        </span>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                            {account
                                                                .universal_banker
                                                                .branch?.name ||
                                                                "No Branch"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={route(
                                                            "clients.accounts.show",
                                                            [
                                                                client.id,
                                                                account.id,
                                                            ]
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            "clients.accounts.edit",
                                                            [
                                                                client.id,
                                                                account.id,
                                                            ]
                                                        )}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-lg border border-gray-100 text-center">
                            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                <CreditCard className="h-8 w-8 text-[#00529C]" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Nasabah Belum Memiliki Rekening
                            </h3>
                            <p className="text-gray-500 max-w-md mb-6">
                                {client.name} belum memiliki rekening yang
                                terdaftar. Klik tombol di bawah untuk membuat
                                rekening baru.
                            </p>
                            <Link
                                href={route(
                                    "clients.accounts.create",
                                    client.id
                                )}
                            >
                                <Button className="bg-[#00529C] hover:bg-[#003b75] gap-1.5">
                                    <Plus className="h-4 w-4" />
                                    <span>Buka Rekening Baru</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ClientsShow;
