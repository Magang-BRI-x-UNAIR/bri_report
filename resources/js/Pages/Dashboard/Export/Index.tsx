"use client";

import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import type { PageProps, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Download,
    Calendar as CalendarIcon,
    FileSpreadsheet,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { DateRange } from "react-day-picker";
import { addDays, format, getYear } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/Components/ui/popover";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/Components/ui/input";

interface DashboardExportPageProps extends PageProps {
    universalBankers: User[];
}

const DashboardExportPage = () => {
    const { universalBankers } = usePage<DashboardExportPageProps>().props;
    const currentYear = getYear(new Date());

    const { data, setData, post, processing, errors } = useForm({
        universal_bankers: [] as number[],
        start_date: format(addDays(new Date(), -29), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
        baseline_year: currentYear,
    });

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -29),
        to: new Date(),
    });

    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            setData({
                ...data,
                start_date: format(dateRange.from, "yyyy-MM-dd"),
                end_date: format(dateRange.to, "yyyy-MM-dd"),
            });
        }
    }, [dateRange]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowError(true);
            setErrorMessage(Object.values(errors).join(", "));
        } else {
            setShowError(false);
        }
    }, [errors]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allUbIds = universalBankers.map((ub) => ub.id);
            setData("universal_bankers", allUbIds);
        } else {
            setData("universal_bankers", []);
        }
    };

    const handleUbSelection = (ubId: number, checked: boolean) => {
        const updatedUbs = checked
            ? [...data.universal_bankers, ubId]
            : data.universal_bankers.filter((id) => id !== ubId);

        setData("universal_bankers", updatedUbs);
    };

    const handleBaselineYearChange = (year: number) => {
        if (year >= 2000 && year <= 2100) {
            setData("baseline_year", year);
        }
    };

    const handleExport = () => {
        setShowError(false);

        if (data.universal_bankers.length === 0) {
            setErrorMessage("Harap pilih minimal satu Universal Banker.");
            setShowError(true);
            return;
        }

        if (!data.start_date || !data.end_date) {
            setErrorMessage("Harap tentukan rentang tanggal laporan.");
            setShowError(true);
            return;
        }

        post(route("dashboard.export.process"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Export Laporan | Bank BRI" />
            <Breadcrumb items={[{ label: "Export Laporan" }]} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                Export Laporan
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                Download data kinerja Universal Banker dalam
                                format Excel
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-blue-100 text-sm">
                                <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                    {universalBankers.length} Universal Banker
                                </span>
                                {dateRange?.from && dateRange?.to && (
                                    <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                        {format(dateRange.from, "d MMM yyyy", {
                                            locale: id,
                                        })}{" "}
                                        -{" "}
                                        {format(dateRange.to, "d MMM yyyy", {
                                            locale: id,
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center space-x-3">
                            <Button
                                onClick={handleExport}
                                className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                                disabled={
                                    processing ||
                                    data.universal_bankers.length === 0
                                }
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                <span>Download Excel</span>
                            </Button>
                            <Link href={route("dashboard.index")}>
                                <Button
                                    variant="outline"
                                    className="shadow-md bg-blue-800/30 hover:bg-blue-800/50 text-white border-blue-700/30 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Kembali</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {showError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Buat Laporan Kinerja
                        </CardTitle>
                        <CardDescription>
                            Pilih Universal Banker dan periode untuk
                            menghasilkan laporan dalam format Excel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center">
                                <span className="flex items-center justify-center bg-[#00529C] text-white rounded-full w-7 h-7 mr-3 text-sm font-bold">
                                    1
                                </span>
                                Pilih Universal Banker
                            </h3>
                            <div className="p-3 border rounded-lg bg-slate-50">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="select-all"
                                        onCheckedChange={handleSelectAll}
                                        checked={
                                            data.universal_bankers.length ===
                                                universalBankers.length &&
                                            universalBankers.length > 0
                                        }
                                    />
                                    <label
                                        htmlFor="select-all"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Pilih Semua / Hapus Pilihan
                                    </label>
                                </div>
                            </div>
                            <ScrollArea className="h-72 w-full rounded-md border p-4">
                                {universalBankers.length > 0 ? (
                                    <div className="space-y-3">
                                        {universalBankers.map((ub) => (
                                            <div
                                                key={ub.id}
                                                className="flex items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={`ub-${ub.id}`}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleUbSelection(
                                                            ub.id,
                                                            !!checked
                                                        )
                                                    }
                                                    checked={data.universal_bankers.includes(
                                                        ub.id
                                                    )}
                                                />
                                                <label
                                                    htmlFor={`ub-${ub.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {ub.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Tidak ada Universal Banker yang
                                        tersedia.
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="text-sm text-gray-500">
                                {data.universal_bankers.length} Universal Banker
                                dipilih
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center">
                                <span className="flex items-center justify-center bg-[#00529C] text-white rounded-full w-7 h-7 mr-3 text-sm font-bold">
                                    2
                                </span>
                                Tentukan Periode & Baseline
                            </h3>
                            <div className="space-y-1.5">
                                <label className="font-medium text-sm">
                                    Periode Laporan
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className={`justify-start ${
                                            dateRange?.from &&
                                            dateRange?.to &&
                                            format(
                                                dateRange.from,
                                                "yyyy-MM-dd"
                                            ) ===
                                                format(
                                                    addDays(new Date(), -6),
                                                    "yyyy-MM-dd"
                                                )
                                                ? "border-blue-500 bg-blue-50"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setDateRange({
                                                from: addDays(new Date(), -6),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        7 Hari Terakhir
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`justify-start ${
                                            dateRange?.from &&
                                            dateRange?.to &&
                                            format(
                                                dateRange.from,
                                                "yyyy-MM-dd"
                                            ) ===
                                                format(
                                                    addDays(new Date(), -29),
                                                    "yyyy-MM-dd"
                                                )
                                                ? "border-blue-500 bg-blue-50"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setDateRange({
                                                from: addDays(new Date(), -29),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        30 Hari Terakhir
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`justify-start ${
                                            dateRange?.from &&
                                            dateRange?.to &&
                                            format(
                                                dateRange.from,
                                                "yyyy-MM-dd"
                                            ) ===
                                                format(
                                                    addDays(new Date(), -89),
                                                    "yyyy-MM-dd"
                                                )
                                                ? "border-blue-500 bg-blue-50"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setDateRange({
                                                from: addDays(new Date(), -89),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        3 Bulan Terakhir
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-medium text-sm">
                                    Periode Kustom
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateRange &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(
                                                            dateRange.from,
                                                            "d MMM yyyy",
                                                            { locale: id }
                                                        )}{" "}
                                                        -{" "}
                                                        {format(
                                                            dateRange.to,
                                                            "d MMM yyyy",
                                                            { locale: id }
                                                        )}
                                                    </>
                                                ) : (
                                                    format(
                                                        dateRange.from,
                                                        "d MMM yyyy",
                                                        { locale: id }
                                                    )
                                                )
                                            ) : (
                                                <span>Pilih tanggal</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            locale={id}
                                            disabled={{
                                                after: new Date(),
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="baseline-year"
                                    className="font-medium text-sm"
                                >
                                    Tahun Baseline
                                </label>
                                <Input
                                    type="number"
                                    id="baseline-year"
                                    value={data.baseline_year}
                                    onChange={(e) =>
                                        handleBaselineYearChange(
                                            Number(e.target.value)
                                        )
                                    }
                                    min={2000}
                                    max={currentYear}
                                    placeholder="Contoh: 2024"
                                    className={
                                        errors.baseline_year
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Perbandingan performa akan dihitung dari 1
                                    Januari tahun ini.
                                </p>
                            </div>

                            {dateRange?.from && dateRange?.to && (
                                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4">
                                    <p className="text-sm font-medium text-blue-700">
                                        Periode:{" "}
                                        {format(dateRange.from, "d MMM yyyy", {
                                            locale: id,
                                        })}{" "}
                                        -{" "}
                                        {format(dateRange.to, "d MMM yyyy", {
                                            locale: id,
                                        })}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Total:{" "}
                                        {Math.ceil(
                                            (dateRange.to.getTime() -
                                                dateRange.from.getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        )}{" "}
                                        hari
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                        <Button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-base py-6 px-8 gap-2 shadow-md hover:shadow-lg transition-all"
                            disabled={
                                processing ||
                                data.universal_bankers.length === 0
                            }
                        >
                            <Download className="h-5 w-5" />
                            Export Laporan Excel
                            {processing && <span className="ml-2">...</span>}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default DashboardExportPage;
