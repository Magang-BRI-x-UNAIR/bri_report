"use client";

import type React from "react";
import { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import type { PageProps, Branch, UniversalBanker } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    UserCog,
    Briefcase,
    Mail,
    Building2,
    User as UserIcon,
    ChevronLeft,
    AlertCircle,
    Save,
    X,
    Phone,
    MapPin,
    Users,
} from "lucide-react";

interface UniversalBankersEditPageProps extends PageProps {
    universalBanker: UniversalBanker;
    branches: Branch[];
}

const UniversalBankersEdit = () => {
    const { universalBanker, branches } =
        usePage<UniversalBankersEditPageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        nip: universalBanker.nip || "",
        name: universalBanker.name || "",
        email: universalBanker.email || "",
        phone: universalBanker.phone || "",
        address: universalBanker.address || "",
        branch_id: universalBanker.branch?.id?.toString() || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("universalBankers.update", universalBanker.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Universal Banker | Bank BRI" />

            <Breadcrumb
                items={[
                    {
                        label: "Universal Banker",
                        href: route("universalBankers.index"),
                    },
                    { label: "Edit Universal Banker" },
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
                                <UserCog className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Edit Universal Banker: {universalBanker.name}
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Perbarui informasi dan data Universal Banker pada
                            sistem Bank BRI
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
                                    <UserIcon className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Personal
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="nip"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        NIP (Nomor Induk Pegawai)
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="nip"
                                            name="nip"
                                            value={data.nip}
                                            onChange={(e) =>
                                                setData("nip", e.target.value)
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.nip
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Masukkan NIP"
                                        />
                                    </div>
                                    {errors.nip && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.nip}
                                        </p>
                                    )}
                                </div>

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
                                            placeholder="Email Universal Banker"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nomor Telepon
                                        <span className="text-red-600 ml-1">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.phone
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Contoh: 081234567890"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Address Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Alamat
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    "address",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.address
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Masukkan alamat lengkap"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

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

                        <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
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
                                    : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default UniversalBankersEdit;
