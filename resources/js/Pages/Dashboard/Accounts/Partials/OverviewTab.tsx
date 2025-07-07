"use client";

import React from "react";
import { Link } from "@inertiajs/react";
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
import {
    BarChart4,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    ArrowDownUp,
} from "lucide-react";
import {
    formatCompactCurrency,
    formatCurrency,
    formatDate,
    formatTime,
} from "@/lib/utils";
import type { Account, AccountTransaction } from "@/types";

interface OverviewTabProps {
    account: Account;
    processedTransactions: Array<
        AccountTransaction & {
            amount: number;
            previous_balance: number;
        }
    >;
    filteredTransactions: Array<
        AccountTransaction & {
            amount: number;
            previous_balance: number;
        }
    >;
    chartData: Array<{
        date: string;
        fullDate: string;
        balance: number;
        amount: number;
        credit: number;
        debit: number;
    }>;
    chartPeriod: string;
    setChartPeriod: (value: string) => void;
    activeChartView: string;
    setActiveChartView: (value: string) => void;
    setActiveTab: (value: string) => void;
    getTransactionType: (amount: number) => {
        type: string;
        label: string;
        className: string;
        icon: React.ReactNode;
    };
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    account,
    processedTransactions,
    filteredTransactions,
    chartData,
    chartPeriod,
    setChartPeriod,
    activeChartView,
    setActiveChartView,
    setActiveTab,
    getTransactionType,
}) => {
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
        <div className="space-y-6">
            {/* Charts */}
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Grafik Saldo</CardTitle>
                        <CardDescription>
                            Perkembangan saldo rekening dari waktu ke waktu
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
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="30d">30 Hari</SelectItem>
                                <SelectItem value="90d">90 Hari</SelectItem>
                                <SelectItem value="6m">6 Bulan</SelectItem>
                                <SelectItem value="1y">1 Tahun</SelectItem>
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
                                <SelectItem value="balance">Saldo</SelectItem>
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
                            <ResponsiveContainer width="100%" height="100%">
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
                                            domain={getBalanceDomain(chartData)}
                                            padding={{
                                                top: 20,
                                                bottom: 20,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
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
                                ) : activeChartView === "transactions" ? (
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
                                            content={<BarChartTooltip />}
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
                                            domain={getBalanceDomain(chartData)}
                                            padding={{
                                                top: 20,
                                                bottom: 20,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
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
                                Grafik akan ditampilkan setelah ada riwayat
                                perubahan saldo pada rekening ini
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
                                                        transaction.amount > 0
                                                            ? "bg-emerald-50"
                                                            : transaction.amount <
                                                              0
                                                            ? "bg-rose-50"
                                                            : "bg-gray-50"
                                                    }`}
                                                >
                                                    {transaction.amount > 0 ? (
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
                                                        transaction.amount > 0
                                                            ? "text-emerald-600"
                                                            : transaction.amount <
                                                              0
                                                            ? "text-rose-600"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {transaction.amount > 0
                                                        ? "+"
                                                        : transaction.amount < 0
                                                        ? "-"
                                                        : ""}
                                                    {transaction.amount !== 0
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
        </div>
    );
};

export default OverviewTab;
