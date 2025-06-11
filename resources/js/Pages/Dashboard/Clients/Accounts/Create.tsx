import type React from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps, Client, AccountProduct, User } from "@/types";
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
    CircleDashed,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CreateAccountPageProps extends PageProps {
    client: Client;
    accountProducts: AccountProduct[];
    universalBankers: User[];
}

const AccountsCreate = () => {
    const { client, accountProducts, universalBankers } =
        usePage<CreateAccountPageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        client_id: client.id,
        account_number: "",
        account_product_id: "",
        universal_banker_id: "",
        currency: "IDR",
        initial_balance: 0,
        opened_at: new Date().toISOString().split("T")[0],
        status: "active",
    });

    // Currency options
    const currencies = [
        { code: "IDR", name: "Indonesian Rupiah (IDR)" },
        { code: "USD", name: "US Dollar (USD)" },
        { code: "EUR", name: "Euro (EUR)" },
        { code: "SGD", name: "Singapore Dollar (SGD)" },
    ];

    // Format currency as user types
    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/[^\d.,]/g, "");
        const numericValue = value.replace(/,/g, "");
        let amount = parseFloat(numericValue);
        if (isNaN(amount)) {
            amount = 0;
        }
        setData("initial_balance", amount);
    };
    // Submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("clients.accounts.store", client.id), {
            onSuccess: () => {},
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

            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
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
                                Buka Rekening Baru
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Buat rekening baru untuk nasabah {client.name}
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
                                CIF: {client.cif}
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
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Masukkan 10 digit nomor rekening"
                                            maxLength={10}
                                            autoFocus
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

                        {/* UniversalBanker Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
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
