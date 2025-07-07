"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import {
    Receipt,
    Filter,
    Search,
    X,
    Check,
    Calendar,
    ArrowDownUp,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    ArrowDown,
    ArrowUp,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Printer,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Account, AccountTransaction } from "@/types";

interface TransactionTabProps {
    account: Account;
    filteredTransactions: Array<
        AccountTransaction & {
            amount: number;
            previous_balance: number;
        }
    >;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    sortField: string;
    setSortField: (value: string) => void;
    sortDirection: string;
    setSortDirection: (value: string) => void;
    transactionType: string;
    setTransactionType: (value: string) => void;
    dateRange: string;
    setDateRange: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    applyCustomDateRange: () => void;
    selectedTransaction: AccountTransaction | null;
    setSelectedTransaction: (transaction: AccountTransaction | null) => void;
    calculatePercentageChange: (
        newBalance: number,
        previousBalance: number
    ) => number;
    getTransactionType: (amount: number) => {
        type: string;
        label: string;
        className: string;
        icon: React.ReactNode;
    };
}

const TransactionTab: React.FC<TransactionTabProps> = ({
    account,
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    transactionType,
    setTransactionType,
    dateRange,
    setDateRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    applyCustomDateRange,
    selectedTransaction,
    setSelectedTransaction,
    calculatePercentageChange,
    getTransactionType,
}) => {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-indigo-800">
                                <Receipt className="h-5 w-5 text-indigo-600" />
                                Riwayat Saldo Rekening
                            </CardTitle>
                            <CardDescription className="text-indigo-700/70">
                                Semua perubahan saldo pada rekening ini
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200 px-3 py-1"
                            >
                                <Receipt className="h-3.5 w-3.5 mr-1.5" />
                                {filteredTransactions.length} Entri
                            </Badge>
                            <Button
                                variant={showFilters ? "secondary" : "outline"}
                                size="sm"
                                className="h-9 gap-1"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {showFilters && (
                                    <ChevronUp className="h-3 w-3 ml-1" />
                                )}
                                {!showFilters && (
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Search & Filters */}
                <CardContent className="pt-4 px-4">
                    <div
                        className={`rounded-lg border transition-all duration-300 mb-4 ${
                            showFilters
                                ? "border-indigo-200 bg-indigo-50/30"
                                : "border-gray-100 bg-gray-50/60"
                        }`}
                    >
                        <div className="p-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative flex-1 min-w-[200px]">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        className="pl-10 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                                        placeholder="Cari berdasarkan saldo..."
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
                                    <Select
                                        value={transactionType}
                                        onValueChange={setTransactionType}
                                    >
                                        <SelectTrigger className="w-[180px] border-gray-200">
                                            <div className="flex items-center">
                                                {transactionType === "all" && (
                                                    <ArrowDownUp className="h-3.5 w-3.5 mr-2 text-gray-500" />
                                                )}
                                                {transactionType ===
                                                    "credit" && (
                                                    <ArrowUpRight className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                                )}
                                                {transactionType ===
                                                    "debit" && (
                                                    <ArrowDownRight className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                                )}
                                                <SelectValue placeholder="Jenis Perubahan" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="all"
                                                className="flex items-center"
                                            >
                                                <div className="flex items-center">
                                                    <ArrowDownUp className="h-3.5 w-3.5 mr-2 text-gray-500" />
                                                    Semua Perubahan
                                                </div>
                                            </SelectItem>
                                            <SelectItem
                                                value="credit"
                                                className="flex items-center"
                                            >
                                                <div className="flex items-center">
                                                    <ArrowUpRight className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                                    Kredit (Naik)
                                                </div>
                                            </SelectItem>
                                            <SelectItem
                                                value="debit"
                                                className="flex items-center"
                                            >
                                                <div className="flex items-center">
                                                    <ArrowDownRight className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                                    Debit (Turun)
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-indigo-200/50 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-indigo-700 mb-1.5">
                                                <ArrowDownUp className="inline h-3.5 w-3.5 mr-1.5" />
                                                Urutkan Berdasarkan
                                            </label>
                                            <Select
                                                value={sortField}
                                                onValueChange={setSortField}
                                            >
                                                <SelectTrigger className="w-full border-gray-200">
                                                    <SelectValue placeholder="Urutkan berdasarkan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="date">
                                                        <Calendar className="h-3.5 w-3.5 inline mr-2" />
                                                        Tanggal
                                                    </SelectItem>
                                                    <SelectItem value="amount">
                                                        <CreditCard className="h-3.5 w-3.5 inline mr-2" />
                                                        Perubahan
                                                    </SelectItem>
                                                    <SelectItem value="balance">
                                                        <Wallet className="h-3.5 w-3.5 inline mr-2" />
                                                        Saldo
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-indigo-700 mb-1.5">
                                                <ArrowUpRight className="inline h-3.5 w-3.5 mr-1.5" />
                                                Arah Urutan
                                            </label>
                                            <Select
                                                value={sortDirection}
                                                onValueChange={setSortDirection}
                                            >
                                                <SelectTrigger className="w-full border-gray-200">
                                                    <SelectValue placeholder="Arah urutan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="desc">
                                                        <ArrowDown className="h-3.5 w-3.5 inline mr-2" />
                                                        Terbaru - Terlama
                                                    </SelectItem>
                                                    <SelectItem value="asc">
                                                        <ArrowUp className="h-3.5 w-3.5 inline mr-2" />
                                                        Terlama - Terbaru
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setTransactionType(
                                                            "all"
                                                        );
                                                        setSortField("date");
                                                        setSortDirection(
                                                            "desc"
                                                        );
                                                        setShowFilters(false);
                                                    }}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Reset
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        setShowFilters(false)
                                                    }
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Terapkan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-wrap items-center gap-3 mt-2">
                                        <div className="font-medium text-xs text-gray-500 flex items-center">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            Rentang Tanggal:
                                        </div>
                                        <div className="flex flex-1 flex-wrap gap-2">
                                            <Button
                                                variant={
                                                    dateRange === "today"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() =>
                                                    setDateRange("today")
                                                }
                                            >
                                                Hari Ini
                                            </Button>
                                            <Button
                                                variant={
                                                    dateRange === "week"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() =>
                                                    setDateRange("week")
                                                }
                                            >
                                                Minggu Ini
                                            </Button>
                                            <Button
                                                variant={
                                                    dateRange === "month"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() =>
                                                    setDateRange("month")
                                                }
                                            >
                                                Bulan Ini
                                            </Button>
                                            <Button
                                                variant={
                                                    dateRange === "custom"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() =>
                                                    setDateRange("custom")
                                                }
                                            >
                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                Kustom
                                            </Button>
                                            {dateRange && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs text-gray-500 hover:text-rose-500"
                                                    onClick={() =>
                                                        setDateRange("")
                                                    }
                                                >
                                                    <X className="h-3.5 w-3.5 mr-1" />
                                                    Reset
                                                </Button>
                                            )}
                                        </div>

                                        {dateRange === "custom" && (
                                            <div className="w-full mt-2 flex flex-wrap gap-2 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) =>
                                                            setStartDate(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-8 text-xs w-auto"
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        hingga
                                                    </span>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) =>
                                                            setEndDate(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-8 text-xs w-auto"
                                                    />
                                                </div>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={
                                                        applyCustomDateRange
                                                    }
                                                >
                                                    <Check className="h-3.5 w-3.5 mr-1" />
                                                    Terapkan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Bar */}
                    {filteredTransactions.length > 0 && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Total Entri:
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="text-gray-800 font-medium"
                                >
                                    {filteredTransactions.length}
                                </Badge>
                            </div>
                            <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-3 flex items-center justify-between">
                                <span className="text-sm text-emerald-700">
                                    Total Kredit:
                                </span>
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                                    {formatCurrency(
                                        filteredTransactions
                                            .filter((tx) => tx.amount > 0)
                                            .reduce(
                                                (sum, tx) => sum + tx.amount,
                                                0
                                            )
                                    )}
                                </Badge>
                            </div>
                            <div className="bg-rose-50 rounded-lg border border-rose-100 p-3 flex items-center justify-between">
                                <span className="text-sm text-rose-700">
                                    Total Debit:
                                </span>
                                <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                                    <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                                    {formatCurrency(
                                        filteredTransactions
                                            .filter((tx) => tx.amount < 0)
                                            .reduce(
                                                (sum, tx) =>
                                                    sum + Math.abs(tx.amount),
                                                0
                                            )
                                    )}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Transaction List */}
                    {filteredTransactions.length > 0 ? (
                        <div className="rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <Calendar className="h-3.5 w-3.5 mr-2" />
                                                    Tanggal
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <ArrowDownUp className="h-3.5 w-3.5 mr-2" />
                                                    Jenis
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <CreditCard className="h-3.5 w-3.5 mr-2" />
                                                    Perubahan
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <Wallet className="h-3.5 w-3.5 mr-2" />
                                                    Saldo Sebelumnya
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <Wallet className="h-3.5 w-3.5 mr-2" />
                                                    Saldo Akhir
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center">
                                                    <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                                                    Perubahan %
                                                </div>
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
                                                        transaction.balance,
                                                        transaction.previous_balance
                                                    );
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                                                        onClick={() =>
                                                            setSelectedTransaction(
                                                                transaction
                                                            )
                                                        }
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {formatDate(
                                                                        transaction.date
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                    {formatTime(
                                                                        transaction.date
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Badge
                                                                variant="outline"
                                                                className={`${txType.className} shadow-sm`}
                                                            >
                                                                {txType.icon}
                                                                <span className="ml-1">
                                                                    {
                                                                        txType.label
                                                                    }
                                                                </span>
                                                            </Badge>
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                                transaction.amount >
                                                                0
                                                                    ? "text-emerald-600"
                                                                    : transaction.amount <
                                                                      0
                                                                    ? "text-rose-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            <div className="flex items-center">
                                                                {transaction.amount >
                                                                0
                                                                    ? "+"
                                                                    : transaction.amount <
                                                                      0
                                                                    ? "-"
                                                                    : ""}
                                                                {transaction.amount !==
                                                                0
                                                                    ? formatCurrency(
                                                                          Math.abs(
                                                                              transaction.amount
                                                                          ),
                                                                          account.currency
                                                                      )
                                                                    : "Tidak ada perubahan"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatCurrency(
                                                                transaction.previous_balance,
                                                                account.currency
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                                {formatCurrency(
                                                                    transaction.balance,
                                                                    account.currency
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Badge
                                                                variant="outline"
                                                                className={`${
                                                                    percentChange >
                                                                    0
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                        : percentChange <
                                                                          0
                                                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                                                }`}
                                                            >
                                                                {percentChange >
                                                                0 ? (
                                                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                                                ) : percentChange <
                                                                  0 ? (
                                                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <ArrowDownUp className="h-3 w-3 mr-1" />
                                                                )}
                                                                {Math.abs(
                                                                    percentChange
                                                                ).toFixed(2)}
                                                                %
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <Button variant="outline" size="sm">
                                        Sebelumnya
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Selanjutnya
                                    </Button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Menampilkan{" "}
                                            <span className="font-medium">
                                                1
                                            </span>{" "}
                                            sampai{" "}
                                            <span className="font-medium">
                                                {filteredTransactions.length}
                                            </span>{" "}
                                            dari{" "}
                                            <span className="font-medium">
                                                {filteredTransactions.length}
                                            </span>{" "}
                                            hasil
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="px-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="px-3"
                                            >
                                                1
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="px-2"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-gray-100 rounded-lg bg-white">
                            <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                <Receipt className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Tidak ada riwayat saldo
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                                {searchTerm || transactionType !== "all"
                                    ? "Tidak ada riwayat saldo yang cocok dengan filter yang dipilih. Coba ubah kriteria pencarian Anda."
                                    : "Rekening ini belum memiliki riwayat perubahan saldo."}
                            </p>
                            {(searchTerm || transactionType !== "all") && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setTransactionType("all");
                                    }}
                                    className="gap-1.5"
                                >
                                    <X className="h-4 w-4" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTransaction(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between">
                            <h3 className="font-medium text-white">
                                Detail Perubahan Saldo
                            </h3>
                            <button
                                className="text-white hover:text-indigo-100"
                                onClick={() => setSelectedTransaction(null)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-6">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                        selectedTransaction.amount > 0
                                            ? "bg-emerald-100"
                                            : selectedTransaction.amount < 0
                                            ? "bg-rose-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {selectedTransaction.amount > 0 ? (
                                        <ArrowUpRight className="h-8 w-8 text-emerald-600" />
                                    ) : selectedTransaction.amount < 0 ? (
                                        <ArrowDownRight className="h-8 w-8 text-rose-600" />
                                    ) : (
                                        <ArrowDownUp className="h-8 w-8 text-gray-600" />
                                    )}
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-500">
                                    Perubahan Saldo
                                </div>
                                <div
                                    className={`text-3xl font-bold mt-1 ${
                                        selectedTransaction.amount > 0
                                            ? "text-emerald-600"
                                            : selectedTransaction.amount < 0
                                            ? "text-rose-600"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {selectedTransaction.amount > 0
                                        ? "+"
                                        : selectedTransaction.amount < 0
                                        ? "-"
                                        : ""}
                                    {selectedTransaction.amount !== 0
                                        ? formatCurrency(
                                              Math.abs(
                                                  selectedTransaction.amount
                                              )
                                          )
                                        : "Tidak ada perubahan"}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Tanggal
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedTransaction.date)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Waktu
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatTime(selectedTransaction.date)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Jenis
                                    </span>
                                    <span className="text-sm font-medium">
                                        {
                                            getTransactionType(
                                                selectedTransaction.amount
                                            ).label
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Saldo Sebelumnya
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(
                                            selectedTransaction.previous_balance
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Saldo Setelah Perubahan
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(
                                            selectedTransaction.balance
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedTransaction(null)}
                                >
                                    Tutup
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Printer className="h-4 w-4 mr-1.5" />
                                    Cetak
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTab;
