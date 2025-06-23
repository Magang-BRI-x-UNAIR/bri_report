"use client";

import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import type { PageProps, Client, Account, AccountTransaction } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    CreditCard,
    FileText,
    User,
    ChevronLeft,
    Calendar,
    DollarSign,
    Building2,
    Clock,
    CheckCircle,
    X,
    AlertCircle,
    Info,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Download,
    Edit,
    Wallet,
    Mail,
    Phone,
    Minus,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface ShowAccountPageProps extends PageProps {
    client: Client;
    account: Account;
}

const AccountShow = () => {
    const { client, account } = usePage<ShowAccountPageProps>().props;
    const [activeTab, setActiveTab] = useState("overview");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return {
                    label: "Aktif",
                    color: "bg-green-100 text-green-800 border-green-200",
                    icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
                };
            case "inactive":
                return {
                    label: "Tidak Aktif",
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: <X className="w-3.5 h-3.5 mr-1" />,
                };
            case "blocked":
                return {
                    label: "Diblokir",
                    color: "bg-red-100 text-red-800 border-red-200",
                    icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
                };
            default:
                return {
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: <Info className="w-3.5 h-3.5 mr-1" />,
                };
        }
    };

    // Calculate transaction changes from balance history
    const getTransactionWithChanges = (transactions: AccountTransaction[]) => {
        if (!transactions || transactions.length === 0) return [];
        const sortedTransactions = [...transactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return sortedTransactions.map((transaction, index) => {
            let amount = 0;
            let previousBalance = 0;

            if (index === 0) {
                amount = transaction.balance;
                previousBalance = 0;
            } else {
                previousBalance = sortedTransactions[index - 1].balance;
                amount = transaction.balance - previousBalance;
            }

            return {
                ...transaction,
                amount,
                previousBalance,
                change: amount,
            };
        });
    };

    // Transaction type badge based on balance change
    const getTransactionTypeBadge = (amount: number) => {
        if (amount > 0) {
            return {
                label: "Kredit",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />,
            };
        } else if (amount < 0) {
            return {
                label: "Debit",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />,
            };
        } else {
            return {
                label: "Tidak Ada Perubahan",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: <Minus className="w-3.5 h-3.5 mr-1" />,
            };
        }
    };

    const statusBadge = getStatusBadge(account.status);

    // Process transactions with calculated changes
    const transactionsWithChanges = getTransactionWithChanges(
        account.account_transactions || []
    );

    // Get recent transactions (5 most recent)
    const recentTransactions = transactionsWithChanges
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // Calculate transaction statistics
    const totalTransactions = transactionsWithChanges.length;
    const totalCredits = transactionsWithChanges
        .filter((tx) => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebits = Math.abs(
        transactionsWithChanges
            .filter((tx) => tx.amount < 0)
            .reduce((sum, tx) => sum + tx.amount, 0)
    );

    return (
        <AuthenticatedLayout>
            <Head
                title={`Rekening ${account.account_number} | ${client.name} | Bank BRI`}
            />

            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Nasabah", href: route("clients.index") },
                        {
                            label: client.name,
                            href: route("clients.show", { client: client.id }),
                        },
                        { label: `Rekening ${account.account_number}` },
                    ]}
                />

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">
                                    Rekening {account.account_number}
                                </h1>
                            </div>
                            <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                Informasi detail rekening nasabah {client.name}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Badge
                                    variant="secondary"
                                    className="bg-blue-800/30 text-white border-blue-700"
                                >
                                    {account.account_product.name}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={`flex items-center ${
                                        account.status === "active"
                                            ? "bg-green-500/20 text-green-50 border-green-500/40"
                                            : account.status === "inactive"
                                            ? "bg-gray-500/20 text-gray-50 border-gray-500/40"
                                            : "bg-red-500/20 text-red-50 border-red-500/40"
                                    }`}
                                >
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white border-white/30"
                                >
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    Nasabah: {client.name}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center space-x-3">
                            <Link
                                href={route("clients.show", {
                                    client: client.id,
                                })}
                            >
                                <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Kembali</span>
                                </Button>
                            </Link>
                            <Link
                                href={route("clients.accounts.edit", {
                                    client: client.id,
                                    account: account.id,
                                })}
                            >
                                <Button className="shadow-md bg-blue-500 hover:bg-blue-600 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="overview" className="gap-1.5">
                            <Info className="h-4 w-4" />
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="gap-1.5">
                            <ArrowUpRight className="h-4 w-4" />
                            Transaksi
                        </TabsTrigger>
                        <TabsTrigger value="details" className="gap-1.5">
                            <FileText className="h-4 w-4" />
                            Detail
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Balance Information Card */}
                        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-green-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="bg-green-100 rounded-md p-1.5">
                                        <Wallet className="h-5 w-5 text-green-600" />
                                    </div>
                                    Informasi Saldo
                                </CardTitle>
                                <CardDescription>
                                    Detail saldo rekening nasabah
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Saldo Saat Ini
                                        </p>
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            {formatCurrency(
                                                account.current_balance,
                                                account.currency
                                            )}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Terakhir diperbarui:{" "}
                                            {formatDate(account.updated_at)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Saldo Tersedia
                                        </p>
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            {formatCurrency(
                                                account.available_balance,
                                                account.currency
                                            )}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Terakhir diperbarui:{" "}
                                            {formatDate(account.updated_at)}
                                        </p>
                                    </div>
                                </div>

                                {totalTransactions > 0 && (
                                    <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    Ringkasan Transaksi
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3 mt-4">
                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Total Transaksi
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {totalTransactions}
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Total Masuk
                                                </p>
                                                <p className="text-lg font-semibold text-green-600">
                                                    +
                                                    {formatCurrency(
                                                        totalCredits,
                                                        account.currency
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Total Keluar
                                                </p>
                                                <p className="text-lg font-semibold text-red-600">
                                                    -
                                                    {formatCurrency(
                                                        totalDebits,
                                                        account.currency
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Basic Account Info Card */}
                        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-blue-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="bg-blue-100 rounded-md p-1.5">
                                        <CreditCard className="h-5 w-5 text-[#00529C]" />
                                    </div>
                                    Informasi Rekening
                                </CardTitle>
                                <CardDescription>
                                    Detail informasi dasar rekening
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Nomor Rekening
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {account.account_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Produk Rekening
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {account.account_product.name} (
                                            {account.account_product.code})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Mata Uang
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {account.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Dibuka Pada
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {formatDate(account.opened_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Status
                                        </p>
                                        <div className="flex items-center">
                                            <Badge
                                                className={statusBadge.color}
                                            >
                                                {statusBadge.icon}
                                                {statusBadge.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Universal Banker
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {account.universal_banker
                                                ? account.universal_banker.name
                                                : "Tidak ada"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Transactions Card */}
                        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="bg-gray-200 rounded-md p-1.5">
                                        <ArrowUpRight className="h-5 w-5 text-gray-700" />
                                    </div>
                                    Transaksi Terbaru
                                </CardTitle>
                                <CardDescription>
                                    5 transaksi terakhir pada rekening ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {recentTransactions.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {recentTransactions.map(
                                            (transaction) => {
                                                const txBadge =
                                                    getTransactionTypeBadge(
                                                        transaction.amount
                                                    );
                                                return (
                                                    <div
                                                        key={transaction.id}
                                                        className="py-3 first:pt-0 last:pb-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <Badge
                                                                    className={
                                                                        txBadge.color
                                                                    }
                                                                >
                                                                    {
                                                                        txBadge.icon
                                                                    }
                                                                    {
                                                                        txBadge.label
                                                                    }
                                                                </Badge>
                                                                <span className="ml-3 text-sm text-gray-600">
                                                                    {formatDate(
                                                                        transaction.date
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className={`text-sm font-medium ${
                                                                    transaction.amount >
                                                                    0
                                                                        ? "text-green-600"
                                                                        : transaction.amount <
                                                                          0
                                                                        ? "text-red-600"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {transaction.amount >
                                                                0
                                                                    ? "+"
                                                                    : ""}
                                                                {transaction.amount !==
                                                                0
                                                                    ? formatCurrency(
                                                                          transaction.amount,
                                                                          account.currency
                                                                      )
                                                                    : "Tidak ada perubahan"}
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            Saldo:{" "}
                                                            {formatCurrency(
                                                                transaction.balance,
                                                                account.currency
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500">
                                            Belum ada transaksi pada rekening
                                            ini.
                                        </p>
                                    </div>
                                )}

                                {recentTransactions.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setActiveTab("transactions")
                                            }
                                        >
                                            Lihat Semua Transaksi
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transactions Tab Content */}
                    <TabsContent value="transactions" className="space-y-6">
                        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-gray-50/50">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <div className="bg-gray-200 rounded-md p-1.5">
                                                <ArrowUpRight className="h-5 w-5 text-gray-700" />
                                            </div>
                                            Riwayat Saldo Rekening
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Riwayat perubahan saldo rekening
                                            berdasarkan tanggal
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                        >
                                            <Filter className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Filter
                                            </span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Unduh
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {transactionsWithChanges.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tanggal
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tipe
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Perubahan
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Saldo Sebelumnya
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Saldo Akhir
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {transactionsWithChanges
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.date
                                                            ).getTime() -
                                                            new Date(
                                                                a.date
                                                            ).getTime()
                                                    )
                                                    .map((transaction) => {
                                                        const txBadge =
                                                            getTransactionTypeBadge(
                                                                transaction.amount
                                                            );
                                                        return (
                                                            <tr
                                                                key={
                                                                    transaction.id
                                                                }
                                                                className="hover:bg-blue-50/40"
                                                            >
                                                                <td className="px-4 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {formatDate(
                                                                            transaction.date
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 whitespace-nowrap">
                                                                    <Badge
                                                                        className={
                                                                            txBadge.color
                                                                        }
                                                                    >
                                                                        {
                                                                            txBadge.icon
                                                                        }
                                                                        {
                                                                            txBadge.label
                                                                        }
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                                    <div
                                                                        className={`font-medium ${
                                                                            transaction.amount >
                                                                            0
                                                                                ? "text-green-600"
                                                                                : transaction.amount <
                                                                                  0
                                                                                ? "text-red-600"
                                                                                : "text-gray-600"
                                                                        }`}
                                                                    >
                                                                        {transaction.amount >
                                                                        0
                                                                            ? "+"
                                                                            : ""}
                                                                        {transaction.amount !==
                                                                        0
                                                                            ? formatCurrency(
                                                                                  transaction.amount,
                                                                                  account.currency
                                                                              )
                                                                            : "Tidak ada perubahan"}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">
                                                                        {formatCurrency(
                                                                            transaction.previousBalance,
                                                                            account.currency
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                                    <div className="font-medium text-gray-900">
                                                                        {formatCurrency(
                                                                            transaction.balance,
                                                                            account.currency
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                            <CreditCard className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                            Belum Ada Riwayat Saldo
                                        </h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Rekening ini belum memiliki riwayat
                                            perubahan saldo.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Detail Tab Content - Keep the existing detail tab content */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Account Information */}
                            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                                <CardHeader className="bg-gray-50/50">
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-md p-1.5">
                                            <CreditCard className="h-5 w-5 text-gray-700" />
                                        </div>
                                        Informasi Rekening
                                    </CardTitle>
                                    <CardDescription>
                                        Detail lengkap rekening
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    ID Rekening
                                                </p>
                                                <p className="font-mono text-sm mt-1">
                                                    {account.id}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Nomor Rekening
                                                </p>
                                                <p className="font-medium mt-1">
                                                    {account.account_number}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Produk Rekening
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 border-blue-200 text-blue-700"
                                                >
                                                    {
                                                        account.account_product
                                                            .code
                                                    }
                                                </Badge>
                                                <span className="ml-2 font-medium">
                                                    {
                                                        account.account_product
                                                            .name
                                                    }
                                                </span>
                                            </div>
                                            {account.account_product
                                                .description && (
                                                <p className="text-sm mt-1 text-gray-600">
                                                    {
                                                        account.account_product
                                                            .description
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Status
                                            </p>
                                            <div className="mt-1">
                                                <Badge
                                                    className={
                                                        statusBadge.color
                                                    }
                                                >
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Mata Uang
                                                </p>
                                                <p className="font-medium mt-1">
                                                    {account.currency}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Dibuka Pada
                                                </p>
                                                <div className="flex items-center mt-1 text-gray-700">
                                                    <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                                                    {formatDate(
                                                        account.opened_at
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Dibuat Pada
                                                </p>
                                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                    {formatDate(
                                                        account.created_at
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Diperbarui Pada
                                                </p>
                                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                    {formatDate(
                                                        account.updated_at
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Client Information */}
                            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                                <CardHeader className="bg-gray-50/50">
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-md p-1.5">
                                            <User className="h-5 w-5 text-gray-700" />
                                        </div>
                                        Informasi Nasabah
                                    </CardTitle>
                                    <CardDescription>
                                        Detail nasabah pemilik rekening
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col space-y-5">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Nama Nasabah
                                            </p>
                                            <h4 className="text-lg font-medium mt-1">
                                                {client.name}
                                            </h4>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Nomor CIF
                                            </p>
                                            <p className="font-medium mt-1">
                                                {client.cif}
                                            </p>
                                        </div>

                                        {client.email && (
                                            <div className="flex items-start">
                                                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Email
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        {client.email}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {client.phone && (
                                            <div className="flex items-start">
                                                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Telepon
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        {client.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Bergabung Sejak
                                                </p>
                                                <p className="text-sm mt-1">
                                                    {formatDate(
                                                        client.joined_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-gray-100">
                                            <Link
                                                href={route("clients.show", {
                                                    client: client.id,
                                                })}
                                                className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium"
                                            >
                                                <span>
                                                    Lihat detail lengkap nasabah
                                                </span>
                                                <ChevronLeft className="h-4 w-4 rotate-180 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Universal Banker Information */}
                            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                                <CardHeader className="bg-gray-50/50">
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-md p-1.5">
                                            <Building2 className="h-5 w-5 text-gray-700" />
                                        </div>
                                        Universal Banker
                                    </CardTitle>
                                    <CardDescription>
                                        Informasi petugas penanggung jawab
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {account.universal_banker ? (
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Nama Petugas
                                                </p>
                                                <h4 className="font-medium mt-1">
                                                    {
                                                        account.universal_banker
                                                            .name
                                                    }
                                                </h4>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Email
                                                </p>
                                                <p className="mt-1">
                                                    {account.universal_banker
                                                        .email ??
                                                        "Tidak ada email"}
                                                </p>
                                            </div>

                                            {account.universal_banker.phone && (
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Telepon
                                                    </p>
                                                    <p className="mt-1">
                                                        {
                                                            account
                                                                .universal_banker
                                                                .phone
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {account.universal_banker
                                                .branch && (
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Cabang
                                                    </p>
                                                    <div className="mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-blue-50 border-blue-200 text-blue-700"
                                                        >
                                                            {
                                                                account
                                                                    .universal_banker
                                                                    .branch.name
                                                            }
                                                        </Badge>
                                                    </div>
                                                    {account.universal_banker
                                                        .branch.address && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {
                                                                account
                                                                    .universal_banker
                                                                    .branch
                                                                    .address
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-gray-500">
                                                Tidak ada universal banker yang
                                                ditugaskan untuk rekening ini.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        "clients.accounts.edit",
                                                        {
                                                            client: client.id,
                                                            account: account.id,
                                                        }
                                                    )}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Tugaskan Universal Banker
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Account Product Information */}
                            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                                <CardHeader className="bg-gray-50/50">
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-md p-1.5">
                                            <FileText className="h-5 w-5 text-gray-700" />
                                        </div>
                                        Informasi Produk
                                    </CardTitle>
                                    <CardDescription>
                                        Detail produk rekening
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Nama Produk
                                            </p>
                                            <h4 className="font-medium mt-1">
                                                {account.account_product.name}
                                            </h4>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Kode Produk
                                            </p>
                                            <div className="mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 border-blue-200 text-blue-700"
                                                >
                                                    {
                                                        account.account_product
                                                            .code
                                                    }
                                                </Badge>
                                            </div>
                                        </div>

                                        {account.account_product
                                            .description && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Deskripsi
                                                </p>
                                                <p className="mt-1 text-sm text-gray-700">
                                                    {
                                                        account.account_product
                                                            .description
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-3 mt-2 border-t border-gray-100">
                                            <p className="text-sm font-medium text-gray-700">
                                                Fitur dan Manfaat
                                            </p>
                                            <ul className="mt-2 space-y-1.5">
                                                <li className="flex items-start">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                    <span className="text-sm">
                                                        Kemudahan transaksi
                                                        perbankan
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                    <span className="text-sm">
                                                        Layanan internet banking
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                    <span className="text-sm">
                                                        Mobile banking terpadu
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountShow;
