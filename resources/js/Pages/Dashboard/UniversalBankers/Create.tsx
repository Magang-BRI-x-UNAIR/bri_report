"use client";

import type React from "react";

import { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import type { PageProps, Branch } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    UserPlus,
    Briefcase,
    Mail,
    Building2,
    User,
    ChevronLeft,
    AlertCircle,
    Check,
    Save,
    X,
    Eye,
    EyeOff,
    KeyRound,
    RefreshCw,
    Info,
    Users,
} from "lucide-react";

interface CreateProps extends PageProps {
    branches: Branch[];
}

const UniversalBankersCreate = () => {
    const { branches } = usePage<CreateProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        branch_id: "",
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("universalBankers.store"), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const generatePassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let generatedPassword = "";

        for (let i = 0, n = charset.length; i < length; ++i) {
            generatedPassword += charset.charAt(Math.floor(Math.random() * n));
        }

        setData("password", generatedPassword);
        setData("password_confirmation", generatedPassword);
        setPasswordVisible(true);
        setConfirmPasswordVisible(true);
    };

    // Password strength calculation
    const getPasswordStrength = () => {
        if (!data.password) return 0;

        let strength = 0;
        if (data.password.length >= 8) strength += 25;
        if (/[A-Z]/.test(data.password)) strength += 25;
        if (/\d/.test(data.password)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) strength += 25;

        return strength;
    };

    const getStrengthColor = () => {
        const strength = getPasswordStrength();
        if (strength <= 25) return "bg-red-500";
        if (strength <= 50) return "bg-orange-500";
        if (strength <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        const strength = getPasswordStrength();
        if (strength <= 25) return "Lemah";
        if (strength <= 50) return "Sedang";
        if (strength <= 75) return "Kuat";
        return "Sangat Kuat";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah UniversalBanker Baru | Bank BRI" />

            <Breadcrumb
                items={[
                    {
                        label: "Universal Banker",
                        href: route("universalBankers.index"),
                    },
                    { label: "Tambah Universal Banker Baru" },
                ]}
            />

            {/* Hero Section with Animated Background - matching Index page */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-white/10">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Tambah Universal Banker Baru
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Tambahkan anggota Universal Banker baru untuk
                            bergabung dengan tim Bank BRI
                        </p>
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                Manajemen Universal Banker
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("universalBankers.index")}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                <ChevronLeft className="h-4 w-4" />
                                <span>Kembali ke Daftar</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-8">
                        {/* Personal Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <User className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Personal
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nama Lengkap
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className={`block w-full rounded-md shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                            errors.name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Masukkan nama lengkap Universal Banker"
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.email
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="contoh@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <KeyRound className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Pengaturan Password
                            </h3>

                            <div className="mb-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generatePassword}
                                    className="flex items-center text-sm bg-white hover:bg-[#00529C]/5 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1.5" />
                                    Generate Password Otomatis
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type={
                                                passwordVisible
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pr-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.password
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPasswordVisible(
                                                    !passwordVisible
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {passwordVisible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Konfirmasi Password
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type={
                                                confirmPasswordVisible
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pr-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.password_confirmation
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Masukkan kembali password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setConfirmPasswordVisible(
                                                    !confirmPasswordVisible
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {confirmPasswordVisible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {data.password && (
                                <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fadeIn">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-blue-800 flex items-center">
                                            <Info className="h-4 w-4 mr-1.5" />
                                            Kekuatan Password:{" "}
                                            <span className="ml-1 font-semibold">
                                                {getStrengthText()}
                                            </span>
                                        </h4>
                                        <div className="text-xs font-medium text-blue-700">
                                            {getPasswordStrength()}%
                                        </div>
                                    </div>

                                    <div className="h-2 w-full bg-blue-200 rounded-full mb-4 overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor()} transition-all duration-300 ease-out`}
                                            style={{
                                                width: `${getPasswordStrength()}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <div
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${
                                                        data.password.length >=
                                                        8
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {data.password.length >=
                                                    8 ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs ${
                                                        data.password.length >=
                                                        8
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    Minimal 8 karakter
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <div
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${
                                                        /[A-Z]/.test(
                                                            data.password
                                                        )
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {/[A-Z]/.test(
                                                        data.password
                                                    ) ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs ${
                                                        /[A-Z]/.test(
                                                            data.password
                                                        )
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    Huruf kapital
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <div
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${
                                                        /\d/.test(data.password)
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {/\d/.test(
                                                        data.password
                                                    ) ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs ${
                                                        /\d/.test(data.password)
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    Angka
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <div
                                                    className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${
                                                        /[!@#$%^&*(),.?":{}|<>]/.test(
                                                            data.password
                                                        )
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {/[!@#$%^&*(),.?":{}|<>]/.test(
                                                        data.password
                                                    ) ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs ${
                                                        /[!@#$%^&*(),.?":{}|<>]/.test(
                                                            data.password
                                                        )
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    Karakter spesial
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Assignment Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <Briefcase className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Penugasan
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="branch_id"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Cabang
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            id="branch_id"
                                            name="branch_id"
                                            value={data.branch_id}
                                            onChange={(e) =>
                                                setData(
                                                    "branch_id",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.branch_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Pilih Cabang
                                            </option>
                                            {branches.map((branch) => (
                                                <option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.branch_id && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.branch_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 border-t border-gray-200 rounded-b-lg flex justify-between items-center">
                            <Link
                                href={route("universalBankers.index")}
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
                                    : "Simpan Universal Banker"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default UniversalBankersCreate;
