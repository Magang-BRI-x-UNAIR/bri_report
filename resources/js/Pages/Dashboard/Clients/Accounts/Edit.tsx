"use client";

import type React from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import type {
    PageProps,
    Client,
    AccountProduct,
    Account,
    UniversalBanker,
} from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Badge } from "@/Components/ui/badge";
import {
    CreditCard,
    FileText,
    UserIcon,
    ChevronLeft,
    AlertCircle,
    Save,
    X,
    Calendar,
    DollarSign,
    Briefcase,
    Users,
    CheckCircle,
    Wallet,
    Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";

interface EditAccountPageProps extends PageProps {
    client: Client;
    account: Account;
    accountProducts: AccountProduct[];
    universalBankers: UniversalBanker[];
}

interface FormData {
    account_product_id: string;
    universal_banker_id: string;
    account_number: string;
    current_balance: number;
    available_balance: number;
    currency: string;
    status: string;
}

const AccountsEdit = () => {
    const {
        client,
        account,
        accountProducts,
        universalBankers,
        errors: pageErrors,
    } = usePage<EditAccountPageProps>().props;

    const [currentBalanceDisplay, setCurrentBalanceDisplay] =
        useState<string>("");
    const [availableBalanceDisplay, setAvailableBalanceDisplay] =
        useState<string>("");

    const {
        data,
        setData,
        patch,
        processing,
        errors: formErrors,
        reset,
        clearErrors,
    } = useForm({
        account_product_id: account.account_product.id?.toString() || "",
        universal_banker_id: account.universal_banker?.id?.toString() || "",
        account_number: account.account_number || "",
        current_balance: account.current_balance || 0,
        available_balance: account.available_balance || 0,
        currency: account.currency || "IDR",
        status: account.status || "active",
    });

    const currencies = [
        { code: "IDR", name: "Indonesian Rupiah (IDR)" },
        { code: "USD", name: "US Dollar (USD)" },
        { code: "EUR", name: "Euro (EUR)" },
        { code: "SGD", name: "Singapore Dollar (SGD)" },
    ];

    const statusOptions = [
        {
            value: "active",
            label: "Aktif",
            color: "bg-green-100 text-green-800",
        },
        {
            value: "inactive",
            label: "Tidak Aktif",
            color: "bg-gray-100 text-gray-800",
        },
        {
            value: "blocked",
            label: "Diblokir",
            color: "bg-red-100 text-red-800",
        },
    ];

    // Initialize display values
    useEffect(() => {
        setCurrentBalanceDisplay(
            data.current_balance > 0 ? formatCurrency(data.current_balance) : ""
        );
        setAvailableBalanceDisplay(
            data.available_balance > 0
                ? formatCurrency(data.available_balance)
                : ""
        );
    }, []);

    const formatCurrency = (value: number): string => {
        if (!value || isNaN(value)) return "";
        return Math.floor(value).toLocaleString("id-ID");
    };

    const parseCurrency = (value: string): number => {
        if (!value) return 0;
        const numericString = value.replace(/[^\d]/g, "");
        return Number.parseInt(numericString, 10) || 0;
    };

    const handleCurrencyInput = (
        value: string,
        field: "current_balance" | "available_balance",
        setDisplay: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const numericValue = parseCurrency(value);
        const formattedValue =
            numericValue > 0 ? formatCurrency(numericValue) : "";

        setDisplay(formattedValue);
        setData(field, numericValue);

        if (formErrors[field]) {
            clearErrors(field);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = statusOptions.find(
            (option) => option.value === status
        );
        return (
            statusOption || {
                value: status,
                label: status,
                color: "bg-blue-100 text-blue-800",
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.available_balance > data.current_balance) {
            alert("Saldo tersedia tidak boleh lebih besar dari saldo saat ini");
            return;
        }

        patch(
            route("clients.accounts.update", {
                client: client.id,
                account: account.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {},
                onError: (errors) => {
                    console.error("Form submission errors:", errors);
                },
            }
        );
    };

    const handleReset = () => {
        reset();
        setCurrentBalanceDisplay(formatCurrency(account.current_balance));
        setAvailableBalanceDisplay(formatCurrency(account.available_balance));
        clearErrors();
    };

    return (
        <AuthenticatedLayout>
            <Head
                title={`Edit Rekening ${account.account_number} | ${client.name} | Bank BRI`}
            />

            <Breadcrumb
                items={[
                    { label: "Nasabah", href: route("clients.index") },
                    {
                        label: client.name,
                        href: route("clients.show", { client: client.id }),
                    },
                    {
                        label: account.account_number,
                        href: route("clients.accounts.show", {
                            client: client.id,
                            account: account.id,
                        }),
                    },
                    { label: "Edit Rekening" },
                ]}
            />

            {/* Header Section - Fixed overflow */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-6 md:p-8 shadow-lg mb-6">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl"></div>
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-indigo-500/20 blur-xl"></div>

                <div className="relative z-10 flex flex-col space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            Edit Rekening
                        </h1>
                    </div>

                    <p className="text-blue-100 text-base md:text-lg max-w-2xl">
                        Perbarui informasi rekening nasabah {client.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="bg-blue-800/30 text-white border-blue-700 text-xs"
                        >
                            <Users className="h-3 w-3 mr-1" />
                            Manajemen Rekening
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30 text-xs"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[120px]">
                                {client.name}
                            </span>
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30 text-xs"
                        >
                            <span className="truncate">
                                {account.account_number}
                            </span>
                        </Badge>
                    </div>

                    <div className="flex items-center">
                        <Link
                            href={route("clients.show", {
                                client: client.id,
                            })}
                        >
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-4 py-2 text-sm">
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kembali</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form Section with better spacing */}
            <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <Card>
                        <CardHeader className="bg-blue-50/50">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="bg-blue-100 rounded-md p-1.5">
                                    <UserIcon className="h-4 w-4 text-[#00529C]" />
                                </div>
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Informasi dasar rekening nasabah
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">
                                        Nomor Rekening{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="account_number"
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => {
                                                setData(
                                                    "account_number",
                                                    e.target.value
                                                );
                                                if (formErrors.account_number) {
                                                    clearErrors(
                                                        "account_number"
                                                    );
                                                }
                                            }}
                                            className={`pl-10 ${
                                                formErrors.account_number
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Masukkan nomor rekening"
                                            maxLength={20}
                                        />
                                    </div>
                                    {formErrors.account_number && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.account_number}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="opened_at">
                                        Tanggal Pembukaan
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="opened_at"
                                            type="text"
                                            value={formatDate(
                                                account.opened_at
                                            )}
                                            readOnly
                                            className="pl-10 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Tanggal pembukaan rekening tidak dapat
                                        diubah
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance Information */}
                    <Card>
                        <CardHeader className="bg-green-50/50">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="bg-green-100 rounded-md p-1.5">
                                    <Wallet className="h-4 w-4 text-green-600" />
                                </div>
                                Informasi Saldo
                            </CardTitle>
                            <CardDescription>
                                Kelola saldo rekening nasabah
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current_balance">
                                        Saldo Saat Ini{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                            Rp
                                        </span>
                                        <Input
                                            id="current_balance"
                                            type="text"
                                            value={currentBalanceDisplay}
                                            onChange={(e) =>
                                                handleCurrencyInput(
                                                    e.target.value,
                                                    "current_balance",
                                                    setCurrentBalanceDisplay
                                                )
                                            }
                                            className={`pl-16 ${
                                                formErrors.current_balance
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {formErrors.current_balance && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.current_balance}
                                        </p>
                                    )}
                                    {!formErrors.current_balance && (
                                        <p className="text-xs text-gray-500">
                                            Total saldo yang dimiliki rekening
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="available_balance">
                                        Saldo Tersedia{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                            Rp
                                        </span>
                                        <Input
                                            id="available_balance"
                                            type="text"
                                            value={availableBalanceDisplay}
                                            onChange={(e) =>
                                                handleCurrencyInput(
                                                    e.target.value,
                                                    "available_balance",
                                                    setAvailableBalanceDisplay
                                                )
                                            }
                                            className={`pl-16 ${
                                                formErrors.available_balance
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {formErrors.available_balance && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.available_balance}
                                        </p>
                                    )}
                                    {!formErrors.available_balance && (
                                        <p className="text-xs text-gray-500">
                                            Saldo yang dapat ditarik nasabah
                                        </p>
                                    )}
                                </div>
                            </div>

                            {data.available_balance > data.current_balance && (
                                <Alert className="mt-4 border-amber-200 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800">
                                        Peringatan: Saldo tersedia tidak boleh
                                        lebih besar dari saldo saat ini
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5">
                                    <CreditCard className="h-4 w-4 text-[#00529C]" />
                                </div>
                                Informasi Rekening
                            </CardTitle>
                            <CardDescription>
                                Detail produk dan status rekening
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="account_product_id">
                                        Produk Rekening{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.account_product_id}
                                        onValueChange={(value) => {
                                            setData(
                                                "account_product_id",
                                                value
                                            );
                                            if (formErrors.account_product_id) {
                                                clearErrors(
                                                    "account_product_id"
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                formErrors.account_product_id
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih produk rekening" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accountProducts.map((product) => (
                                                <SelectItem
                                                    key={product.id}
                                                    value={product.id.toString()}
                                                >
                                                    {product.name} (
                                                    {product.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.account_product_id && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.account_product_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">
                                        Mata Uang{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.currency}
                                        onValueChange={(value) => {
                                            setData("currency", value);
                                            if (formErrors.currency) {
                                                clearErrors("currency");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                formErrors.currency
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih mata uang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem
                                                    key={currency.code}
                                                    value={currency.code}
                                                >
                                                    {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.currency && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.currency}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Status Rekening{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => {
                                            setData("status", value);
                                            if (formErrors.status) {
                                                clearErrors("status");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                formErrors.status
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((status) => (
                                                <SelectItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.status && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.status}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Status Saat Ini</Label>
                                    <div className="pt-1">
                                        <Badge
                                            className={
                                                getStatusBadge(account.status)
                                                    .color
                                            }
                                        >
                                            {account.status === "active" && (
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {account.status === "inactive" && (
                                                <X className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {account.status === "blocked" && (
                                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {
                                                getStatusBadge(account.status)
                                                    .label
                                            }
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Universal Banker Information */}
                    <Card>
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5">
                                    <Briefcase className="h-4 w-4 text-[#00529C]" />
                                </div>
                                Informasi Universal Banker
                            </CardTitle>
                            <CardDescription>
                                Penanggung jawab rekening nasabah
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="universal_banker_id">
                                    Universal Banker Penanggung Jawab{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.universal_banker_id}
                                    onValueChange={(value) => {
                                        setData("universal_banker_id", value);
                                        if (formErrors.universal_banker_id) {
                                            clearErrors("universal_banker_id");
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        className={
                                            formErrors.universal_banker_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Pilih universal banker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universalBankers.map((banker) => (
                                            <SelectItem
                                                key={banker.id}
                                                value={banker.id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {banker.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {banker.branch?.name ||
                                                            "N/A"}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.universal_banker_id && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {formErrors.universal_banker_id}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <Link
                                        href={route("clients.show", {
                                            client: client.id,
                                        })}
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={processing}
                                            className="gap-2 w-full sm:w-auto"
                                        >
                                            <X className="h-4 w-4" />
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={processing}
                                        className="gap-2 w-full sm:w-auto"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        Reset
                                    </Button>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.available_balance >
                                            data.current_balance
                                    }
                                    className="bg-[#00529C] hover:bg-[#003b75] gap-2 min-w-[160px] w-full sm:w-auto"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Perbarui Rekening
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountsEdit;
