import { UniversalBanker } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    LineChart,
    DollarSign,
    ArrowUp,
    ArrowDown,
    CalendarDays,
    Calendar,
    CalendarCheck,
    X,
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { Calendar as CalendarComponent } from "@/Components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

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

interface OverviewTabProps {
    universalBanker: UniversalBanker;
    accountStats: AccountStats;
    filteredBalanceData: DailyBalance[];
    timeFilter: string;
    dateRange: {
        from: Date | null;
        to: Date | null;
    };
    filteredBalanceChange: number;
    filteredPercentageChange: number;
    filteredHighestBalance: number;
    filteredLowestBalance: number;
    onTimeFilterChange: (value: string) => void;
    onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    universalBanker,
    accountStats,
    filteredBalanceData,
    timeFilter,
    dateRange,
    filteredBalanceChange,
    filteredPercentageChange,
    filteredHighestBalance,
    filteredLowestBalance,
    onTimeFilterChange,
    onDateRangeChange,
}) => {
    return (
        <Card className="overflow-hidden border-0 shadow-md bg-white">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 via-blue-50/70 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-[#00529C] to-[#003b75] p-3 flex-shrink-0 shadow-lg">
                            <LineChart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Perkembangan Saldo
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 border-blue-300 text-[#00529C] font-semibold px-2 py-0.5"
                                >
                                    Realtime
                                </Badge>
                            </div>
                            <CardDescription className="text-sm text-gray-500">
                                Total saldo dari{" "}
                                <span className="font-semibold text-gray-700">
                                    {universalBanker.name}
                                </span>
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        {/* Filter Periode */}
                        <Select
                            value={timeFilter}
                            onValueChange={onTimeFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-300 hover:border-blue-500 shadow-sm transition-colors text-xs h-9">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week" className="text-xs">
                                    7 Hari Terakhir
                                </SelectItem>
                                <SelectItem value="month" className="text-xs">
                                    30 Hari Terakhir
                                </SelectItem>
                                <SelectItem value="quarter" className="text-xs">
                                    3 Bulan Terakhir
                                </SelectItem>
                                <SelectItem value="year" className="text-xs">
                                    1 Tahun Terakhir
                                </SelectItem>
                                <SelectItem value="custom" className="text-xs">
                                    Kustom
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {timeFilter === "custom" && (
                            <div className="flex items-center gap-2 bg-white rounded-md border border-blue-200 p-1.5 shadow-sm">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs gap-1 hover:bg-blue-50 transition-colors"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                                            {dateRange.from
                                                ? format(
                                                      dateRange.from,
                                                      "dd MMM yyyy",
                                                      { locale: id }
                                                  )
                                                : "Mulai"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarComponent
                                            mode="single"
                                            selected={
                                                dateRange.from || undefined
                                            }
                                            onSelect={(date) =>
                                                onDateRangeChange({
                                                    ...dateRange,
                                                    from: date || null,
                                                })
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <span className="text-xs text-gray-400">—</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs gap-1 hover:bg-blue-50 transition-colors"
                                        >
                                            <CalendarCheck className="h-3.5 w-3.5 text-blue-600" />
                                            {dateRange.to
                                                ? format(
                                                      dateRange.to,
                                                      "dd MMM yyyy",
                                                      { locale: id }
                                                  )
                                                : "Selesai"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarComponent
                                            mode="single"
                                            selected={dateRange.to || undefined}
                                            onSelect={(date) =>
                                                onDateRangeChange({
                                                    ...dateRange,
                                                    to: date || null,
                                                })
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {dateRange.from && dateRange.to && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
                                        onClick={() =>
                                            onDateRangeChange({
                                                from: null,
                                                to: null,
                                            })
                                        }
                                        title="Reset tanggal"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {dateRange.from && dateRange.to && (
                    <div className="mt-6">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors cursor-default text-xs">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            Periode :{" "}
                            {format(dateRange.from, "dd MMM yyyy", {
                                locale: id,
                            })}{" "}
                            -{" "}
                            {format(dateRange.to, "dd MMM yyyy", {
                                locale: id,
                            })}
                        </Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-6">
                {/* Metrics Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Saldo Saat Ini
                                </p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(accountStats.todayBalance)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Total saldo seluruh rekening
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Perubahan
                                </p>
                                <p
                                    className={`text-xl font-bold ${
                                        filteredBalanceChange >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {filteredBalanceChange >= 0 ? "+" : ""}
                                    {formatCurrency(
                                        Math.abs(filteredBalanceChange)
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    {filteredBalanceChange >= 0
                                        ? "Kenaikan"
                                        : "Penurunan"}{" "}
                                    <span className="font-medium">
                                        {filteredPercentageChange.toFixed(2)}%
                                    </span>
                                </p>
                            </div>
                            <div
                                className={`h-10 w-10 ${
                                    filteredBalanceChange >= 0
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                } rounded-full flex items-center justify-center`}
                            >
                                {filteredBalanceChange >= 0 ? (
                                    <ArrowUp className="h-5 w-5 text-green-600" />
                                ) : (
                                    <ArrowDown className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Saldo Tertinggi
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(filteredHighestBalance)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Dalam periode yang dipilih
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Saldo Terendah
                                </p>
                                <p className="text-xl font-bold text-amber-600">
                                    {formatCurrency(filteredLowestBalance)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Dalam periode yang dipilih
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart with Frame */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-blue-700" />
                            </div>
                            <h3 className="font-medium text-gray-800">
                                Total Saldo Rekening
                            </h3>
                        </div>
                        <div className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                            {dateRange.from && dateRange.to ? (
                                <>
                                    {format(dateRange.from, "dd MMM yyyy", {
                                        locale: id,
                                    })}{" "}
                                    -{" "}
                                    {format(dateRange.to, "dd MMM yyyy", {
                                        locale: id,
                                    })}
                                </>
                            ) : (
                                "Periode"
                            )}
                        </div>
                    </div>

                    <div className="h-[260px] relative">
                        {filteredBalanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={filteredBalanceData}
                                    margin={{
                                        top: 15,
                                        right: 5,
                                        left: 5,
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
                                                stopColor="#3b82f6"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <filter id="shadow" height="200%">
                                            <feDropShadow
                                                dx="0"
                                                dy="3"
                                                stdDeviation="3"
                                                floodOpacity="0.1"
                                            />
                                        </filter>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={{ stroke: "#e5e7eb" }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            formatCompactCurrency(value)
                                        }
                                        domain={["auto", "auto"]}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={{ stroke: "#e5e7eb" }}
                                        tickMargin={10}
                                    />
                                    <RechartsTooltip
                                        cursor={{
                                            stroke: "#3b82f6",
                                            strokeWidth: 1,
                                            strokeDasharray: "5 5",
                                        }}
                                        contentStyle={{
                                            fontSize: "12px",
                                            backgroundColor: "white",
                                            padding: "8px 12px",
                                            border: "none",
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        }}
                                        formatter={(value) => [
                                            formatCurrency(value as number),
                                            "Total Saldo",
                                        ]}
                                        labelFormatter={(label) =>
                                            `Tanggal: ${label}`
                                        }
                                        wrapperStyle={{ zIndex: 10 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="totalBalance"
                                        name="Total Saldo"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                        activeDot={{
                                            r: 6,
                                            stroke: "#ffffff",
                                            strokeWidth: 2,
                                            fill: "#3b82f6",
                                            filter: "url(#shadow)",
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center text-gray-500 animate-fadeIn">
                                    <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="font-medium">
                                        Tidak ada data untuk ditampilkan
                                    </p>
                                    <p className="text-sm mt-1">
                                        Pilih rentang tanggal yang berbeda
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OverviewTab;
