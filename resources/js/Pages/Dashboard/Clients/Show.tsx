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
    Wallet,
    Eye,
    Plus,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Tab } from "@headlessui/react";
import { classNames } from "@/lib/utils";

interface ShowProps extends PageProps {
    client: Client;
}

const ClientsShow = () => {
    const { client } = usePage<ShowProps>().props;
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

            <div className="flex flex-col mb-8 gap-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100">
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-[#00529C]/5 to-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start md:items-center gap-4">
                                <div className="p-2.5 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                    <User className="h-8 w-8 text-[#00529C]" />
                                </div>
                                <div>
                                    <div className="inline-flex gap-2 items-center">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {client.name}
                                        </h1>
                                        {client.accounts.length > 0 && (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Nasabah Aktif
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                                        <span>CIF: </span>
                                        <span className="font-medium text-gray-700 ml-1">
                                            {client.cif}
                                        </span>
                                        <span className="mx-2 text-gray-300">
                                            •
                                        </span>
                                        <span>
                                            ID: BRI-C-
                                            {client.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-3">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Bergabung:{" "}
                                            {formatDate(client.joined_at)}
                                        </span>
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            {client.accounts.length} Rekening
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("clients.index")}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Kembali</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Client Info Cards */}
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <Tab.Group>
                        <div className="border-b border-gray-100">
                            <Tab.List className="flex space-x-8 px-6">
                                <Tab
                                    className={({ selected }) =>
                                        classNames(
                                            "py-4 px-1 text-sm font-medium focus:outline-none",
                                            selected
                                                ? "border-b-2 border-[#00529C] text-[#00529C]"
                                                : "text-gray-500 hover:text-gray-700"
                                        )
                                    }
                                >
                                    <div className="flex items-center">
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Daftar Rekening
                                    </div>
                                </Tab>
                            </Tab.List>
                        </div>

                        <Tab.Panels>
                            <Tab.Panel className="p-6">
                                <div className="mb-5 flex justify-between">
                                    <h3 className="font-medium text-gray-900 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2 text-[#00529C]" />
                                        Rekening Nasabah (
                                        {client.accounts.length})
                                    </h3>
                                    <Link href="#">
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
                                    <>
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
                                                                handleSort(
                                                                    "account_number"
                                                                )
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
                                                                handleSort(
                                                                    "product"
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-center">
                                                                Produk
                                                                {sortField ===
                                                                    "product" && (
                                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                                            onClick={() =>
                                                                handleSort(
                                                                    "current_balance"
                                                                )
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
                                                                handleSort(
                                                                    "opened_at"
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-center">
                                                                Tanggal Dibuka
                                                                {sortField ===
                                                                    "opened_at" && (
                                                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-900"
                                                            onClick={() =>
                                                                handleSort(
                                                                    "status"
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-center">
                                                                Status
                                                                {sortField ===
                                                                    "status" && (
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
                                                    {sortedAccounts.map(
                                                        (account, index) => (
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
                                                                                {
                                                                                    account.currency
                                                                                }
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
                                                                    {getStatusBadge(
                                                                        account.status
                                                                    )}
                                                                </td>
                                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                                                                    <div className="flex items-center">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-gray-900">
                                                                                {
                                                                                    account
                                                                                        .teller
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                                                {
                                                                                    account
                                                                                        .teller
                                                                                        .branch
                                                                                        .name
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                                                                    <div className="flex justify-end space-x-2">
                                                                        <Link
                                                                            href="#"
                                                                            className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-50 transition-colors"
                                                                            title="Lihat Detail"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>
                                                                        <Link
                                                                            href="#"
                                                                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                                                            title="Lihat Transaksi"
                                                                        >
                                                                            <ArrowRight className="h-4 w-4" />
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-lg border border-gray-100 text-center">
                                        <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                            <CreditCard className="h-8 w-8 text-[#00529C]" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                            Nasabah Belum Memiliki Rekening
                                        </h3>
                                        <p className="text-gray-500 max-w-md mb-6">
                                            {client.name} belum memiliki
                                            rekening yang terdaftar. Klik tombol
                                            di bawah untuk membuat rekening
                                            baru.
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
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ClientsShow;
