"use client";

import { useState, useMemo, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import type { User, Client } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    UserCircle,
    Mail,
    Building2,
    ChevronLeft,
    Users,
    CreditCard,
    BadgeCheck,
    DollarSign,
    Search,
    Eye,
    Phone,
    XCircle,
    Filter,
    ArrowUpDown,
    Clock,
    BadgeDollarSign,
    LineChart,
    CalendarDays,
    CalendarIcon,
    ArrowUp,
    ArrowDown,
    BarChart3,
    PieChart,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/Components/ui/calendar";
import { isValid } from "date-fns";

import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/utils";

// Date Range Picker Component
const DateRangePicker = ({
    dateRange,
    onDateRangeChange,
    align = "start",
}: {
    dateRange: { from: Date; to: Date | undefined };
    onDateRangeChange: (range: { from: Date; to: Date | undefined }) => void;
    align?: "start" | "center" | "end";
}) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border rounded-md px-3 py-1.5 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                    {format(dateRange.from, "dd MMM yyyy")} -{" "}
                    {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : ""}
                </span>
            </div>
        </div>
    );
};

interface AccountStats {
    total: number;
    byStatus: Record<string, number>;
    byAccountProduct: Record<string, number>;
    totalBalance: number;
}

interface DailyBalance {
    [x: string]: number | string;
    date: string;
    totalBalance: number;
    formattedDate: string;
    change: number;
    transactionCount: number;
}

interface ShowProps extends PageProps {
    universal_banker: User;
    accountStats: AccountStats;
    clients: Client[];
    recentAccounts: any[];
    dailyBalances: DailyBalance[];
    highestBalance: number;
    lowestBalance: number;
    totalChange: number;
    percentageChange: number;
}

const UniversalBankersShow = () => {
    const {
        universal_banker,
        accountStats,
        clients,
        dailyBalances,
        highestBalance,
        lowestBalance,
        totalChange,
        percentageChange,
    } = usePage<ShowProps>().props;

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [sortBy, setSortBy] = useState("client.name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentTab, setCurrentTab] = useState("overview");

    // Balance history chart state
    const [timeFilter, setTimeFilter] = useState("week");
    const [dateRange, setDateRange] = useState<{
        from: Date | null;
        to: Date | null;
    }>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
    });

    // Filter balance data based on date range
    const filteredBalanceData = useMemo(() => {
        // Check if dailyBalances exists in the props
        if (!dailyBalances || dailyBalances.length === 0) {
            return [];
        }

        // Handle the case when date range is invalid
        if (!dateRange.from || !dateRange.to) {
            return dailyBalances;
        }

        return dailyBalances
            .filter((entry) => {
                const entryDate = new Date(entry.date);
                return (
                    isValid(entryDate) &&
                    (dateRange.from ? entryDate >= dateRange.from : true) &&
                    entryDate <= (dateRange.to || new Date())
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );
    }, [dailyBalances, dateRange]);

    // Handle time filter change
    const handleTimeFilterChange = (value: string) => {
        setTimeFilter(value);
        const today = new Date();
        let newStartDate;
        const newEndDate = new Date();

        switch (value) {
            case "week":
                newStartDate = new Date(today.getTime());
                newStartDate.setDate(today.getDate() - 7);
                break;
            case "month":
                newStartDate = new Date(today.getTime());
                newStartDate.setMonth(today.getMonth() - 1);
                break;
            case "quarter":
                newStartDate = new Date(today.getTime());
                newStartDate.setMonth(today.getMonth() - 3);
                break;
            case "year":
                newStartDate = new Date(today.getTime());
                newStartDate.setFullYear(today.getFullYear() - 1);
                break;
            case "custom":
                // Keep the current date range for custom
                return;
            default:
                newStartDate = new Date(today.getTime());
                newStartDate.setDate(today.getDate() - 7);
        }

        setDateRange({
            from: newStartDate,
            to: newEndDate,
        });
    };

    // Update dateRange when custom dates change
    useEffect(() => {
        if (timeFilter === "custom" && dateRange.from && dateRange.to) {
            // This effect is intentionally left empty as it's just for updating dateRange
        }
    }, [timeFilter, dateRange]);

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200";
            case "inactive":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "blocked":
                return "bg-red-100 text-red-800 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    // Get unique clients
    const uniqueClients = useMemo(() => {
        return clients || [];
    }, [clients]);

    // Filter and sort accounts
    const filteredAccounts = useMemo(() => {
        return universal_banker.accounts
            .filter((account) => {
                // Search filter
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    searchQuery === "" ||
                    account.account_number
                        .toLowerCase()
                        .includes(searchLower) ||
                    account.client.name.toLowerCase().includes(searchLower) ||
                    account.client.cif.toLowerCase().includes(searchLower) ||
                    (account.client.email &&
                        account.client.email
                            .toLowerCase()
                            .includes(searchLower));

                // Status filter
                const matchesStatus =
                    statusFilter === "all" || account.status === statusFilter;

                // Product filter
                const matchesProduct =
                    productFilter === "all" ||
                    account.account_product.name === productFilter;

                return matchesSearch && matchesStatus && matchesProduct;
            })
            .sort((a, b) => {
                // Handle sorting
                let valueA, valueB;

                // Get the values to compare based on sortBy
                if (sortBy === "client.name") {
                    valueA = a.client.name;
                    valueB = b.client.name;
                } else if (sortBy === "account_number") {
                    valueA = a.account_number;
                    valueB = b.account_number;
                } else if (sortBy === "current_balance") {
                    valueA = a.current_balance;
                    valueB = b.current_balance;
                } else if (sortBy === "account_product.name") {
                    valueA = a.account_product.name;
                    valueB = b.account_product.name;
                } else if (sortBy === "status") {
                    valueA = a.status;
                    valueB = b.status;
                } else {
                    valueA = a.opened_at;
                    valueB = b.opened_at;
                }

                // Compare the values
                if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
                if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
    }, [
        universal_banker.accounts,
        searchQuery,
        statusFilter,
        productFilter,
        sortBy,
        sortOrder,
    ]);

    // Get unique product types for filter
    const accountProducts = useMemo(() => {
        const types = new Set<string>();
        universal_banker.accounts.forEach((account) => {
            types.add(account.account_product.name);
        });
        return Array.from(types);
    }, [universal_banker.accounts]);

    // Get unique statuses for filter
    const statuses = useMemo(() => {
        const statusSet = new Set<string>();
        universal_banker.accounts.forEach((account) => {
            statusSet.add(account.status);
        });
        return Array.from(statusSet);
    }, [universal_banker.accounts]);

    // Handle sort change
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setProductFilter("all");
    };

    // Calculate percentage
    const calculatePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    // Calculate balance change from filtered data
    const filteredBalanceChange = useMemo(() => {
        if (filteredBalanceData.length < 2) return 0;

        const firstBalance = filteredBalanceData[0].totalBalance;
        const lastBalance =
            filteredBalanceData[filteredBalanceData.length - 1].totalBalance;

        return lastBalance - firstBalance;
    }, [filteredBalanceData]);

    // Calculate percentage change from filtered data
    const filteredPercentageChange = useMemo(() => {
        if (
            filteredBalanceData.length < 2 ||
            filteredBalanceData[0].totalBalance === 0
        )
            return 0;

        return (
            (filteredBalanceChange / filteredBalanceData[0].totalBalance) * 100
        );
    }, [filteredBalanceData, filteredBalanceChange]);

    // Calculate highest and lowest balances from filtered data
    const filteredHighestBalance = useMemo(() => {
        if (filteredBalanceData.length === 0) return highestBalance;
        return Math.max(
            ...filteredBalanceData.map((entry) => entry.totalBalance)
        );
    }, [filteredBalanceData, highestBalance]);

    const filteredLowestBalance = useMemo(() => {
        if (filteredBalanceData.length === 0) return lowestBalance;
        return Math.min(
            ...filteredBalanceData.map((entry) => entry.totalBalance)
        );
    }, [filteredBalanceData, lowestBalance]);

    return (
        <AuthenticatedLayout>
            <Head
                title={`Detail UniversalBanker: ${universal_banker.name} | Bank BRI`}
            />

            <Breadcrumb
                items={[
                    {
                        label: "UniversalBanker",
                        href: route("universalBankers.index"),
                    },
                    { label: universal_banker.name },
                ]}
            />

            {/* Hero Section with UniversalBanker Information */}
            <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="relative">
                            <div className="h-24 w-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl flex items-center justify-center">
                                <UserCircle className="h-16 w-16 text-white" />
                            </div>
                            {universal_banker.email_verified_at && (
                                <div className="absolute -right-2 -bottom-2 bg-green-500 rounded-full p-1.5 border-2 border-white">
                                    <BadgeCheck className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-white">
                                            {universal_banker.name}
                                        </h1>
                                        <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white border border-white/20">
                                            ID: BRI-T-
                                            {universal_banker.id
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-blue-100">
                                        <div className="flex items-center">
                                            <Mail className="mr-1.5 h-4 w-4 flex-shrink-0 opacity-70" />
                                            <span>
                                                {universal_banker.email}
                                            </span>
                                        </div>
                                        {universal_banker.branch && (
                                            <div className="flex items-center">
                                                <Building2 className="mr-1.5 h-4 w-4 flex-shrink-0 opacity-70" />
                                                <span>
                                                    {
                                                        universal_banker.branch
                                                            .name
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={route("universalBankers.index")}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-white bg-[#F37021] hover:bg-white/20 hover:text-white border-white/20"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Kembali
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/20 pt-6">
                        <div className="text-center">
                            <p className="text-sm text-blue-100">
                                Total Nasabah
                            </p>
                            <p className="text-2xl font-bold text-white mt-1 flex items-center justify-center">
                                <Users className="h-5 w-5 mr-2 opacity-80" />
                                {uniqueClients.length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-blue-100">
                                Total Rekening
                            </p>
                            <p className="text-2xl font-bold text-white mt-1 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 mr-2 opacity-80" />
                                {accountStats.total}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-blue-100">
                                Rekening Aktif
                            </p>
                            <p className="text-2xl font-bold text-white mt-1 flex items-center justify-center">
                                <BadgeCheck className="h-5 w-5 mr-2 opacity-80" />
                                {accountStats.byStatus?.active || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-blue-100">Total Saldo</p>
                            <p className="text-2xl font-bold text-white mt-1 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 mr-2 opacity-80" />
                                {
                                    formatCurrency(
                                        accountStats.totalBalance
                                    ).split(",")[0]
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main tabs navigation */}
            <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="space-y-6"
            >
                <div className="bg-white rounded-lg border shadow-sm p-1.5 flex overflow-x-auto">
                    <TabsList className="inline-flex h-10 bg-muted/20 p-1 w-full">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-1.5"
                        >
                            <LineChart className="h-4 w-4" />
                            <span>Overview</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="clients"
                            className="flex items-center gap-1.5"
                        >
                            <Users className="h-4 w-4" />
                            <span>Nasabah</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="accounts"
                            className="flex items-center gap-1.5"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span>Rekening</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="stats"
                            className="flex items-center gap-1.5"
                        >
                            <BadgeDollarSign className="h-4 w-4" />
                            <span>Statistik</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Overview Tab Content */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Balance History Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <LineChart className="h-5 w-5 text-[#00529C]" />
                                        Perkembangan Total Saldo
                                    </CardTitle>
                                    <CardDescription>
                                        Tracking perubahan total saldo rekening
                                        yang ditangani oleh{" "}
                                        {universal_banker.name}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={timeFilter}
                                        onValueChange={handleTimeFilterChange}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Pilih Periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">
                                                7 Hari Terakhir
                                            </SelectItem>
                                            <SelectItem value="month">
                                                30 Hari Terakhir
                                            </SelectItem>
                                            <SelectItem value="quarter">
                                                3 Bulan Terakhir
                                            </SelectItem>
                                            <SelectItem value="year">
                                                1 Tahun Terakhir
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                Kustom
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {timeFilter === "custom" && (
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 gap-1"
                                                    >
                                                        <CalendarDays className="h-4 w-4" />
                                                        {dateRange.from
                                                            ? format(
                                                                  dateRange.from,
                                                                  "dd MMM yyyy",
                                                                  { locale: id }
                                                              )
                                                            : "Pilih tanggal"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={
                                                            dateRange.from ||
                                                            undefined
                                                        }
                                                        onSelect={(date) =>
                                                            setDateRange({
                                                                ...dateRange,
                                                                from:
                                                                    date ||
                                                                    null,
                                                            })
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <span className="text-sm text-gray-500">
                                                -
                                            </span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 gap-1"
                                                    >
                                                        <CalendarDays className="h-4 w-4" />
                                                        {dateRange.to
                                                            ? format(
                                                                  dateRange.to,
                                                                  "dd MMM yyyy",
                                                                  { locale: id }
                                                              )
                                                            : "Pilih tanggal"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={
                                                            dateRange.to ||
                                                            undefined
                                                        }
                                                        onSelect={(date) =>
                                                            setDateRange({
                                                                ...dateRange,
                                                                to:
                                                                    date ||
                                                                    null,
                                                            })
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>
                                            Saldo Saat Ini
                                        </CardDescription>
                                        <CardTitle className="text-xl flex items-center">
                                            <DollarSign className="h-5 w-5 mr-2 text-[#00529C]" />
                                            {formatCurrency(
                                                accountStats.totalBalance
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">
                                            Total saldo seluruh rekening
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>
                                            Perubahan
                                        </CardDescription>
                                        <CardTitle
                                            className={`text-xl flex items-center ${
                                                filteredBalanceChange >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {filteredBalanceChange >= 0 ? (
                                                <ArrowUp className="h-5 w-5 mr-2" />
                                            ) : (
                                                <ArrowDown className="h-5 w-5 mr-2" />
                                            )}
                                            {formatCurrency(
                                                Math.abs(filteredBalanceChange)
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">
                                            {filteredBalanceChange >= 0
                                                ? "Kenaikan"
                                                : "Penurunan"}{" "}
                                            sebesar{" "}
                                            {filteredPercentageChange.toFixed(
                                                2
                                            )}
                                            %
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>
                                            Saldo Tertinggi
                                        </CardDescription>
                                        <CardTitle className="text-xl flex items-center text-green-600">
                                            <DollarSign className="h-5 w-5 mr-2" />
                                            {formatCurrency(
                                                filteredHighestBalance
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">
                                            Dalam periode yang dipilih
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>
                                            Saldo Terendah
                                        </CardDescription>
                                        <CardTitle className="text-xl flex items-center text-amber-600">
                                            <DollarSign className="h-5 w-5 mr-2" />
                                            {formatCurrency(
                                                filteredLowestBalance
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">
                                            Dalam periode yang dipilih
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative">
                                <div className="h-[300px] w-full bg-gray-50 rounded-lg border p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Total Saldo Rekening
                                        </h3>
                                        <div className="text-xs text-gray-500">
                                            {dateRange.from && dateRange.to ? (
                                                <>
                                                    {format(
                                                        dateRange.from,
                                                        "dd MMM yyyy",
                                                        { locale: id }
                                                    )}{" "}
                                                    -{" "}
                                                    {format(
                                                        dateRange.to,
                                                        "dd MMM yyyy",
                                                        { locale: id }
                                                    )}
                                                </>
                                            ) : (
                                                "Periode"
                                            )}
                                        </div>
                                    </div>

                                    <div className="h-[200px] relative">
                                        {filteredBalanceData.length > 0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <AreaChart
                                                    data={filteredBalanceData}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 30,
                                                        bottom: 5,
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
                                                                stopColor="#00529C"
                                                                stopOpacity={
                                                                    0.8
                                                                }
                                                            />
                                                            <stop
                                                                offset="95%"
                                                                stopColor="#00529C"
                                                                stopOpacity={
                                                                    0.1
                                                                }
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="formattedDate"
                                                        tick={{ fontSize: 12 }}
                                                        tickMargin={10}
                                                        axisLine={{
                                                            stroke: "#e5e7eb",
                                                        }}
                                                    />
                                                    <YAxis
                                                        tickFormatter={(
                                                            value
                                                        ) =>
                                                            formatCompactCurrency(
                                                                value
                                                            )
                                                        }
                                                        domain={[
                                                            "auto",
                                                            "auto",
                                                        ]}
                                                        tick={{ fontSize: 12 }}
                                                        axisLine={{
                                                            stroke: "#e5e7eb",
                                                        }}
                                                    />
                                                    <RechartsTooltip
                                                        formatter={(value) => [
                                                            formatCurrency(
                                                                value as number
                                                            ),
                                                            "Total Saldo",
                                                        ]}
                                                        labelFormatter={(
                                                            label
                                                        ) =>
                                                            `Tanggal: ${label}`
                                                        }
                                                        contentStyle={{
                                                            fontSize: "12px",
                                                            borderRadius: "4px",
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="totalBalance"
                                                        name="Total Saldo"
                                                        stroke="#00529C"
                                                        strokeWidth={2}
                                                        fillOpacity={1}
                                                        fill="url(#colorBalance)"
                                                        activeDot={{
                                                            r: 6,
                                                            stroke: "#00529C",
                                                            strokeWidth: 2,
                                                            fill: "#00529C",
                                                        }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="text-center text-gray-500">
                                                    <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="font-medium">
                                                        Tidak ada data untuk
                                                        ditampilkan
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Pilih rentang tanggal
                                                        yang berbeda
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transactions table */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Riwayat Perubahan Saldo
                                </h3>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>
                                                    Total Saldo
                                                </TableHead>
                                                <TableHead>Perubahan</TableHead>
                                                <TableHead>Transaksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBalanceData.length ===
                                            0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        Tidak ada data perubahan
                                                        saldo
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredBalanceData.map(
                                                    (entry, index) => (
                                                        <TableRow
                                                            key={entry.date}
                                                        >
                                                            <TableCell>
                                                                {
                                                                    entry.formattedDate
                                                                }
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {formatCurrency(
                                                                    entry.totalBalance
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span
                                                                    className={`flex items-center ${
                                                                        entry.change >=
                                                                        0
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {entry.change >=
                                                                    0 ? (
                                                                        <ArrowUp className="h-3.5 w-3.5 mr-1" />
                                                                    ) : (
                                                                        <ArrowDown className="h-3.5 w-3.5 mr-1" />
                                                                    )}
                                                                    {formatCurrency(
                                                                        Math.abs(
                                                                            entry.change
                                                                        )
                                                                    )}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-normal"
                                                                >
                                                                    {entry.transactionCount ||
                                                                        0}{" "}
                                                                    transaksi
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Clients - 6 columns */}
                        <div className="col-span-1">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#00529C]" />
                                            Nasabah Terbaru
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-[#00529C] hover:text-[#003b75]"
                                            onClick={() =>
                                                setCurrentTab("clients")
                                            }
                                        >
                                            Lihat Semua
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Nasabah yang ditangani oleh{" "}
                                        {universal_banker.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {uniqueClients.length > 0 ? (
                                        <div className="space-y-4">
                                            {uniqueClients
                                                .slice(0, 5)
                                                .map((client) => (
                                                    <div
                                                        key={client.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <Users className="h-5 w-5 text-[#00529C]" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {
                                                                        client.name
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-0.5">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        CIF:{" "}
                                                                        {
                                                                            client.cif
                                                                        }
                                                                    </span>
                                                                    {client.phone && (
                                                                        <span className="text-xs flex items-center text-muted-foreground">
                                                                            <Phone className="h-3 w-3 mr-0.5" />
                                                                            {
                                                                                client.phone
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="font-normal"
                                                            >
                                                                {
                                                                    universal_banker.accounts.filter(
                                                                        (a) =>
                                                                            a
                                                                                .client
                                                                                .id ===
                                                                            client.id
                                                                    ).length
                                                                }{" "}
                                                                rekening
                                                            </Badge>
                                                            <Link
                                                                href={route(
                                                                    "clients.show",
                                                                    client.id
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Eye className="h-4 w-4 text-gray-400 hover:text-[#00529C]" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                            <p className="font-medium text-gray-600">
                                                Belum ada nasabah
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                UniversalBanker ini belum
                                                menangani nasabah apapun
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Accounts - 6 columns */}
                        <div className="col-span-1">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-[#00529C]" />
                                            Rekening Terbaru
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-[#00529C] hover:text-[#003b75]"
                                            onClick={() =>
                                                setCurrentTab("accounts")
                                            }
                                        >
                                            Lihat Semua
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Rekening nasabah yang dikelola oleh{" "}
                                        {universal_banker.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {universal_banker.accounts.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Nasabah
                                                        </TableHead>
                                                        <TableHead>
                                                            Rekening
                                                        </TableHead>
                                                        <TableHead>
                                                            Produk
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Saldo
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {universal_banker.accounts
                                                        .slice(0, 5)
                                                        .map((account) => (
                                                            <TableRow
                                                                key={account.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500" />
                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {
                                                                                    account
                                                                                        .client
                                                                                        .name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                CIF:{" "}
                                                                                {
                                                                                    account
                                                                                        .client
                                                                                        .cif
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-mono text-sm">
                                                                        {
                                                                            account.account_number
                                                                        }
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="font-normal"
                                                                    >
                                                                        {
                                                                            account
                                                                                .account_product
                                                                                .name
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(
                                                                        account.current_balance
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                            <p className="font-medium text-gray-600">
                                                Belum ada rekening
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                UniversalBanker ini belum
                                                menangani rekening apapun
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Clients Tab Content */}
                <TabsContent value="clients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-[#00529C]" />
                                Daftar Nasabah
                            </CardTitle>
                            <CardDescription>
                                Semua nasabah yang ditangani oleh{" "}
                                {universal_banker.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Cari nasabah berdasarkan nama, CIF, atau email..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {uniqueClients.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {uniqueClients
                                        .filter(
                                            (client) =>
                                                searchQuery === "" ||
                                                client.name
                                                    .toLowerCase()
                                                    .includes(
                                                        searchQuery.toLowerCase()
                                                    ) ||
                                                client.cif
                                                    .toLowerCase()
                                                    .includes(
                                                        searchQuery.toLowerCase()
                                                    ) ||
                                                (client.email &&
                                                    client.email
                                                        .toLowerCase()
                                                        .includes(
                                                            searchQuery.toLowerCase()
                                                        ))
                                        )
                                        .map((client) => (
                                            <div
                                                key={client.id}
                                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                                                        <Users className="h-6 w-6 text-[#00529C]" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-medium">
                                                                {client.name}
                                                            </h3>
                                                            <Badge
                                                                variant="outline"
                                                                className="font-normal"
                                                            >
                                                                {
                                                                    universal_banker.accounts.filter(
                                                                        (a) =>
                                                                            a
                                                                                .client
                                                                                .id ===
                                                                            client.id
                                                                    ).length
                                                                }{" "}
                                                                rekening
                                                            </Badge>
                                                        </div>

                                                        <div className="mt-1 space-y-1">
                                                            <div className="flex items-center text-sm">
                                                                <span className="font-medium text-gray-500">
                                                                    CIF:
                                                                </span>
                                                                <span className="ml-2">
                                                                    {client.cif}
                                                                </span>
                                                            </div>

                                                            {client.email && (
                                                                <div className="flex items-center text-sm">
                                                                    <Mail className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                                    <span className="text-gray-600">
                                                                        {
                                                                            client.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {client.phone && (
                                                                <div className="flex items-center text-sm">
                                                                    <Phone className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                                    <span className="text-gray-600">
                                                                        {
                                                                            client.phone
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center text-sm">
                                                                <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                                <span className="text-gray-600">
                                                                    Bergabung{" "}
                                                                    {formatDate(
                                                                        client.joined_at
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">
                                                            Rekening:
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {universal_banker.accounts
                                                                .filter(
                                                                    (a) =>
                                                                        a.client
                                                                            .id ===
                                                                        client.id
                                                                )
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        account
                                                                    ) => (
                                                                        <TooltipProvider
                                                                            key={
                                                                                account.id
                                                                            }
                                                                        >
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={`${
                                                                                            account.status ===
                                                                                            "active"
                                                                                                ? "bg-green-50 text-green-700 border-green-100"
                                                                                                : "bg-gray-50 text-gray-700 border-gray-100"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            account
                                                                                                .account_product
                                                                                                .name
                                                                                        }
                                                                                    </Badge>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>
                                                                                        {
                                                                                            account.account_number
                                                                                        }
                                                                                    </p>
                                                                                    <p>
                                                                                        {formatCurrency(
                                                                                            account.current_balance
                                                                                        )}
                                                                                    </p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )
                                                                )}

                                                            {universal_banker.accounts.filter(
                                                                (a) =>
                                                                    a.client
                                                                        .id ===
                                                                    client.id
                                                            ).length > 3 && (
                                                                <Badge variant="secondary">
                                                                    +
                                                                    {universal_banker.accounts.filter(
                                                                        (a) =>
                                                                            a
                                                                                .client
                                                                                .id ===
                                                                            client.id
                                                                    ).length -
                                                                        3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-end">
                                                    <Link
                                                        href={route(
                                                            "clients.show",
                                                            client.id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Lihat Detail
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="font-medium text-lg text-gray-700">
                                        Belum ada nasabah
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto mt-1">
                                        UniversalBanker ini belum menangani
                                        nasabah apapun. Nasabah akan muncul di
                                        sini ketika Universal Banker mulai
                                        mengelola rekening.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Accounts Tab Content */}
                <TabsContent value="accounts" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[#00529C]" />
                                Daftar Rekening Nasabah
                            </CardTitle>
                            <CardDescription>
                                Semua rekening yang dikelola oleh{" "}
                                {universal_banker.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="search"
                                        placeholder="Cari nasabah atau nomor rekening..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={setStatusFilter}
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Filter Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Status
                                            </SelectItem>
                                            {statuses.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={productFilter}
                                        onValueChange={setProductFilter}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter Produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Produk
                                            </SelectItem>
                                            {accountProducts.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={resetFilters}
                                        title="Reset filter"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Filter indicator */}
                            {(searchQuery ||
                                statusFilter !== "all" ||
                                productFilter !== "all") && (
                                <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-md text-sm">
                                    <Filter className="h-4 w-4 text-[#00529C]" />
                                    <span className="text-[#00529C]">
                                        Menampilkan {filteredAccounts.length}{" "}
                                        dari {universal_banker.accounts.length}{" "}
                                        rekening
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto h-7 text-xs text-[#00529C] hover:text-[#00529C] hover:bg-blue-100"
                                        onClick={resetFilters}
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                        Reset Filter
                                    </Button>
                                </div>
                            )}

                            {/* Accounts Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleSort("client.name")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Nama Nasabah
                                                    {sortBy ===
                                                        "client.name" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleSort("account_number")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Nomor Rekening
                                                    {sortBy ===
                                                        "account_number" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleSort(
                                                        "account_product.name"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Jenis Produk
                                                    {sortBy ===
                                                        "account_product.name" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-right"
                                                onClick={() =>
                                                    handleSort(
                                                        "current_balance"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center justify-end">
                                                    Saldo
                                                    {sortBy ===
                                                        "current_balance" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleSort("status")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Status
                                                    {sortBy === "status" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleSort("opened_at")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Tanggal Dibuka
                                                    {sortBy === "opened_at" && (
                                                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAccounts.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Tidak ada data rekening yang
                                                    ditemukan
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAccounts.map((account) => (
                                                <TableRow
                                                    key={account.id}
                                                    className="hover:bg-blue-50/40"
                                                >
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    account
                                                                        .client
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                CIF:{" "}
                                                                {
                                                                    account
                                                                        .client
                                                                        .cif
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {account.account_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-normal"
                                                        >
                                                            {
                                                                account
                                                                    .account_product
                                                                    .name
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            account.current_balance
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={getStatusColor(
                                                                account.status
                                                            )}
                                                        >
                                                            {account.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            account.opened_at
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={route(
                                                                "accounts.show",
                                                                account.id
                                                            )}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Statistics Tab Content */}
                <TabsContent value="stats" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Nasabah</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-[#00529C]" />
                                    {uniqueClients.length}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Jumlah nasabah yang ditangani
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>
                                    Total Rekening
                                </CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-[#00529C]" />
                                    {accountStats.total}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Jumlah rekening yang dikelola
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>
                                    Rekening Aktif
                                </CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <BadgeCheck className="h-5 w-5 mr-2 text-green-600" />
                                    {accountStats.byStatus?.active || 0}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {calculatePercentage(
                                        accountStats.byStatus?.active || 0,
                                        accountStats.total
                                    )}
                                    % dari total rekening
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Saldo</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-[#00529C]" />
                                    {
                                        formatCurrency(
                                            accountStats.totalBalance
                                        ).split(",")[0]
                                    }
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Total saldo seluruh rekening
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BadgeCheck className="h-5 w-5 text-[#00529C]" />
                                Distribusi Status Rekening
                            </CardTitle>
                            <CardDescription>
                                Jumlah rekening berdasarkan status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(
                                    accountStats.byStatus || {}
                                ).map(([status, count]) => {
                                    let statusColor = "";
                                    switch (status.toLowerCase()) {
                                        case "active":
                                            statusColor = "bg-green-500";
                                            break;
                                        case "inactive":
                                            statusColor = "bg-gray-500";
                                            break;
                                        case "blocked":
                                            statusColor = "bg-red-500";
                                            break;
                                        case "pending":
                                            statusColor = "bg-yellow-500";
                                            break;
                                        default:
                                            statusColor = "bg-blue-500";
                                    }

                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium capitalize">
                                                    {status}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {count} rekening (
                                                    {calculatePercentage(
                                                        count,
                                                        accountStats.total
                                                    )}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${statusColor}`}
                                                    style={{
                                                        width: `${calculatePercentage(
                                                            count,
                                                            accountStats.total
                                                        )}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-[#00529C]" />
                                Distribusi Produk Rekening
                            </CardTitle>
                            <CardDescription>
                                Jumlah rekening berdasarkan jenis produk
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(
                                    accountStats.byAccountProduct || {}
                                ).map(([product, count]) => {
                                    return (
                                        <div key={product}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">
                                                    {product}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {count} rekening (
                                                    {calculatePercentage(
                                                        count,
                                                        accountStats.total
                                                    )}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#00529C]"
                                                    style={{
                                                        width: `${calculatePercentage(
                                                            count,
                                                            accountStats.total
                                                        )}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-[#00529C]" />
                                Riwayat Saldo
                            </CardTitle>
                            <CardDescription>
                                Perubahan saldo rekening dari waktu ke waktu
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {dailyBalances.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={dailyBalances}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 30,
                                                bottom: 5,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="colorBalance2"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#00529C"
                                                        stopOpacity={0.8}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#00529C"
                                                        stopOpacity={0.1}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis
                                                dataKey="formattedDate"
                                                tick={{ fontSize: 12 }}
                                                tickMargin={10}
                                                axisLine={{ stroke: "#e5e7eb" }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) =>
                                                    formatCompactCurrency(value)
                                                }
                                                domain={["auto", "auto"]}
                                                tick={{ fontSize: 12 }}
                                                axisLine={{ stroke: "#e5e7eb" }}
                                            />
                                            <RechartsTooltip
                                                formatter={(value) => [
                                                    formatCurrency(
                                                        value as number
                                                    ),
                                                    "Total Saldo",
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Tanggal: ${label}`
                                                }
                                                contentStyle={{
                                                    fontSize: "12px",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="totalBalance"
                                                name="Total Saldo"
                                                stroke="#00529C"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorBalance2)"
                                                activeDot={{
                                                    r: 6,
                                                    stroke: "#00529C",
                                                    strokeWidth: 2,
                                                    fill: "#00529C",
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                            <p className="font-medium">
                                                Tidak ada data untuk ditampilkan
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LineChart className="h-5 w-5 text-[#00529C]" />
                                Ringkasan Kinerja
                            </CardTitle>
                            <CardDescription>
                                Statistik dan kinerja universal_banker
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Total Nasabah
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {uniqueClients.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sejak{" "}
                                        {formatDate(
                                            universal_banker.created_at
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Rata-rata Saldo
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(
                                            accountStats.total > 0
                                                ? accountStats.totalBalance /
                                                      accountStats.total
                                                : 0
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Per rekening
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Persentase Aktif
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {calculatePercentage(
                                            accountStats.byStatus?.active || 0,
                                            accountStats.total
                                        )}
                                        %
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Rekening dengan status aktif
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default UniversalBankersShow;
