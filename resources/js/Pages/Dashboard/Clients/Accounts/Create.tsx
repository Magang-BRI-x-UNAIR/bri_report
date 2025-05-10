import type React from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps, Client, AccountProduct, User } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
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
    CircleDashed,
} from "lucide-react";

interface CreateAccountProps extends PageProps {
    client: Client;
    accountProducts: AccountProduct[];
    tellers: User[];
}

const AccountsCreate = () => {
    const { client, accountProducts, tellers } =
        usePage<CreateAccountProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        client_id: client.id,
        account_number: "",
        account_product_id: "",
        teller_id: "",
        currency: "IDR", // Default to IDR
        initial_balance: "0",
        opened_at: new Date().toISOString().split("T")[0], // Default to today
        status: "active", // Default to active
    });

    // Currency options
    const currencies = [
        { code: "IDR", name: "Indonesian Rupiah (IDR)" },
        { code: "USD", name: "US Dollar (USD)" },
        { code: "EUR", name: "Euro (EUR)" },
        { code: "SGD", name: "Singapore Dollar (SGD)" },
    ];

    // Function to validate account number
    const validateAccountNumber = (accountNumber: string) => {
        return /^\d{10}$/.test(accountNumber);
    };

    // Function to generate a random account number
    const generateAccountNumber = () => {
        const currentYear = new Date().getFullYear().toString().substr(2, 2); // Get last 2 digits of year
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000); // Generate random 8-digit number
        const generatedNumber = currentYear + randomDigits.toString();
        setData("account_number", generatedNumber);
    };

    // Format currency as user types
    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Remove non-numeric characters and leading zeros
        value = value.replace(/\D/g, "").replace(/^0+/, "");

        // If value is empty, set to 0
        if (!value) {
            value = "0";
        }

        setData("initial_balance", value);
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: data.currency,
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    // Submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("clients.accounts.store", client.id), {
            onSuccess: () => {
                // Redirect handled by the controller
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head
                title={`Buka Rekening Baru untuk ${client.name} | Bank BRI`}
            />

            <Breadcrumb
                items={[
                    { label: "Nasabah", href: route("clients.index") },
                    {
                        label: client.name,
                        href: route("clients.show", client.id),
                    },
                    { label: "Buka Rekening Baru" },
                ]}
            />

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#00529C]/10 to-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#00529C] rounded-full p-2 text-white">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-900">
                                Buka Rekening Baru
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Untuk nasabah: {client.name} (CIF: {client.cif})
                            </p>
                        </div>
                    </div>
                    <Link href={route("clients.show", client.id)}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-8">
                        {/* Client Information */}
                        <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-blue-100 rounded-md p-1.5 mr-2">
                                    <UserIcon className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Nasabah
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Nama Nasabah
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {client.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Nomor CIF
                                    </div>
                                    <div className="flex items-center">
                                        <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {client.cif}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Tanggal Bergabung
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                        <span className="text-sm text-gray-900">
                                            {new Date(
                                                client.joined_at
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <CreditCard className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Rekening
                            </h3>

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
                                            <FileText className="h-4 w-4 text-gray-400" />
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
                                            className={`block w-full pl-10 pr-20 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.account_number
                                                    ? "border-red-300 bg-red-50"
                                                    : validateAccountNumber(
                                                          data.account_number
                                                      ) || !data.account_number
                                                    ? "border-gray-300"
                                                    : "border-orange-300 bg-orange-50"
                                            }`}
                                            placeholder="Masukkan 10 digit nomor rekening"
                                            maxLength={10}
                                            autoFocus
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            <button
                                                type="button"
                                                onClick={generateAccountNumber}
                                                className="inline-flex items-center px-2 py-1 mr-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                                            >
                                                <CircleDashed className="h-3 w-3 mr-1" />
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                    {errors.account_number ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.account_number}
                                        </p>
                                    ) : data.account_number &&
                                      !validateAccountNumber(
                                          data.account_number
                                      ) ? (
                                        <p className="mt-1 text-sm text-orange-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            Nomor rekening harus terdiri dari 10
                                            digit angka
                                        </p>
                                    ) : null}
                                </div>

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
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                                <div className="space-y-2">
                                    <label
                                        htmlFor="initial_balance"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Setoran Awal
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="initial_balance"
                                            name="initial_balance"
                                            value={data.initial_balance}
                                            onChange={handleBalanceChange}
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.initial_balance
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.initial_balance ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.initial_balance}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatCurrency(
                                                data.initial_balance
                                            )}
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
                                    <label
                                        htmlFor="opened_at"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Tanggal Pembukaan
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            id="opened_at"
                                            name="opened_at"
                                            value={data.opened_at}
                                            onChange={(e) =>
                                                setData(
                                                    "opened_at",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.opened_at
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </div>
                                    {errors.opened_at && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.opened_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Teller Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <Briefcase className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Teller
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <label
                                        htmlFor="teller_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Teller Penanggung Jawab
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            id="teller_id"
                                            name="teller_id"
                                            value={data.teller_id}
                                            onChange={(e) =>
                                                setData(
                                                    "teller_id",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.teller_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Pilih Teller
                                            </option>
                                            {tellers.map((teller) => (
                                                <option
                                                    key={teller.id}
                                                    value={teller.id}
                                                >
                                                    {teller.name} -{" "}
                                                    {teller.branch?.name} (
                                                    {teller.position?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.teller_id && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.teller_id}
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
                                {processing ? "Menyimpan..." : "Buka Rekening"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default AccountsCreate;
