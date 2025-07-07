import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { UniversalBanker, Account } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Eye,
    Activity,
    BarChart3,
    DollarSign,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";

interface AccountTrend {
    account: Account;
    trend: "up" | "down" | "stable";
    trendPercentage: number;
    latestBalance: number;
    previousBalance: number;
    balanceChange: number;
    lastTransactionDate: string;
    riskLevel: "low" | "medium" | "high";
    transactionHistory: Array<{
        date: string;
        balance: number;
    }>;
}

interface AccountTrendTabProps {
    universalBanker: UniversalBanker;
}

const AccountTrendTab: React.FC<AccountTrendTabProps> = ({
    universalBanker,
}) => {
    const [trendFilter, setTrendFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");
    const [sortBy, setSortBy] = useState("trendPercentage");

    console.log(universalBanker);
    // Analisis trend untuk setiap rekening
    const accountTrends = useMemo((): AccountTrend[] => {
        if (!universalBanker?.accounts) return [];

        return universalBanker.accounts
            .map((account) => {
                const transactions = account.account_transactions || [];

                if (transactions.length < 2) {
                    return {
                        account,
                        trend: "stable" as const,
                        trendPercentage: 0,
                        latestBalance:
                            parseFloat(String(account.current_balance)) || 0,
                        previousBalance:
                            parseFloat(String(account.current_balance)) || 0,
                        balanceChange: 0,
                        lastTransactionDate:
                            account.opened_at || new Date().toISOString(),
                        riskLevel: "low" as const,
                        transactionHistory: [],
                    };
                }

                // Sorting transactions berdasarkan tanggal
                const sortedTransactions = [...transactions].sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Ambil 2 transaksi terbaru
                const latestTransaction = sortedTransactions[0];
                const previousTransaction = sortedTransactions[1];

                const latestBalance =
                    parseFloat(String(latestTransaction.balance)) || 0;
                const previousBalance =
                    parseFloat(String(previousTransaction.balance)) || 0;
                const balanceChange = latestBalance - previousBalance;
                const trendPercentage =
                    previousBalance !== 0
                        ? (balanceChange / Math.abs(previousBalance)) * 100
                        : 0;

                // PERBAIKAN: Determine trend berdasarkan balance change, bukan threshold
                let trend: "up" | "down" | "stable";
                if (balanceChange > 0) {
                    trend = "up";
                } else if (balanceChange < 0) {
                    trend = "down";
                } else {
                    trend = "stable"; // Hanya jika benar-benar sama (balanceChange === 0)
                }

                // Risk level tetap berdasarkan persentase perubahan
                let riskLevel: "low" | "medium" | "high";
                if (Math.abs(trendPercentage) < 5) {
                    riskLevel = "low";
                } else if (Math.abs(trendPercentage) < 15) {
                    riskLevel = "medium";
                } else {
                    riskLevel = "high";
                }

                // Prepare transaction history for mini chart (last 10 transactions)
                const transactionHistory = sortedTransactions
                    .slice(0, 10)
                    .reverse()
                    .map((tx) => ({
                        date: tx.date,
                        balance: parseFloat(String(tx.balance)) || 0,
                    }));

                return {
                    account,
                    trend,
                    trendPercentage,
                    latestBalance,
                    previousBalance,
                    balanceChange,
                    lastTransactionDate: latestTransaction.date,
                    riskLevel,
                    transactionHistory,
                };
            })
            .filter((trend) => {
                const matchesTrend =
                    trendFilter === "all" || trend.trend === trendFilter;
                const matchesRisk =
                    riskFilter === "all" || trend.riskLevel === riskFilter;
                return matchesTrend && matchesRisk;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "trendPercentage":
                        return (
                            Math.abs(b.trendPercentage) -
                            Math.abs(a.trendPercentage)
                        );
                    case "balanceChange":
                        return (
                            Math.abs(b.balanceChange) -
                            Math.abs(a.balanceChange)
                        );
                    case "latestBalance":
                        return b.latestBalance - a.latestBalance;
                    default:
                        return 0;
                }
            });
    }, [universalBanker?.accounts, trendFilter, riskFilter, sortBy]);

    // Summary statistics
    const trendStats = useMemo(() => {
        const total = accountTrends.length;
        const upTrends = accountTrends.filter((t) => t.trend === "up").length;
        const downTrends = accountTrends.filter(
            (t) => t.trend === "down"
        ).length;
        const stableTrends = accountTrends.filter(
            (t) => t.trend === "stable"
        ).length;
        const highRisk = accountTrends.filter(
            (t) => t.riskLevel === "high"
        ).length;
        const totalBalanceChange = accountTrends.reduce(
            (sum, t) => sum + t.balanceChange,
            0
        );

        return {
            total,
            upTrends,
            downTrends,
            stableTrends,
            highRisk,
            totalBalanceChange,
        };
    }, [accountTrends]);

    // Get trend icon and color
    const getTrendIcon = (trend: "up" | "down" | "stable") => {
        switch (trend) {
            case "up":
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case "down":
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            case "stable":
                return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: "up" | "down" | "stable") => {
        switch (trend) {
            case "up":
                return "bg-green-100 text-green-800 border-green-200";
            case "down":
                return "bg-red-100 text-red-800 border-red-200";
            case "stable":
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getRiskColor = (risk: "low" | "medium" | "high") => {
        switch (risk) {
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "high":
                return "bg-red-100 text-red-800 border-red-200";
        }
    };

    const getRiskIcon = (risk: "low" | "medium" | "high") => {
        switch (risk) {
            case "low":
                return <CheckCircle className="h-3 w-3" />;
            case "medium":
                return <AlertTriangle className="h-3 w-3" />;
            case "high":
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Rekening Naik
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {trendStats.upTrends}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {trendStats.total > 0
                                        ? `${(
                                              (trendStats.upTrends /
                                                  trendStats.total) *
                                              100
                                          ).toFixed(1)}% dari total`
                                        : "0% dari total"}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Rekening Turun
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {trendStats.downTrends}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {trendStats.total > 0
                                        ? `${(
                                              (trendStats.downTrends /
                                                  trendStats.total) *
                                              100
                                          ).toFixed(1)}% dari total`
                                        : "0% dari total"}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Risiko Tinggi
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {trendStats.highRisk}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Perlu perhatian khusus
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Perubahan
                                </p>
                                <p
                                    className={`text-2xl font-bold ${
                                        trendStats.totalBalanceChange >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {trendStats.totalBalanceChange >= 0
                                        ? "+"
                                        : ""}
                                    {formatCurrency(
                                        trendStats.totalBalanceChange
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Perubahan total saldo
                                </p>
                            </div>
                            <div
                                className={`h-12 w-12 ${
                                    trendStats.totalBalanceChange >= 0
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                } rounded-full flex items-center justify-center`}
                            >
                                <DollarSign
                                    className={`h-6 w-6 ${
                                        trendStats.totalBalanceChange >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Trend Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                                <Activity className="h-5 w-5 text-purple-600" />
                                Analisis Trend Rekening
                            </CardTitle>
                            <CardDescription className="text-purple-700/70">
                                Monitoring perubahan saldo rekening yang
                                dikelola
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={trendFilter}
                                onValueChange={setTrendFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Filter Trend" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Trend
                                    </SelectItem>
                                    <SelectItem value="up">Naik</SelectItem>
                                    <SelectItem value="down">Turun</SelectItem>
                                    <SelectItem value="stable">
                                        Stabil
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={riskFilter}
                                onValueChange={setRiskFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Filter Risiko" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Risiko
                                    </SelectItem>
                                    <SelectItem value="low">Rendah</SelectItem>
                                    <SelectItem value="medium">
                                        Sedang
                                    </SelectItem>
                                    <SelectItem value="high">Tinggi</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="trendPercentage">
                                        Persentase Perubahan
                                    </SelectItem>
                                    <SelectItem value="balanceChange">
                                        Jumlah Perubahan
                                    </SelectItem>
                                    <SelectItem value="latestBalance">
                                        Saldo Terbaru
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Nasabah & Rekening</TableHead>
                                    <TableHead>Saldo Saat Ini</TableHead>
                                    <TableHead>Perubahan</TableHead>
                                    <TableHead>Trend</TableHead>
                                    <TableHead>Risiko</TableHead>
                                    <TableHead>Grafik Mini</TableHead>
                                    <TableHead>Transaksi Terakhir</TableHead>
                                    <TableHead className="w-[80px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountTrends.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <BarChart3 className="h-8 w-8 text-gray-400" />
                                                <p className="text-gray-600">
                                                    Tidak ada data trend
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Rekening membutuhkan minimal
                                                    2 transaksi untuk analisis
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    accountTrends.map((trend) => (
                                        <TableRow
                                            key={trend.account.id}
                                            className="hover:bg-gray-50/50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-purple-700">
                                                            {trend.account.client.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {
                                                                trend.account
                                                                    .client.name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {
                                                                trend.account
                                                                    .account_number
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">
                                                        {formatCurrency(
                                                            trend.latestBalance
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Sebelumnya:{" "}
                                                        {formatCurrency(
                                                            trend.previousBalance
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-right">
                                                    <div
                                                        className={`font-medium ${
                                                            trend.balanceChange >=
                                                            0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {trend.balanceChange >=
                                                        0
                                                            ? "+"
                                                            : ""}
                                                        {formatCurrency(
                                                            trend.balanceChange
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`text-sm ${
                                                            trend.trendPercentage >=
                                                            0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {trend.trendPercentage >=
                                                        0
                                                            ? "+"
                                                            : ""}
                                                        {trend.trendPercentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getTrendColor(
                                                        trend.trend
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {getTrendIcon(
                                                            trend.trend
                                                        )}
                                                        {trend.trend === "up"
                                                            ? "Naik"
                                                            : trend.trend ===
                                                              "down"
                                                            ? "Turun"
                                                            : "Stabil"}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getRiskColor(
                                                        trend.riskLevel
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {getRiskIcon(
                                                            trend.riskLevel
                                                        )}
                                                        {trend.riskLevel ===
                                                        "low"
                                                            ? "Rendah"
                                                            : trend.riskLevel ===
                                                              "medium"
                                                            ? "Sedang"
                                                            : "Tinggi"}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-24 h-8">
                                                    {trend.transactionHistory
                                                        .length > 1 ? (
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <LineChart
                                                                data={
                                                                    trend.transactionHistory
                                                                }
                                                            >
                                                                <Line
                                                                    type="monotone"
                                                                    dataKey="balance"
                                                                    stroke={
                                                                        trend.trend ===
                                                                        "up"
                                                                            ? "#22c55e"
                                                                            : trend.trend ===
                                                                              "down"
                                                                            ? "#ef4444"
                                                                            : "#6b7280"
                                                                    }
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    dot={false}
                                                                />
                                                                <RechartsTooltip
                                                                    content={({
                                                                        payload,
                                                                        label,
                                                                    }) => {
                                                                        if (
                                                                            payload &&
                                                                            payload.length >
                                                                                0
                                                                        ) {
                                                                            return (
                                                                                <div className="bg-white p-2 border rounded shadow-md">
                                                                                    <p className="text-xs">
                                                                                        {formatCurrency(
                                                                                            payload[0]
                                                                                                .value as number
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            <Minus className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(
                                                        trend.lastTransactionDate
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    "accounts.show",
                                                                    trend
                                                                        .account
                                                                        .id
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Lihat detail
                                                                rekening
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountTrendTab;
