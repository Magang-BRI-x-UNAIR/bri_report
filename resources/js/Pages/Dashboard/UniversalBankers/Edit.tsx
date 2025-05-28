"use client";

import type React from "react";

import { Head, Link, useForm, usePage } from "@inertiajs/react";
import type { PageProps, Branch, User } from "@/types";
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
} from "lucide-react";

interface EditProps extends PageProps {
    user: User;
    branches: Branch[];
}

const UniversalBankersEdit = () => {
    const { user, branches } = usePage<EditProps>().props;

    console.log(user);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        branch_id: user.branch?.id?.toString() || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("universalBankers.update", user.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit UniversalBanker | Bank BRI" />

            <Breadcrumb
                items={[
                    {
                        label: "UniversalBanker",
                        href: route("universalBankers.index"),
                    },
                    { label: "Edit UniversalBanker" },
                ]}
            />

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#00529C]/10 to-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#00529C] rounded-full p-2 text-white">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <h2 className="font-semibold text-xl text-gray-900">
                            Edit UniversalBanker: {user.name}
                        </h2>
                    </div>
                    <Link href={route("universalBankers.index")}>
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
                                            disabled
                                            className="block w-full pl-10 rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                                            placeholder="Email tidak dapat diubah"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Email tidak dapat diubah setelah
                                        Universal Banker dibuat
                                    </p>
                                </div>
                            </div>
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
