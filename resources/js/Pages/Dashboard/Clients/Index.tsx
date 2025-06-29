"use client";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { Client, PageProps } from "@/types";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    Phone,
    Mail,
    ListFilter,
    ArrowUpDown,
    X,
    FileText,
    MoreVertical,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/Components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import DeleteClientModal from "./Partials/DeleteClientModal";

// Simplified interface for client-side pagination only
interface ClientsIndexProps extends PageProps {
    clients: Client[];
}

const ClientsIndex = () => {
    const { clients } = usePage<ClientsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    // Client-side filtering and sorting
    const filteredClients = clients
        .filter(
            (client) =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.cif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.email &&
                    client.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) ||
                (client.phone &&
                    client.phone
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "cif") {
                return sortDirection === "asc"
                    ? a.cif.localeCompare(b.cif)
                    : b.cif.localeCompare(a.cif);
            }
            return 0;
        });

    // Use the pagination hook for client-side pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        currentItems: paginatedClients,
        totalItems,
    } = usePagination({
        items: filteredClients,
        initialPage: 1,
        itemsPerPage: 10,
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortDirection]);

    // Handle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    // Delete modal functions
    const openDeleteModal = (client: Client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setClientToDelete(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nasabah | Bank BRI" />
            <Breadcrumb items={[{ label: "Nasabah" }]} />

            {/* Header Section */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Nasabah
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua data nasabah Bank BRI
                        </p>
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {clients.length} Nasabah Terdaftar
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("clients.create")}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                <Plus className="h-4 w-4" />
                                <span>Tambah Nasabah</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search/filter section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="p-5 border-b border-gray-100 bg-gray-50/70">
                    {/* Search input */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-gray-200 pl-10 pr-10 focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm shadow-sm"
                                placeholder="Cari nasabah berdasarkan nama, CIF, email atau nomor telepon..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <ListFilter className="h-4 w-4 mr-2 text-[#00529C]" />
                                Filter & Urut
                            </button>
                        </div>
                    </div>

                    {/* Filter panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg animate-in fade-in duration-200">
                            {/* Filter content */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Urutkan Berdasarkan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={sortField}
                                        onChange={(e) =>
                                            handleSort(e.target.value)
                                        }
                                    >
                                        <option value="name">
                                            Nama Nasabah
                                        </option>
                                        <option value="cif">Nomor CIF</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arah Urutan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={sortDirection}
                                        onChange={(e) =>
                                            setSortDirection(
                                                e.target.value as "asc" | "desc"
                                            )
                                        }
                                    >
                                        <option value="asc">
                                            Ascending (A-Z)
                                        </option>
                                        <option value="desc">
                                            Descending (Z-A)
                                        </option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        className="bg-[#00529C] hover:bg-[#003b75] text-white px-4 py-2 h-10 text-sm w-full"
                                        onClick={() => setShowFilters(false)}
                                    >
                                        Terapkan Filter
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search results counter */}
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C] mr-2">
                            {filteredClients.length}
                        </span>
                        nasabah ditemukan
                    </div>
                </div>

                {/* Table section */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    No.
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center">
                                        Nama Nasabah
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("cif")}
                                >
                                    <div className="flex items-center">
                                        Nomor CIF
                                        {sortField === "cif" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Kontak
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedClients.length > 0 ? (
                                paginatedClients.map((client, index) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {(currentPage - 1) * 10 + index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {client.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        ID: BRI-C-
                                                        {client.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-sm">
                                                <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                                {client.cif}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {client.email && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                                        <span className="truncate max-w-[200px]">
                                                            {client.email}
                                                        </span>
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                                {!client.email &&
                                                    !client.phone && (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Tidak ada kontak
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                {/* Replace custom dropdown with shadcn dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                                                            title="Opsi"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "clients.show",
                                                                    client.id
                                                                )}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Eye className="h-4 w-4 mr-3 text-[#00529C]" />
                                                                <span>
                                                                    Lihat Detail
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "clients.edit",
                                                                    client.id
                                                                )}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Edit className="h-4 w-4 mr-3 text-amber-600" />
                                                                <span>
                                                                    Edit Nasabah
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    client
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-3" />
                                                            <span>Hapus</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        {searchTerm ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada nasabah yang
                                                    sesuai
                                                </p>
                                                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                                                    Coba gunakan kata kunci lain
                                                    atau kurangi filter
                                                    pencarian
                                                </p>
                                                <button
                                                    onClick={clearSearch}
                                                    className="mt-4 inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Hapus Pencarian
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="rounded-full bg-blue-50 p-4 mb-3">
                                                    <Users className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data nasabah
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Silakan tambahkan nasabah
                                                    baru untuk mulai mengelola
                                                    data nasabah Bank BRI
                                                </p>
                                                <Link
                                                    href={route(
                                                        "clients.create"
                                                    )}
                                                >
                                                    <Button className="mt-6 inline-flex items-center rounded-lg bg-[#00529C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-colors duration-200 shadow-sm">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Tambah Nasabah Baru
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination section */}
                {paginatedClients.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            perPage={10}
                            onPageChange={setCurrentPage}
                            showPageNumbers={true}
                            siblingCount={1}
                        />
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteClientModal
                isOpen={showDeleteModal}
                closeModal={closeDeleteModal}
                client={clientToDelete}
            />
        </AuthenticatedLayout>
    );
};

export default ClientsIndex;
