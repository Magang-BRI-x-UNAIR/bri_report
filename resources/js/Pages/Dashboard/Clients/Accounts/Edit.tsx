import type React from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { PageProps, Client, AccountProduct, User, Account } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    FileText,
    User as UserIcon,
    ChevronLeft,
    AlertCircle,
    Save,
    X,
    Calendar,
    DollarSign,
    BadgeInfo,
    Briefcase,
    Building,
    Users,
    CheckCircle,
    Wallet,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EditAccountPageProps extends PageProps {
    client: Client;
    account: Account;
    accountProducts: AccountProduct[];
    universalBankers: User[];
}

const AccountsEdit = () => {
    const { client, account, accountProducts, universalBankers } =
        usePage<EditAccountPageProps>().props;

    // Format initial values to IDR format
    const formatToIDR = (value: string | number | null | undefined): string => {
        if (!value) return "0";
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse IDR format back to number
    const parseIDRValue = (value: string): string => {
        return value.replace(/\./g, "");
    };

    const { data, setData, patch, processing, errors } = useForm({
        account_product_id: account.account_product.id.toString(),
        universal_banker_id: account.universal_banker?.id
            ? account.universal_banker.id.toString()
            : "",
        account_number: account.account_number || "",
        current_balance: formatToIDR(account.current_balance || 0),
        available_balance: formatToIDR(account.available_balance || 0),
        currency: account.currency || "IDR",
        status: account.status || "active",
    });

    // Currency options
    const currencies = [
        { code: "IDR", name: "Indonesian Rupiah (IDR)" },
        { code: "USD", name: "US Dollar (USD)" },
        { code: "EUR", name: "Euro (EUR)" },
        { code: "SGD", name: "Singapore Dollar (SGD)" },
    ];

    // Status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200";
            case "inactive":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "blocked":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    // Handle numeric input changes with IDR formatting
    const handleCurrencyInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "current_balance" | "available_balance"
    ) => {
        let value = e.target.value;

        // Remove all non-digit characters
        value = value.replace(/[^\d]/g, "");

        // Format with thousand separators (dots)
        if (value) {
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        setData(field, value);
    };

    // Submit handler with conversion back to numbers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare the data for submission, converting IDR format back to numbers
        const formData = {
            ...data,
            current_balance: parseIDRValue(data.current_balance),
            available_balance: parseIDRValue(data.available_balance),
        };

        router.patch(
            route("clients.accounts.update", [client.id, account.id]),
            {
                data: formData,
                preserveScroll: true,
            }
        );
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
                        href: route("clients.show", client.id),
                    },
                    { label: "Edit Rekening" },
                ]}
            />

            {/* Rest of the header section remains unchanged */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                {/* ... existing header code ... */}
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
                                Edit Rekening
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Perbarui informasi rekening nasabah {client.name}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                Manajemen Rekening
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                Nasabah: {client.name}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                Rekening: {account.account_number}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("clients.show", client.id)}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kembali</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-8">
                        {/* Account Basic Information */}
                        <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                            {/* ... existing account info code ... */}
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-blue-100 rounded-md p-1.5 mr-2">
                                    <UserIcon className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Dasar
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="account_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Nomor Rekening
                                            <span className="text-red-600 ml-1">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="account_number"
                                                name="account_number"
                                                value={data.account_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "account_number",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                    errors.account_number
                                                        ? "border-red-300 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                                maxLength={20}
                                                placeholder="Nomor rekening"
                                            />
                                        </div>
                                        {errors.account_number && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                                {errors.account_number}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="opened_at"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Tanggal Pembukaan
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="opened_at"
                                                className="block w-full pl-10 rounded-md border-gray-300 bg-gray-100 sm:text-sm"
                                                value={formatDate(
                                                    account.opened_at
                                                )}
                                                readOnly
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tanggal pembukaan rekening tidak
                                            dapat diubah
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Balance Information - WITH UPDATED INPUT HANDLERS */}
                        <div className="bg-green-50/50 p-5 rounded-lg border border-green-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-green-100 rounded-md p-1.5 mr-2">
                                    <Wallet className="h-5 w-5 text-green-600" />
                                </div>
                                Informasi Saldo
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="current_balance"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Saldo Saat Ini
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-gray-500">
                                            Rp
                                        </div>
                                        <input
                                            type="text"
                                            id="current_balance"
                                            name="current_balance"
                                            value={data.current_balance}
                                            onChange={(e) =>
                                                handleCurrencyInput(
                                                    e,
                                                    "current_balance"
                                                )
                                            }
                                            className={`block w-full pl-16 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.current_balance
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.current_balance ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.current_balance}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Total saldo yang dimiliki rekening
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="available_balance"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Saldo Tersedia
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-gray-500">
                                            Rp
                                        </div>
                                        <input
                                            type="text"
                                            id="available_balance"
                                            name="available_balance"
                                            value={data.available_balance}
                                            onChange={(e) =>
                                                handleCurrencyInput(
                                                    e,
                                                    "available_balance"
                                                )
                                            }
                                            className={`block w-full pl-16 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.available_balance
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.available_balance ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.available_balance}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Saldo yang dapat ditarik nasabah
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rest of the form remains unchanged */}
                        {/* Account Details */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            {/* ... existing account details code ... */}
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <CreditCard className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Rekening
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="account_product_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Produk Rekening
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BadgeInfo className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            id="account_product_id"
                                            name="account_product_id"
                                            value={data.account_product_id}
                                            onChange={(e) =>
                                                setData(
                                                    "account_product_id",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.account_product_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Pilih Produk Rekening
                                            </option>
                                            {accountProducts.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.name} (
                                                    {product.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.account_product_id && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.account_product_id}
                                        </p>
                                    )}
                                </div>

                                {/* ... more form fields ... */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="currency"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Mata Uang
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            id="currency"
                                            name="currency"
                                            value={data.currency}
                                            onChange={(e) =>
                                                setData(
                                                    "currency",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.currency
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {currencies.map((currency) => (
                                                <option
                                                    key={currency.code}
                                                    value={currency.code}
                                                >
                                                    {currency.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.currency && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.currency}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Status Rekening
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData("status", e.target.value)
                                        }
                                        className={`block w-full rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                            errors.status
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">
                                            Tidak Aktif
                                        </option>
                                        <option value="blocked">
                                            Diblokir
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status Saat Ini
                                    </label>
                                    <div className="mt-1 pt-1">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium ${getStatusBadgeColor(
                                                account.status
                                            )}`}
                                        >
                                            {account.status === "active" && (
                                                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                            )}
                                            {account.status === "inactive" && (
                                                <X className="h-4 w-4 mr-1 text-gray-500" />
                                            )}
                                            {account.status === "blocked" && (
                                                <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                                            )}
                                            {account.status === "active"
                                                ? "Aktif"
                                                : account.status === "inactive"
                                                ? "Tidak Aktif"
                                                : account.status === "blocked"
                                                ? "Diblokir"
                                                : account.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Universal Banker Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            {/* ... existing universal banker code ... */}
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <Briefcase className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Universal Banker
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <label
                                        htmlFor="universal_banker_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Universal Banker Penanggung Jawab
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            id="universal_banker_id"
                                            name="universal_banker_id"
                                            value={data.universal_banker_id}
                                            onChange={(e) =>
                                                setData(
                                                    "universal_banker_id",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.universal_banker_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Pilih Universal Banker
                                            </option>
                                            {universalBankers.map(
                                                (universal_banker) => (
                                                    <option
                                                        key={
                                                            universal_banker.id
                                                        }
                                                        value={
                                                            universal_banker.id
                                                        }
                                                    >
                                                        {universal_banker.name}{" "}
                                                        -{" "}
                                                        {
                                                            universal_banker
                                                                .branch?.name
                                                        }{" "}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    {errors.universal_banker_id && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.universal_banker_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                            <Link
                                href={route("clients.show", client.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Batal
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#00529C] hover:bg-[#003b75] gap-1.5 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Save className="h-4 w-4" />
                                {processing
                                    ? "Menyimpan..."
                                    : "Perbarui Rekening"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountsEdit;
