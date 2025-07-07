"use client";

import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { Account, PageProps, AccountTransaction } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import {
    CreditCard,
    User,
    Calendar,
    ChevronLeft,
    ArrowDownUp,
    Receipt,
    BarChart4,
    Info,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { formatCurrency, formatDate, formatShortDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import OverviewTab from "./Partials/OverviewTab";
import TransactionTab from "./Partials/TransactionTab";
import DetailsTab from "./Partials/DetailsTab";

interface AccountsShowProps extends PageProps {
    account: Account;
}

const AccountsShow = () => {
    const { account } = usePage<AccountsShowProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("date");
    const [sortDirection, setSortDirection] = useState("desc");
    const [transactionType, setTransactionType] = useState("all");
    const [chartPeriod, setChartPeriod] = useState("all");
    const [activeTab, setActiveTab] = useState("overview");
    const [activeChartView, setActiveChartView] = useState("balance");
    const [selectedTransaction, setSelectedTransaction] =
        useState<AccountTransaction | null>(null);
    const [dateRange, setDateRange] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null);
    const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null);

    const applyCustomDateRange = () => {
        if (startDate && endDate) {
            setAppliedStartDate(new Date(startDate));
            setAppliedEndDate(new Date(endDate));
        }
    };

    useEffect(() => {
        const today = new Date();
        const getDateOnly = (date: Date) => new Date(date.setHours(0, 0, 0, 0));

        if (dateRange === "today") {
            const todayDate = getDateOnly(today);
            setAppliedStartDate(todayDate);
            setAppliedEndDate(
                new Date(todayDate.getTime() + 24 * 60 * 60 * 1000 - 1)
            );
        } else if (dateRange === "week") {
            const currentDay = today.getDay();
            const diff =
                today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);

            const weekStart = getDateOnly(new Date(today.setDate(diff)));
            const weekEnd = new Date(
                new Date(weekStart).setDate(weekStart.getDate() + 6)
            );
            weekEnd.setHours(23, 59, 59, 999);

            setAppliedStartDate(weekStart);
            setAppliedEndDate(weekEnd);
        } else if (dateRange === "month") {
            const monthStart = getDateOnly(
                new Date(today.getFullYear(), today.getMonth(), 1)
            );
            const monthEnd = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
            );
            monthEnd.setHours(23, 59, 59, 999);

            setAppliedStartDate(monthStart);
            setAppliedEndDate(monthEnd);
        } else if (dateRange === "") {
            setAppliedStartDate(null);
            setAppliedEndDate(null);
            setStartDate("");
            setEndDate("");
        }
    }, [dateRange]);

    // Process transactions to calculate amounts from balance differences
    const processedTransactions = useMemo(() => {
        if (
            !account.account_transactions ||
            account.account_transactions.length === 0
        ) {
            return [];
        }

        // Sort transactions by date (oldest first) for proper calculation
        const sortedTransactions = [...account.account_transactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return sortedTransactions.map((tx, index) => {
            const previousTransaction =
                index > 0 ? sortedTransactions[index - 1] : null;

            // Calculate the amount as the difference between consecutive balances
            const amount = previousTransaction
                ? tx.balance - previousTransaction.balance
                : tx.balance;

            return {
                ...tx,
                previous_balance: previousTransaction
                    ? previousTransaction.balance
                    : 0,
                amount: amount,
                // Use date field instead of created_at for consistency with new schema
                created_at: tx.date,
            };
        });
    }, [account.account_transactions]);

    // Calculate percentage change
    const calculatePercentageChange = (
        newBalance: number,
        previousBalance: number
    ) => {
        if (previousBalance === 0) return newBalance > 0 ? 100 : 0;
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
                className:
                    "text-emerald-600 bg-emerald-50 border border-emerald-200",
                icon: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />,
            };
        } else if (amount < 0) {
            return {
                type: "debit",
                label: "Debit",
                className: "text-rose-600 bg-rose-50 border border-rose-200",
                icon: <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />,
            };
        } else {
            return {
                type: "neutral",
                label: "Tidak Ada Perubahan",
                className: "text-gray-600 bg-gray-50 border border-gray-200",
                icon: <ArrowDownUp className="h-3.5 w-3.5 text-gray-600" />,
            };
        }
    };

    // Calculate transaction statistics
    const transactionStats = useMemo(() => {
        const credits = processedTransactions.filter((tx) => tx.amount > 0);
        const debits = processedTransactions.filter((tx) => tx.amount < 0);

        const totalCredit = credits.reduce((sum, tx) => sum + tx.amount, 0);
        const totalDebit = debits.reduce(
            (sum, tx) => sum + Math.abs(tx.amount),
            0
        );

        // Get the last 30 days transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = processedTransactions.filter(
            (tx) => new Date(tx.date) >= thirtyDaysAgo
        );

        const recentCredits = recentTransactions.filter((tx) => tx.amount > 0);
        const recentDebits = recentTransactions.filter((tx) => tx.amount < 0);

        const recentTotalCredit = recentCredits.reduce(
            (sum, tx) => sum + tx.amount,
            0
        );
        const recentTotalDebit = recentDebits.reduce(
            (sum, tx) => sum + Math.abs(tx.amount),
            0
        );

        return {
            totalTransactions: processedTransactions.length,
            creditCount: credits.length,
            debitCount: debits.length,
            totalCredit,
            totalDebit,
            recentTransactions: recentTransactions.length,
            recentCredits: recentCredits.length,
            recentDebits: recentDebits.length,
            recentTotalCredit,
            recentTotalDebit,
        };
    }, [processedTransactions]);

    const chartData = useMemo(() => {
        const sortedTransactions = [...processedTransactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB;
        });

        // Filter transactions by period if needed
        const filteredTransactions = sortedTransactions.filter((tx) => {
            if (chartPeriod === "all") return true;

            const txDate = new Date(tx.date);
            const today = new Date();

            switch (chartPeriod) {
                case "30d":
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    return txDate >= thirtyDaysAgo;
                case "90d":
                    const ninetyDaysAgo = new Date();
                    ninetyDaysAgo.setDate(today.getDate() - 90);
                    return txDate >= ninetyDaysAgo;
                case "6m":
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(today.getMonth() - 6);
                    return txDate >= sixMonthsAgo;
                case "1y":
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(today.getFullYear() - 1);
                    return txDate >= oneYearAgo;
                default:
                    return true;
            }
        });

        // Map transactions to chart-friendly format
        return filteredTransactions.map((tx) => {
            return {
                date: formatShortDate(tx.date),
                fullDate: tx.date,
                balance: tx.balance,
                amount: tx.amount,
                credit: tx.amount > 0 ? tx.amount : 0,
                debit: tx.amount < 0 ? Math.abs(tx.amount) : 0,
            };
        });
    }, [processedTransactions, chartPeriod]);

    const filteredTransactions = processedTransactions
        .filter((transaction) => {
            const searchMatch =
                searchTerm === "" ||
                formatCurrency(transaction.balance).includes(searchTerm);
            const typeMatch =
                transactionType === "all" ||
                (transactionType === "credit" && transaction.amount > 0) ||
                (transactionType === "debit" && transaction.amount < 0);
            let dateMatch = true;
            if (appliedStartDate && appliedEndDate) {
                const txDate = new Date(transaction.date);
                dateMatch =
                    txDate >= appliedStartDate && txDate <= appliedEndDate;
            }
            return searchMatch && typeMatch && dateMatch;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

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
            <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 overflow-hidden shadow-lg">
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
                                    </div>
                                    <Link
                                        href={route(
                                            "clients.show",
                                            account.client.id
                                        )}
                                    >
                                        <p className="text-blue-100 mt-1 hover:underline hover:text-white transition-colors flex items-center justify-center sm:justify-start">
                                            <User className="h-3.5 w-3.5 mr-1.5" />
                                            Nasabah: {account.client.name}
                                        </p>
                                    </Link>
                                </div>

                                <div className="mt-3 sm:mt-0">
                                    <Link href={route("accounts.index")}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-white border-white/20 bg-white/10 hover:bg-white/20 hover:text-white"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>Kembali</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-400/20 bg-blue-900/30 border-t border-blue-400/20">
                        <div className="p-4 text-center">
                            <p className="text-blue-100 text-sm">
                                Saldo Saat Ini
                            </p>
                            <p className="text-white text-2xl font-bold mt-1">
                                {formatCurrency(
                                    account.current_balance,
                                    account.currency
                                )}
                            </p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-blue-100 text-sm">
                                Saldo Tersedia
                            </p>
                            <p className="text-white text-2xl font-bold mt-1">
                                {formatCurrency(
                                    account.available_balance,
                                    account.currency
                                )}
                            </p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-blue-100 text-sm">Dibuka Pada</p>
                            <p className="text-white text-lg font-medium mt-1 flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                {formatDate(account.opened_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
            >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview" className="text-sm">
                        <BarChart4 className="h-4 w-4 mr-2" />
                        Ringkasan
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="text-sm">
                        <Receipt className="h-4 w-4 mr-2" />
                        Riwayat Saldo
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-sm">
                        <Info className="h-4 w-4 mr-2" />
                        Detail Rekening
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <OverviewTab
                        account={account}
                        processedTransactions={processedTransactions}
                        filteredTransactions={filteredTransactions}
                        chartData={chartData}
                        chartPeriod={chartPeriod}
                        setChartPeriod={setChartPeriod}
                        activeChartView={activeChartView}
                        setActiveChartView={setActiveChartView}
                        setActiveTab={setActiveTab}
                        getTransactionType={getTransactionType}
                    />
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-6">
                    <TransactionTab
                        account={account}
                        filteredTransactions={filteredTransactions}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        sortField={sortField}
                        setSortField={setSortField}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        transactionType={transactionType}
                        setTransactionType={setTransactionType}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        applyCustomDateRange={applyCustomDateRange}
                        selectedTransaction={selectedTransaction}
                        setSelectedTransaction={setSelectedTransaction}
                        calculatePercentageChange={calculatePercentageChange}
                        getTransactionType={getTransactionType}
                    />
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <DetailsTab
                        account={account}
                        processedTransactions={processedTransactions}
                        transactionStats={transactionStats}
                    />
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default AccountsShow;
