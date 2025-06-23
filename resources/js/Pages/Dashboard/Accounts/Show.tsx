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
    Filter,
    Printer,
    Search,
    X,
    Check,
    FileText,
    BarChart4,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CalendarDays,
    Mail,
    Phone,
    ChevronRight,
    ArrowDown,
    ChevronUp,
    ChevronDown,
    ArrowUp,
    MessageSquare,
    Building2,
    UserX,
    Briefcase,
} from "lucide-react";
import {
    formatCompactCurrency,
    formatCurrency,
    formatDate,
    formatShortDate,
    formatTime,
} from "@/lib/utils";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    BarChart,
    Bar,
    ReferenceLine,
    ComposedChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-800">
                            {label}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDate(data.fullDate)}
                        </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <p className="text-sm font-semibold flex items-center justify-between">
                            <span className="text-gray-600">Saldo:</span>
                            <span className="text-gray-900">
                                {formatCurrency(data.balance)}
                            </span>
                        </p>
                        {data.amount !== 0 && (
                            <p
                                className={`text-xs flex items-center justify-between ${
                                    data.amount > 0
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                }`}
                            >
                                <span className="flex items-center">
                                    {data.amount > 0 ? (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                    )}
                                    Perubahan:
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(Math.abs(data.amount))}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const BarChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                        {label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: entry.color }}
                                    >
                                        {entry.name}:
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-gray-800">
                                    {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const getBalanceDomain = (data: any[]) => {
        if (data.length === 0) return [0, 100];

        const balances = data
            .map((d) => d.balance)
            .filter((b) => b !== undefined && b !== null);
        if (balances.length === 0) return [0, 100];

        const min = Math.min(...balances);
        const max = Math.max(...balances);
        const range = max - min;

        const padding = range * 0.1;
        return [Math.max(0, min - padding), max + padding];
    };

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
                    {/* Charts */}
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Grafik Saldo</CardTitle>
                                <CardDescription>
                                    Perkembangan saldo rekening dari waktu ke
                                    waktu
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Select
                                    value={chartPeriod}
                                    onValueChange={setChartPeriod}
                                >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue placeholder="Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="30d">
                                            30 Hari
                                        </SelectItem>
                                        <SelectItem value="90d">
                                            90 Hari
                                        </SelectItem>
                                        <SelectItem value="6m">
                                            6 Bulan
                                        </SelectItem>
                                        <SelectItem value="1y">
                                            1 Tahun
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={activeChartView}
                                    onValueChange={setActiveChartView}
                                >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue placeholder="Tampilan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="balance">
                                            Saldo
                                        </SelectItem>
                                        <SelectItem value="transactions">
                                            Perubahan
                                        </SelectItem>
                                        <SelectItem value="combined">
                                            Kombinasi
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {processedTransactions.length > 0 ? (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        {activeChartView === "balance" ? (
                                            <AreaChart
                                                data={chartData}
                                                margin={{
                                                    top: 20,
                                                    right: 40,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="colorBalance"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0.1}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f0f0f0"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#888888"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={{
                                                        stroke: "#e5e7eb",
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickFormatter={
                                                        formatCompactCurrency
                                                    }
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={getBalanceDomain(
                                                        chartData
                                                    )}
                                                    padding={{
                                                        top: 20,
                                                        bottom: 20,
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                />
                                                <ReferenceLine
                                                    y={0}
                                                    stroke="#666"
                                                    strokeDasharray="3 3"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="balance"
                                                    name="Saldo"
                                                    stroke="#3b82f6"
                                                    fillOpacity={1}
                                                    fill="url(#colorBalance)"
                                                    strokeWidth={2}
                                                    activeDot={{
                                                        r: 6,
                                                        strokeWidth: 0,
                                                        fill: "#2563eb",
                                                        stroke: "#fff",
                                                    }}
                                                />
                                            </AreaChart>
                                        ) : activeChartView ===
                                          "transactions" ? (
                                            <BarChart
                                                data={chartData}
                                                margin={{
                                                    top: 20,
                                                    right: 40,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                                barGap={8}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="colorCredit"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#10b981"
                                                            stopOpacity={0.2}
                                                        />
                                                    </linearGradient>
                                                    <linearGradient
                                                        id="colorDebit"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#ef4444"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#ef4444"
                                                            stopOpacity={0.2}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f0f0f0"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#888888"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={{
                                                        stroke: "#e5e7eb",
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickFormatter={
                                                        formatCompactCurrency
                                                    }
                                                    tickLine={false}
                                                    axisLine={false}
                                                    padding={{ top: 20 }}
                                                />
                                                <Tooltip
                                                    content={
                                                        <BarChartTooltip />
                                                    }
                                                    cursor={{
                                                        fill: "rgba(0, 0, 0, 0.05)",
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    iconType="circle"
                                                    iconSize={10}
                                                />
                                                <Bar
                                                    dataKey="credit"
                                                    name="Kredit"
                                                    fill="url(#colorCredit)"
                                                    stroke="#10b981"
                                                    strokeWidth={1}
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={40}
                                                />
                                                <Bar
                                                    dataKey="debit"
                                                    name="Debit"
                                                    fill="url(#colorDebit)"
                                                    stroke="#ef4444"
                                                    strokeWidth={1}
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={40}
                                                />
                                            </BarChart>
                                        ) : (
                                            <ComposedChart
                                                data={chartData}
                                                margin={{
                                                    top: 20,
                                                    right: 40,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="colorBalanceLine"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0.1}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f0f0f0"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#888888"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={{
                                                        stroke: "#e5e7eb",
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickFormatter={
                                                        formatCompactCurrency
                                                    }
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={getBalanceDomain(
                                                        chartData
                                                    )}
                                                    padding={{
                                                        top: 20,
                                                        bottom: 20,
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    iconType="circle"
                                                    iconSize={8}
                                                />
                                                <ReferenceLine
                                                    y={0}
                                                    stroke="#666"
                                                    strokeDasharray="3 3"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="balance"
                                                    name="Saldo"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    fillOpacity={0.1}
                                                    fill="url(#colorBalanceLine)"
                                                    dot={{ r: 0 }}
                                                    activeDot={{
                                                        r: 6,
                                                        fill: "#3b82f6",
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="credit"
                                                    name="Kredit"
                                                    fill="rgba(16, 185, 129, 0.6)"
                                                    stroke="#10b981"
                                                    strokeWidth={1}
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={20}
                                                />
                                                <Bar
                                                    dataKey="debit"
                                                    name="Debit"
                                                    fill="rgba(239, 68, 68, 0.6)"
                                                    stroke="#ef4444"
                                                    strokeWidth={1}
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={20}
                                                />
                                            </ComposedChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BarChart4 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        Belum ada data riwayat saldo
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                        Grafik akan ditampilkan setelah ada
                                        riwayat perubahan saldo pada rekening
                                        ini
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Perubahan Saldo Terbaru</CardTitle>
                                <CardDescription>
                                    5 perubahan saldo terakhir pada rekening ini
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href="#"
                                    onClick={() => setActiveTab("transactions")}
                                >
                                    Lihat Semua
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {filteredTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredTransactions
                                        .slice(0, 5)
                                        .map((transaction, index) => {
                                            const txType = getTransactionType(
                                                transaction.amount
                                            );
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                transaction.amount >
                                                                0
                                                                    ? "bg-emerald-50"
                                                                    : transaction.amount <
                                                                      0
                                                                    ? "bg-rose-50"
                                                                    : "bg-gray-50"
                                                            }`}
                                                        >
                                                            {transaction.amount >
                                                            0 ? (
                                                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                                            ) : transaction.amount <
                                                              0 ? (
                                                                <ArrowDownRight className="h-5 w-5 text-rose-600" />
                                                            ) : (
                                                                <ArrowDownUp className="h-5 w-5 text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {txType.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatDate(
                                                                    transaction.date
                                                                )}{" "}
                                                                ·{" "}
                                                                {formatTime(
                                                                    transaction.date
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`font-medium ${
                                                                transaction.amount >
                                                                0
                                                                    ? "text-emerald-600"
                                                                    : transaction.amount <
                                                                      0
                                                                    ? "text-rose-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
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
                                                                      )
                                                                  )
                                                                : "Tidak ada perubahan"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Saldo:{" "}
                                                            {formatCurrency(
                                                                transaction.balance
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        Belum ada riwayat saldo
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-6">
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
                                        variant={
                                            showFilters
                                                ? "secondary"
                                                : "outline"
                                        }
                                        size="sm"
                                        className="h-9 gap-1"
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
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
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {searchTerm && (
                                                <button
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                    onClick={() =>
                                                        setSearchTerm("")
                                                    }
                                                >
                                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <Select
                                                value={transactionType}
                                                onValueChange={
                                                    setTransactionType
                                                }
                                            >
                                                <SelectTrigger className="w-[180px] border-gray-200">
                                                    <div className="flex items-center">
                                                        {transactionType ===
                                                            "all" && (
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
                                                        onValueChange={
                                                            setSortField
                                                        }
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
                                                        onValueChange={
                                                            setSortDirection
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full border-gray-200">
                                                            <SelectValue placeholder="Arah urutan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="desc">
                                                                <ArrowDown className="h-3.5 w-3.5 inline mr-2" />
                                                                Terbaru -
                                                                Terlama
                                                            </SelectItem>
                                                            <SelectItem value="asc">
                                                                <ArrowUp className="h-3.5 w-3.5 inline mr-2" />
                                                                Terlama -
                                                                Terbaru
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
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                                setTransactionType(
                                                                    "all"
                                                                );
                                                                setSortField(
                                                                    "date"
                                                                );
                                                                setSortDirection(
                                                                    "desc"
                                                                );
                                                                setShowFilters(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Reset
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() =>
                                                                setShowFilters(
                                                                    false
                                                                )
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
                                                            dateRange ===
                                                            "today"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() =>
                                                            setDateRange(
                                                                "today"
                                                            )
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
                                                            dateRange ===
                                                            "month"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() =>
                                                            setDateRange(
                                                                "month"
                                                            )
                                                        }
                                                    >
                                                        Bulan Ini
                                                    </Button>
                                                    <Button
                                                        variant={
                                                            dateRange ===
                                                            "custom"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() =>
                                                            setDateRange(
                                                                "custom"
                                                            )
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
                                                                value={
                                                                    startDate
                                                                }
                                                                onChange={(e) =>
                                                                    setStartDate(
                                                                        e.target
                                                                            .value
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
                                                                        e.target
                                                                            .value
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
                                                    .filter(
                                                        (tx) => tx.amount > 0
                                                    )
                                                    .reduce(
                                                        (sum, tx) =>
                                                            sum + tx.amount,
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
                                                    .filter(
                                                        (tx) => tx.amount < 0
                                                    )
                                                    .reduce(
                                                        (sum, tx) =>
                                                            sum +
                                                            Math.abs(tx.amount),
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
                                                                        {
                                                                            txType.icon
                                                                        }
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
                                                                        className={`
                                    ${
                                        percentChange > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : percentChange < 0
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
                                                                        ).toFixed(
                                                                            2
                                                                        )}
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

                                    {/* Pagination (Optional) */}
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
                                                        {
                                                            filteredTransactions.length
                                                        }
                                                    </span>{" "}
                                                    dari{" "}
                                                    <span className="font-medium">
                                                        {
                                                            filteredTransactions.length
                                                        }
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
                                    {(searchTerm ||
                                        transactionType !== "all") && (
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
                                        onClick={() =>
                                            setSelectedTransaction(null)
                                        }
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
                                                    : selectedTransaction.amount <
                                                      0
                                                    ? "bg-rose-100"
                                                    : "bg-gray-100"
                                            }`}
                                        >
                                            {selectedTransaction.amount > 0 ? (
                                                <ArrowUpRight className="h-8 w-8 text-emerald-600" />
                                            ) : selectedTransaction.amount <
                                              0 ? (
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
                                                    : selectedTransaction.amount <
                                                      0
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
                                                {formatDate(
                                                    selectedTransaction.date
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">
                                                Waktu
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatTime(
                                                    selectedTransaction.date
                                                )}
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
                                            onClick={() =>
                                                setSelectedTransaction(null)
                                            }
                                        >
                                            Tutup
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Printer className="h-4 w-4 mr-1.5" />
                                            Cetak
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
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
                                                {account.account_product
                                                    ?.name || "Tabungan"}
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
                                                {account.currency ||
                                                    "Rupiah Indonesia"}
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
                                                    {
                                                        transactionStats.totalTransactions
                                                    }
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-xs font-medium text-gray-500 mb-1">
                                                    Perubahan Terakhir
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {processedTransactions.length >
                                                    0
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
                                                    {
                                                        transactionStats.creditCount
                                                    }{" "}
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
                                                    {
                                                        transactionStats.debitCount
                                                    }{" "}
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
                                <Link
                                    href={route(
                                        "clients.show",
                                        account.client.id
                                    )}
                                >
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
                                                {account.client.name?.charAt(
                                                    0
                                                ) || "N"}
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
                                                              account.client
                                                                  .joined_at
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
                                                        account.client.email ||
                                                        ""
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
                                                        account.client.phone ||
                                                        ""
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
                                        Detail Universal Banker yang ditugaskan
                                        untuk rekening ini
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
                                                        {
                                                            account
                                                                .universal_banker
                                                                .nip
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <span className="text-sm text-gray-600 flex-1">
                                                        Kantor Cabang
                                                    </span>
                                                    <span className="text-sm font-medium flex items-center">
                                                        <Building2 className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                        {account
                                                            .universal_banker
                                                            .branch?.name ||
                                                            "N/A"}
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
                                                            account
                                                                .universal_banker
                                                                .email || ""
                                                        }`}
                                                        className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                                    >
                                                        <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                        {account
                                                            .universal_banker
                                                            .email ||
                                                            "Tidak tersedia"}
                                                    </a>
                                                </div>
                                                <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                                                    <span className="text-sm text-gray-600 flex-1">
                                                        Telepon
                                                    </span>
                                                    <a
                                                        href={`tel:${
                                                            account
                                                                .universal_banker
                                                                .phone || ""
                                                        }`}
                                                        className="text-sm font-medium flex items-center group-hover:text-blue-600 transition-colors"
                                                    >
                                                        <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                        {account
                                                            .universal_banker
                                                            .phone ||
                                                            "Tidak tersedia"}
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
                                                account.universal_banker
                                                    .created_at
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
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default AccountsShow;
