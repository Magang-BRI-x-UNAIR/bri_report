import type React from "react";

import { useState, useEffect } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps, Client } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    ChevronLeft,
    AlertCircle,
    Save,
    X,
    FileText,
    Phone,
    Calendar,
    PencilLine,
    Users,
} from "lucide-react";

interface ClientsEditPageProps extends PageProps {
    client: Client;
}

const ClientsEdit = () => {
    const { client } = usePage<ClientsEditPageProps>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: client.name,
        cif: client.cif,
        email: client.email || "",
        phone: client.phone || "",
        joined_at: client.joined_at.split("T")[0], // Format date for input
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("clients.update", client.id), {
            onSuccess: () => {},
        });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/\D/g, "");

        if (value.length > 0) {
            if (value.startsWith("62")) {
            } else if (value.startsWith("0")) {
                value = "62" + value.substring(1);
            } else {
                value = "62" + value;
            }
        }

        setData("phone", value);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Nasabah: ${client.name} | Bank BRI`} />

            <Breadcrumb
                items={[
                    { label: "Nasabah", href: route("clients.index") },
                    { label: "Edit Nasabah" },
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
                                <PencilLine className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Edit Nasabah: {client.name}
                            </h1>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Perbarui informasi dan data nasabah pada sistem Bank
                            BRI
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                Manajemen Nasabah
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                CIF: {client.cif}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                                ID: BRI-C-
                                {client.id.toString().padStart(4, "0")}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("clients.index")}>
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
                                Informasi Nasabah
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
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
                                        placeholder="Masukkan nama lengkap nasabah"
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="cif"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nomor CIF
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
                                            id="cif"
                                            name="cif"
                                            value={data.cif}
                                            onChange={(e) =>
                                                setData("cif", e.target.value)
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.cif
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Masukkan 10 digit nomor CIF"
                                            maxLength={10}
                                        />
                                    </div>
                                    {errors.cif && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.cif}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <Phone className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Kontak
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                        <span className="text-gray-400 ml-1 text-xs font-normal">
                                            (Opsional)
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

                                <div className="space-y-1">
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nomor Telepon
                                        <span className="text-gray-400 ml-1 text-xs font-normal">
                                            (Opsional)
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
                                            onChange={handlePhoneChange}
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.phone
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="cth: 628123456789"
                                        />
                                    </div>
                                    {errors.phone ? (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.phone}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Format: 62XXXXXXXXXX (tanpa tanda +
                                            atau spasi)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <div className="bg-[#00529C]/10 rounded-md p-1.5 mr-2">
                                    <Calendar className="h-5 w-5 text-[#00529C]" />
                                </div>
                                Informasi Tambahan
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label
                                        htmlFor="joined_at"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Tanggal Bergabung
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
                                            id="joined_at"
                                            name="joined_at"
                                            value={data.joined_at}
                                            onChange={(e) =>
                                                setData(
                                                    "joined_at",
                                                    e.target.value
                                                )
                                            }
                                            className={`block w-full pl-10 rounded-md focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm transition-all duration-200 ${
                                                errors.joined_at
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
                                    {errors.joined_at && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                            {errors.joined_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                            <Link
                                href={route("clients.index")}
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
                                    : "Perbarui Nasabah"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default ClientsEdit;
