"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import type { PageProps, Client, AccountProduct, User } from "@/types";
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
    Check,
    Plus,
    Mail,
    Phone,
    Loader2,
    Building,
    Hash,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CreateAccountPageProps extends PageProps {
    clients: Client[];
    accountProducts: AccountProduct[];
    universalBankers: User[];
}

interface FormData {
    client_id: string;
    account_product_id: string;
    universal_banker_id: string;
    account_number: string;
    current_balance: number;
    available_balance: number;
    currency: string;
    status: string;
}

const AccountsCreate = ({
    clients,
    accountProducts,
    universalBankers,
}: CreateAccountPageProps) => {
    const [currentBalanceDisplay, setCurrentBalanceDisplay] =
        useState<string>("");
    const [availableBalanceDisplay, setAvailableBalanceDisplay] =
        useState<string>("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientSearchOpen, setClientSearchOpen] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState("");
    const [recentClients, setRecentClients] = useState<Client[]>([]);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            client_id: "",
            account_product_id: "",
            universal_banker_id: "",
            account_number: "",
            current_balance: 0,
            available_balance: 0,
            currency: "IDR",
            status: "active",
        });

    const currencies = [
        { code: "IDR", name: "Indonesian Rupiah (IDR)", symbol: "Rp" },
        { code: "USD", name: "US Dollar (USD)", symbol: "$" },
        { code: "EUR", name: "Euro (EUR)", symbol: "€" },
        { code: "SGD", name: "Singapore Dollar (SGD)", symbol: "S$" },
    ];

    const statusOptions = [
        {
            value: "active",
            label: "Aktif",
            color: "bg-green-100 text-green-800",
            description: "Rekening dapat digunakan untuk transaksi",
        },
        {
            value: "inactive",
            label: "Tidak Aktif",
            color: "bg-gray-100 text-gray-800",
            description: "Rekening tidak dapat digunakan sementara",
        },
        {
            value: "blocked",
            label: "Diblokir",
            color: "bg-red-100 text-red-800",
            description: "Rekening diblokir karena alasan keamanan",
        },
    ];

    // Simulate recent clients (in real app, this would come from localStorage or API)
    useEffect(() => {
        const recent = clients.slice(0, 3);
        setRecentClients(recent);
    }, [clients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const container = document.getElementById(
                "client-search-container"
            );
            if (container && !container.contains(event.target as Node)) {
                setClientSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update the handleClientSelect function

    const handleClientSelect = (clientId: string) => {
        setData("client_id", clientId);

        // Find the selected client
        const selectedClientData = clients.find(
            (c) => c.id.toString() === clientId
        );
        if (selectedClientData) {
            setSelectedClient(selectedClientData);
            setClientSearchQuery(selectedClientData.name);
        }

        // Clear any errors
        if (errors.client_id) {
            clearErrors("client_id");
        }

        // Close the dropdown
        setClientSearchOpen(false);

        // Add to recent clients (simulate)
        if (selectedClientData) {
            setRecentClients((prev) => {
                const filtered = prev.filter(
                    (c) => c.id !== selectedClientData.id
                );
                return [selectedClientData, ...filtered].slice(0, 3);
            });
        }
    };

    // Update selected client when client_id changes
    useEffect(() => {
        if (data.client_id) {
            const client = clients.find(
                (c) => c.id.toString() === data.client_id
            );
            setSelectedClient(client || null);
        } else {
            setSelectedClient(null);
        }
    }, [data.client_id, clients]);

    // Filter and sort clients based on search query
    const filteredClients = useMemo(() => {
        if (!clientSearchQuery.trim()) {
            return clients.slice(0, 10); // Show first 10 clients when no search
        }

        const query = clientSearchQuery.toLowerCase();
        return clients
            .filter((client) => {
                return (
                    client.name.toLowerCase().includes(query) ||
                    client.cif.toLowerCase().includes(query) ||
                    (client.email &&
                        client.email.toLowerCase().includes(query)) ||
                    (client.phone && client.phone.includes(query))
                );
            })
            .sort((a, b) => {
                // Prioritize exact matches
                const aNameMatch = a.name.toLowerCase().startsWith(query);
                const bNameMatch = b.name.toLowerCase().startsWith(query);
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                return a.name.localeCompare(b.name);
            })
            .slice(0, 20); // Limit results
    }, [clients, clientSearchQuery]);

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

        if (errors[field]) {
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
                description: "",
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate balance relationship
        if (data.available_balance > data.current_balance) {
            alert("Saldo tersedia tidak boleh lebih besar dari saldo saat ini");
            return;
        }

        post(route("accounts.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCurrentBalanceDisplay("");
                setAvailableBalanceDisplay("");
                setSelectedClient(null);
            },
        });
    };

    const handleReset = () => {
        reset();
        setCurrentBalanceDisplay("");
        setAvailableBalanceDisplay("");
        setSelectedClient(null);
        clearErrors();
    };

    const getClientInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Rekening Baru | Bank BRI" />

            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Rekening", href: route("accounts.index") },
                        { label: "Tambah Rekening" },
                    ]}
                />

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                    <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">
                                    Tambah Rekening Baru
                                </h1>
                            </div>
                            <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                Buat rekening baru untuk nasabah
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Badge
                                    variant="secondary"
                                    className="bg-blue-800/30 text-white border-blue-700"
                                >
                                    <Users className="h-3.5 w-3.5 mr-1" />
                                    Manajemen Rekening
                                </Badge>
                                {selectedClient && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-white/20 text-white border-white/30"
                                    >
                                        <UserIcon className="h-3.5 w-3.5 mr-1" />
                                        Nasabah: {selectedClient.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center space-x-3">
                            <Link href={route("accounts.index")}>
                                <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Kembali</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2" id="client-search-container">
                        <Label
                            htmlFor="client_search"
                            className="text-sm font-medium"
                        >
                            Nasabah <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                id="client_search"
                                type="text"
                                placeholder="Cari nasabah berdasarkan nama, CIF, email, atau telepon..."
                                value={clientSearchQuery}
                                onChange={(e) => {
                                    setClientSearchQuery(e.target.value);
                                    setClientSearchOpen(true);
                                }}
                                onClick={() => {
                                    setClientSearchOpen(true);
                                }}
                                className={`pl-10 ${
                                    errors.client_id
                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                            />

                            {clientSearchQuery && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setClientSearchQuery("");
                                        setData("client_id", "");
                                        setSelectedClient(null);
                                        setClientSearchOpen(true);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}

                            {data.client_id && selectedClient && (
                                <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-700"
                                    >
                                        {selectedClient.name}
                                    </Badge>
                                </div>
                            )}

                            {/* Client Dropdown */}
                            {clientSearchOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                                    {/* Search Results */}
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredClients.length === 0 ? (
                                            <div className="px-4 py-6 text-center">
                                                <UserIcon className="h-8 w-8 text-gray-300 mx-auto" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {clients.length > 0
                                                        ? "Tidak ada nasabah yang ditemukan untuk pencarian ini"
                                                        : "Belum ada nasabah di sistem"}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            "clients.create"
                                                        )}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Tambah Nasabah Baru
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            filteredClients.map((client) => (
                                                <div
                                                    key={client.id}
                                                    className={`${
                                                        data.client_id ===
                                                        client.id.toString()
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-gray-900 hover:bg-gray-100"
                                                    } cursor-pointer select-none relative py-2.5 pl-4 pr-9`}
                                                    onClick={() => {
                                                        handleClientSelect(
                                                            client.id.toString()
                                                        );
                                                        setClientSearchQuery(
                                                            client.name
                                                        );
                                                        setClientSearchOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block truncate font-medium">
                                                                {client.name}
                                                            </span>
                                                            <div className="flex items-center gap-4 mt-0.5">
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Hash className="h-3 w-3" />
                                                                    {client.cif}
                                                                </span>
                                                                {client.email && (
                                                                    <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                                        <Mail className="h-3 w-3" />
                                                                        {
                                                                            client.email
                                                                        }
                                                                    </span>
                                                                )}
                                                                {client.phone && (
                                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        {
                                                                            client.phone
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {data.client_id ===
                                                            client.id.toString() && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                                <Check className="h-5 w-5 text-blue-600" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.client_id && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.client_id}
                            </p>
                        )}
                    </div>
                    {/* Basic Information */}
                    <Card>
                        <CardHeader className="bg-blue-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <div className="bg-blue-100 rounded-md p-1.5">
                                    <CreditCard className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Informasi dasar rekening nasabah
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                if (errors.account_number) {
                                                    clearErrors(
                                                        "account_number"
                                                    );
                                                }
                                            }}
                                            className={`pl-10 ${
                                                errors.account_number
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Masukkan nomor rekening"
                                            maxLength={20}
                                        />
                                    </div>
                                    {errors.account_number && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.account_number}
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
                                            type="date"
                                            value={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            readOnly
                                            className="pl-10 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Tanggal pembukaan rekening akan diatur
                                        ke hari ini
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Balance Information */}
                    <Card>
                        <CardHeader className="bg-green-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <div className="bg-green-100 rounded-md p-1.5">
                                    <Wallet className="h-5 w-5 text-green-600" />
                                </div>
                                Informasi Saldo
                            </CardTitle>
                            <CardDescription>
                                Kelola saldo rekening nasabah
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current_balance">
                                        Saldo Saat Ini{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                            {currencies.find(
                                                (c) => c.code === data.currency
                                            )?.symbol || "Rp"}
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
                                                errors.current_balance
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.current_balance && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.current_balance}
                                        </p>
                                    )}
                                    {!errors.current_balance && (
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
                                            {currencies.find(
                                                (c) => c.code === data.currency
                                            )?.symbol || "Rp"}
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
                                                errors.available_balance
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.available_balance && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.available_balance}
                                        </p>
                                    )}
                                    {!errors.available_balance && (
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
                            <CardTitle className="flex items-center gap-2">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5">
                                    <CreditCard className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Rekening
                            </CardTitle>
                            <CardDescription>
                                Detail produk dan status rekening
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            if (errors.account_product_id) {
                                                clearErrors(
                                                    "account_product_id"
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.account_product_id
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
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Kode: {product.code}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.account_product_id && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.account_product_id}
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
                                            if (errors.currency) {
                                                clearErrors("currency");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.currency
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm">
                                                            {currency.symbol}
                                                        </span>
                                                        <span>
                                                            {currency.name}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.currency && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.currency}
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
                                            if (errors.status) {
                                                clearErrors("status");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.status
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
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Status yang Dipilih</Label>
                                    <div className="pt-1">
                                        <Badge
                                            className={
                                                getStatusBadge(data.status)
                                                    .color
                                            }
                                        >
                                            {data.status === "active" && (
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {data.status === "inactive" && (
                                                <X className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {data.status === "blocked" && (
                                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                            )}
                                            {getStatusBadge(data.status).label}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {
                                                getStatusBadge(data.status)
                                                    .description
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Universal Banker Information */}
                    <Card>
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5">
                                    <Briefcase className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Universal Banker
                            </CardTitle>
                            <CardDescription>
                                Petugas yang bertanggung jawab atas rekening
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="universal_banker_id">
                                    Universal Banker{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.universal_banker_id}
                                    onValueChange={(value) => {
                                        setData("universal_banker_id", value);
                                        if (errors.universal_banker_id) {
                                            clearErrors("universal_banker_id");
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        className={
                                            errors.universal_banker_id
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
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {banker.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Building className="h-3 w-3" />
                                                            {banker.branch
                                                                ?.name ||
                                                                "Pusat"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.universal_banker_id && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {errors.universal_banker_id}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Petugas yang bertanggung jawab untuk
                                    rekening ini
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Action Buttons */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={processing}
                                    className="gap-1.5 w-full sm:w-auto"
                                >
                                    <X className="h-4 w-4" />
                                    Bersihkan Form
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.available_balance >
                                            data.current_balance
                                    }
                                    className="gap-1.5 bg-[#00529C] hover:bg-[#003b75] w-full sm:w-auto min-w-[160px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Buat Rekening
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

export default AccountsCreate;
