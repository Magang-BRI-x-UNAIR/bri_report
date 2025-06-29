import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Branch, PageProps } from "@/types";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Building2,
    ChevronRight,
    MapPin,
    ListFilter,
    ArrowUpDown,
    X,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";

// Import modal components
import CreateBranchModal from "./Partials/CreateBranchModal";
import EditBranchModal from "./Partials/EditBranchModal";
import DeleteBranchModal from "./Partials/DeleteBranchModal";

interface BranchesIndexProps extends PageProps {
    branches: Branch[];
}

const BranchesIndex = () => {
    const { branches } = usePage<BranchesIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);

    // Filter branches based on search term
    const filteredBranches = branches
        .filter(
            (branch) =>
                branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "address") {
                return sortDirection === "asc"
                    ? a.address.localeCompare(b.address)
                    : b.address.localeCompare(a.address);
            }
            return 0;
        });

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

    // Modal handlers
    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    const openEditModal = (branch: Branch) => {
        setCurrentBranch(branch);
        setShowEditModal(true);
    };

    const openDeleteModal = (branch: Branch) => {
        setCurrentBranch(branch);
        setShowDeleteModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cabang | Bank BRI" />
            <Breadcrumb items={[{ label: "Cabang" }]} />

            {/* Hero Section with Animated Background */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Cabang
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua cabang Bank BRI di seluruh Indonesia
                        </p>
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {branches.length} Cabang Terdaftar
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Button
                            onClick={openCreateModal}
                            className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Buat Cabang</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
                {/* Search and filter section */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-gray-200 pl-10 pr-10 focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm shadow-sm"
                                placeholder="Cari cabang berdasarkan nama atau alamat..."
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

                    {/* Filter Panel (Expandable) */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg animate-in fade-in duration-200">
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
                                            Nama Cabang
                                        </option>
                                        <option value="address">Alamat</option>
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
                                            setSortDirection(e.target.value)
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
                            {filteredBranches.length}
                        </span>
                        cabang ditemukan
                    </div>
                </div>

                {/* Branches Table */}
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
                                        Nama Cabang
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("address")}
                                >
                                    <div className="flex items-center">
                                        Alamat
                                        {sortField === "address" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
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
                            {filteredBranches.length > 0 ? (
                                filteredBranches.map((branch, index) => (
                                    <tr
                                        key={branch.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                                                    <Building2 className="h-5 w-5 text-[#00529C]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {branch.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        ID: BRI-
                                                        {branch.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                    {branch.address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <Link
                                                    href={route(
                                                        "branches.show",
                                                        branch.id
                                                    )}
                                                    className="rounded-lg p-2 text-[#00529C] hover:bg-blue-50 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(branch)
                                                    }
                                                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(branch)
                                                    }
                                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        {searchTerm ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada cabang yang sesuai
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
                                                    <Building2 className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data cabang
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Silakan tambahkan cabang
                                                    baru untuk mulai mengelola
                                                    data cabang Bank BRI
                                                </p>
                                                <button
                                                    onClick={openCreateModal}
                                                    className="mt-6 inline-flex items-center rounded-lg bg-[#00529C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tambah Cabang Baru
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer info section */}
                {filteredBranches.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            Menampilkan {filteredBranches.length} dari{" "}
                            {branches.length} cabang
                        </div>
                        <div className="flex justify-center">
                            <nav
                                className="inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronRight className="h-4 w-4 transform rotate-180" />
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-[#00529C] hover:bg-blue-100"
                                >
                                    1
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </a>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Render modals */}
            <CreateBranchModal
                isOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
            />

            {currentBranch && (
                <EditBranchModal
                    isOpen={showEditModal}
                    closeModal={() => setShowEditModal(false)}
                    branch={currentBranch}
                />
            )}

            <DeleteBranchModal
                isOpen={showDeleteModal}
                closeModal={() => setShowDeleteModal(false)}
                branch={currentBranch}
            />
        </AuthenticatedLayout>
    );
};

export default BranchesIndex;
