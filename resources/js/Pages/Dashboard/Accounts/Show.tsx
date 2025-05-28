"use client";

import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { Account, PageProps, AccountTransaction } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import {
    CreditCard,
    User,
    Calendar,
    ChevronLeft,
    Edit,
    ArrowDownUp,
    Package,
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
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    MoreHorizontal,
    CalendarDays,
    Mail,
    Phone,
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
    Cell,
    PieChart,
    Pie,
    Sector,
    ReferenceLine,
    ComposedChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
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
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [transactionType, setTransactionType] = useState("all");
    const [chartPeriod, setChartPeriod] = useState("all"); // "all", "30d", "90d", "6m", "1y"
    const [activeTab, setActiveTab] = useState("overview");
    const [activeChartView, setActiveChartView] = useState("balance");
    const [selectedTransaction, setSelectedTransaction] =
        useState<AccountTransaction | null>(null);

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
                className:
                    "text-emerald-600 bg-emerald-50 border border-emerald-200",
                icon: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />,
            };
        } else {
            return {
                type: "debit",
                label: "Debit",
                className: "text-rose-600 bg-rose-50 border border-rose-200",
                icon: <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />,
            };
        }
    };

    // Calculate transaction statistics
    const transactionStats = useMemo(() => {
        const credits = account.account_transactions.filter(
            (tx) => tx.amount > 0
        );
        const debits = account.account_transactions.filter(
            (tx) => tx.amount < 0
        );

        const totalCredit = credits.reduce((sum, tx) => sum + tx.amount, 0);
        const totalDebit = debits.reduce(
            (sum, tx) => sum + Math.abs(tx.amount),
            0
        );

        // Get the last 30 days transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = account.account_transactions.filter(
            (tx) => new Date(tx.created_at) >= thirtyDaysAgo
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
            totalTransactions: account.account_transactions.length,
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
    }, [account.account_transactions]);
    const flowDistributionData = useMemo(() => {
        if (account.account_transactions.length === 0) {
            return [];
        }

        const totalCredit = transactionStats.totalCredit;
        const totalDebit = transactionStats.totalDebit;

        // Cek jika kedua nilai adalah 0 untuk menghindari kesalahan
        if (totalCredit === 0 && totalDebit === 0) {
            return [{ name: "Belum ada transaksi", value: 1, fill: "#d1d5db" }];
        }

        return [
            { name: "Kredit", value: totalCredit, fill: "#10b981" },
            { name: "Debit", value: totalDebit, fill: "#ef4444" },
        ];
    }, [account.account_transactions, transactionStats]);

    const renderActiveDonutShape = (props: any) => {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value,
        } = props;

        return (
            <g>
                <text
                    x={cx}
                    y={cy - 15}
                    dy={8}
                    textAnchor="middle"
                    fill="#333"
                    fontSize={16}
                    fontWeight="bold"
                >
                    {payload.name}
                </text>
                <text
                    x={cx}
                    y={cy + 15}
                    textAnchor="middle"
                    fill="#333"
                    fontSize={14}
                    fontWeight="medium"
                >
                    {formatCurrency(value)}
                </text>
                <text
                    x={cx}
                    y={cy + 35}
                    textAnchor="middle"
                    fill="#666"
                    fontSize={12}
                >
                    {`${(percent * 100).toFixed(1)}%`}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 3}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    strokeWidth={0}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                    strokeWidth={0}
                />
            </g>
        );
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return (
                    <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    >
                        <Check className="h-3 w-3 mr-1" />
                        Aktif
                    </Badge>
                );
            case "inactive":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200"
                    >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak Aktif
                    </Badge>
                );
            case "blocked":
                return (
                    <Badge
                        variant="outline"
                        className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Diblokir
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                    >
                        {status}
                    </Badge>
                );
        }
    };

    // Prepare chart data from transactions
    const chartData = useMemo(() => {
        // Sort transactions chronologically
        const sortedTransactions = [...account.account_transactions].sort(
            (a, b) => {
                const dateA = new Date(a.created_at || "").getTime();
                const dateB = new Date(b.created_at || "").getTime();
                return dateA - dateB;
            }
        );

        // Filter transactions by period if needed
        const filteredTransactions = sortedTransactions.filter((tx) => {
            if (chartPeriod === "all") return true;

            const txDate = new Date(tx.created_at);
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
                date: formatShortDate(tx.created_at),
                fullDate: tx.created_at,
                balance: tx.new_balance,
                amount: tx.amount,
                credit: tx.amount > 0 ? tx.amount : 0,
                debit: tx.amount < 0 ? Math.abs(tx.amount) : 0,
            };
        });
    }, [account.account_transactions, chartPeriod]);

    // Prepare monthly transaction data
    const monthlyTransactionData = useMemo(() => {
        const months: Record<string, { credit: number; debit: number }> = {};

        account.account_transactions.forEach((tx) => {
            const date = new Date(tx.created_at);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

            if (!months[monthYear]) {
                months[monthYear] = { credit: 0, debit: 0 };
            }

            if (tx.amount > 0) {
                months[monthYear].credit += tx.amount;
            } else {
                months[monthYear].debit += Math.abs(tx.amount);
            }
        });

        return Object.entries(months)
            .map(([month, data]) => ({
                month,
                credit: data.credit,
                debit: data.debit,
            }))
            .slice(-6); // Get last 6 months
    }, [account.account_transactions]);

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
                                    Transaksi:
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

    const PieChartTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: payload[0].payload.fill }}
                        ></div>
                        <p className="text-sm font-semibold">
                            {payload[0].name}
                        </p>
                    </div>
                    <p className="text-base font-bold text-gray-800">
                        {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {(
                            (payload[0].value /
                                (transactionStats.totalCredit +
                                    transactionStats.totalDebit)) *
                            100
                        ).toFixed(1)}
                        % dari total
                    </p>
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

    const renderActiveShape = (props: any) => {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value,
        } = props;

        return (
            <g>
                <text
                    x={cx}
                    y={cy}
                    dy={-20}
                    textAnchor="middle"
                    fill="#888"
                    className="text-xs"
                >
                    {payload.name}
                </text>
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    fill="#333"
                    className="text-base font-semibold"
                >
                    {formatCompactCurrency(value)}
                </text>
                <text
                    x={cx}
                    y={cy}
                    dy={20}
                    textAnchor="middle"
                    fill="#888"
                    className="text-xs"
                >
                    {`${(percent * 100).toFixed(1)}%`}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 5}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
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
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-800/30 text-white border-blue-700/50 hover:bg-blue-800/30"
                                        >
                                            BRI-A-
                                            {account.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </Badge>
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
                        Transaksi
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
                                    Perkembangan saldo rekening
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
                                            Transaksi
                                        </SelectItem>
                                        <SelectItem value="combined">
                                            Kombinasi
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {account.account_transactions.length > 0 ? (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        {activeChartView === "balance" ? (
                                            <AreaChart
                                                data={chartData}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 10,
                                                    bottom: 0,
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
                                                    domain={["auto", "auto"]}
                                                    padding={{ top: 20 }}
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
                                                    top: 10,
                                                    right: 30,
                                                    left: 10,
                                                    bottom: 0,
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
                                                    top: 10,
                                                    right: 30,
                                                    left: 10,
                                                    bottom: 0,
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
                                                    domain={["auto", "auto"]}
                                                    padding={{ top: 20 }}
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
                                        Belum ada data transaksi
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                        Grafik akan ditampilkan setelah ada
                                        transaksi pada rekening ini
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Transaksi Terbaru</CardTitle>
                                <CardDescription>
                                    5 transaksi terakhir pada rekening ini
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
                                                                    : "bg-rose-50"
                                                            }`}
                                                        >
                                                            {transaction.amount >
                                                            0 ? (
                                                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                                            ) : (
                                                                <ArrowDownRight className="h-5 w-5 text-rose-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {transaction.amount >
                                                                0
                                                                    ? "Kredit"
                                                                    : "Debit"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatDate(
                                                                    transaction.created_at
                                                                )}{" "}
                                                                ·{" "}
                                                                {formatTime(
                                                                    transaction.created_at
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
                                                                    : "text-rose-600"
                                                            }`}
                                                        >
                                                            {transaction.amount >
                                                            0
                                                                ? "+"
                                                                : "-"}
                                                            {formatCurrency(
                                                                Math.abs(
                                                                    transaction.amount
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Saldo:{" "}
                                                            {formatCurrency(
                                                                transaction.new_balance
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
                                        Belum ada transaksi
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Riwayat Transaksi</CardTitle>
                                <CardDescription>
                                    Semua transaksi pada rekening ini
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                                >
                                    {filteredTransactions.length} Transaksi
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-1"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="flex items-center">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Cetak Transaksi
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center">
                                            <Download className="h-4 w-4 mr-2" />
                                            Ekspor ke Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center">
                                            <Download className="h-4 w-4 mr-2" />
                                            Ekspor ke PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        {/* Search & Filters */}
                        <CardContent className="pt-4">
                            <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4 mb-4">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Search className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <Input
                                            type="text"
                                            className="pl-10"
                                            placeholder="Cari transaksi..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
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
                                            onValueChange={setTransactionType}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Jenis Transaksi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Semua Transaksi
                                                </SelectItem>
                                                <SelectItem value="credit">
                                                    Kredit (Masuk)
                                                </SelectItem>
                                                <SelectItem value="debit">
                                                    Debit (Keluar)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {showFilters && (
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Urutkan
                                            </label>
                                            <Select
                                                value={sortField}
                                                onValueChange={setSortField}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Urutkan berdasarkan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="created_at">
                                                        Tanggal
                                                    </SelectItem>
                                                    <SelectItem value="amount">
                                                        Jumlah
                                                    </SelectItem>
                                                    <SelectItem value="balance">
                                                        Saldo
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Arah Urutan
                                            </label>
                                            <Select
                                                value={sortDirection}
                                                onValueChange={setSortDirection}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Arah urutan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="desc">
                                                        Terbaru - Terlama
                                                    </SelectItem>
                                                    <SelectItem value="asc">
                                                        Terlama - Terbaru
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                className="w-full"
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
                            {filteredTransactions.length > 0 ? (
                                <div className="rounded-lg border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
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
                                                                className="hover:bg-gray-50 cursor-pointer"
                                                                onClick={() =>
                                                                    setSelectedTransaction(
                                                                        transaction
                                                                    )
                                                                }
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
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            txType.className
                                                                        }
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
                                                                            : "text-rose-600"
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
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`
                                                                        ${
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
                                </div>
                            ) : (
                                <div className="py-8 text-center border border-gray-100 rounded-lg">
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Account Info Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Informasi Rekening</CardTitle>
                                    {getStatusBadge(account.status)}
                                </div>
                                <CardDescription>
                                    Detail rekening nasabah
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="mb-6">
                                    <div className="h-24 w-24 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="h-12 w-12 text-blue-600" />
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
                                                <p className="text-sm text-blue-600 mt-1 hover:underline">
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
                                                Kode:{" "}
                                                {account.account_product.code}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Wallet className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
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
                                        <Wallet className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
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
                                                UniversalBanker
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.universal_banker.name}
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
                                                {account.universal_banker.branch
                                                    ?.name || "Pusat"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <CalendarDays className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
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
                                        <Button size="sm" className="gap-1.5">
                                            <Edit className="h-4 w-4" />
                                            Ubah Status
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Client Info Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Informasi Nasabah</CardTitle>
                                <CardDescription>
                                    Detail nasabah pemilik rekening
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Nama Lengkap
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.client.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Nomor CIF
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.client.cif}
                                            </p>
                                        </div>
                                    </div>

                                    {account.client.email && (
                                        <div className="flex items-start">
                                            <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Email
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {account.client.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {account.client.phone && (
                                        <div className="flex items-start">
                                            <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Telepon
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {account.client.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start">
                                        <CalendarDays className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Bergabung Sejak
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {formatDate(
                                                    account.client.joined_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Rekening Lainnya
                                    </h3>
                                    {account.client.accounts &&
                                    account.client.accounts.length > 1 ? (
                                        <div className="space-y-3">
                                            {account.client.accounts
                                                .filter(
                                                    (acc) =>
                                                        acc.id !== account.id
                                                )
                                                .map((acc, index) => (
                                                    <Link
                                                        key={index}
                                                        href={route(
                                                            "accounts.show",
                                                            acc.id
                                                        )}
                                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                                <CreditCard className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        acc.account_number
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {acc
                                                                        .account_product
                                                                        ?.name ||
                                                                        "Rekening"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Nasabah tidak memiliki rekening
                                            lain.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Info Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Informasi Produk</CardTitle>
                                <CardDescription>
                                    Detail produk rekening
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Package className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Nama Produk
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.account_product.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Kode Produk
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.account_product.code}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Info className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Deskripsi
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {account.account_product
                                                    .description ||
                                                    "Tidak ada deskripsi"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                        <Info className="h-4 w-4 mr-1.5" />
                                        Fitur dan Manfaat
                                    </h3>
                                    <ul className="space-y-2 text-sm text-blue-700">
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 mr-1.5 mt-0.5 text-blue-600" />
                                            <span>
                                                Bebas biaya administrasi bulanan
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 mr-1.5 mt-0.5 text-blue-600" />
                                            <span>
                                                Akses internet dan mobile
                                                banking
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 mr-1.5 mt-0.5 text-blue-600" />
                                            <span>
                                                Kartu ATM/Debit dengan fitur
                                                lengkap
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Transaction Detail Modal would go here */}
        </AuthenticatedLayout>
    );
};

export default AccountsShow;
