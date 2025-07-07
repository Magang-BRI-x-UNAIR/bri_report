"use client";

import { useState, useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import type { PageProps, UniversalBanker } from "@/types";
import type { Client } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Building2,
    ChevronLeft,
    Users,
    CreditCard,
    BadgeCheck,
    LineChart,
    Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { isValid } from "date-fns";

import OverviewTab from "./Partials/OverviewTab";
import ClientTab from "./Partials/ClientTab";
import AccountTab from "./Partials/AccountTab";
import AccountTrendTab from "./Partials/AccountTrendTab";

interface AccountStats {
    total: number;
    byStatus: Record<string, number>;
    byAccountProduct: Record<string, number>;
    totalBalance: number;
    todayBalance: number;
}

interface DailyBalance {
    [x: string]: number | string;
    date: string;
    totalBalance: number;
    formattedDate: string;
    change: number;
    transactionCount: number;
}

interface UniversalBankersShowPageProps extends PageProps {
    universalBanker: UniversalBanker;
    accountStats: AccountStats;
    clients: Client[];
    dailyBalances: DailyBalance[];
    highestBalance: number;
    lowestBalance: number;
}

const UniversalBankersShow = () => {
    const {
        universalBanker,
        accountStats,
        clients,
        dailyBalances,
        highestBalance,
        lowestBalance,
    } = usePage<UniversalBankersShowPageProps>().props;
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
        if (!dailyBalances || dailyBalances.length === 0) {
            return [];
        }
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

    // Get unique clients
    const uniqueClients = useMemo(() => {
        return clients || [];
    }, [clients]);

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
                title={`Detail UniversalBanker: ${universalBanker.name} | Bank BRI`}
            />

            <Breadcrumb
                items={[
                    {
                        label: "Universal Banker",
                        href: route("universalBankers.index"),
                    },
                    { label: universalBanker.name },
                ]}
            />

            {/* Hero Section with UniversalBanker Information */}
            <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-white">
                                            {universalBanker.name}
                                        </h1>
                                        <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white border border-white/20">
                                            NIP :
                                            {" " +
                                                universalBanker.nip
                                                    .toString()
                                                    .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-blue-100">
                                        <div className="flex items-center">
                                            <Mail className="mr-1.5 h-4 w-4 flex-shrink-0 opacity-70" />
                                            <span>{universalBanker.email}</span>
                                        </div>
                                        {universalBanker.branch && (
                                            <div className="flex items-center">
                                                <Building2 className="mr-1.5 h-4 w-4 flex-shrink-0 opacity-70" />
                                                <span>
                                                    {
                                                        universalBanker.branch
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

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/20 pt-6">
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
                            value="trends"
                            className="flex items-center gap-1.5"
                        >
                            <Activity className="h-4 w-4" />
                            <span>Trend Analysis</span>
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
                    </TabsList>
                </div>

                {/* Overview Tab Content */}
                <TabsContent value="overview" className="space-y-6">
                    <OverviewTab
                        universalBanker={universalBanker}
                        accountStats={accountStats}
                        filteredBalanceData={filteredBalanceData}
                        timeFilter={timeFilter}
                        dateRange={dateRange}
                        filteredBalanceChange={filteredBalanceChange}
                        filteredPercentageChange={filteredPercentageChange}
                        filteredHighestBalance={filteredHighestBalance}
                        filteredLowestBalance={filteredLowestBalance}
                        onTimeFilterChange={handleTimeFilterChange}
                        onDateRangeChange={setDateRange}
                    />
                </TabsContent>

                {/* Trends Tab Content */}
                <TabsContent value="trends" className="space-y-6">
                    <AccountTrendTab universalBanker={universalBanker} />
                </TabsContent>

                {/* Clients Tab Content */}
                <TabsContent value="clients" className="space-y-6">
                    <ClientTab
                        universalBanker={universalBanker}
                        clients={clients}
                    />
                </TabsContent>

                {/* Accounts Tab Content */}
                <TabsContent value="accounts" className="space-y-6">
                    <AccountTab universalBanker={universalBanker} />
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default UniversalBankersShow;
