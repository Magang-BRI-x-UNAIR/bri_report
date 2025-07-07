import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { AccountProduct, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ListFilter,
    ArrowUpDown,
    X,
    Calendar,
    Hash,
    FileText,
    Package,
    TrendingUp,
    Archive,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { formatDate } from "@/lib/utils";
import ClientPagination from "@/Components/ClientPagination";

// Import modal components
import CreateAccountProductModal from "./Partials/CreateAccountProductModal";
import EditAccountProductModal from "./Partials/EditAccountProductModal";
import DeleteAccountProductModal from "./Partials/DeleteAccountProductModal";

interface AccountProductsIndexProps extends PageProps {
    accountProducts: AccountProduct[];
}

const AccountProductsIndex = () => {
    const { accountProducts } = usePage<AccountProductsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [typeFilter, setTypeFilter] = useState("all");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<AccountProduct | null>(
        null
    );

    // Filter account products based on search term, type, and sorting
    const filteredProducts = accountProducts
        .filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description &&
                    product.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            return matchesSearch;
        })
        .sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "code") {
                return sortDirection === "asc"
                    ? a.code.localeCompare(b.code)
                    : b.code.localeCompare(a.code);
            } else if (sortField === "description") {
                const descA = a.description || "";
                const descB = b.description || "";
                return sortDirection === "asc"
                    ? descA.localeCompare(descB)
                    : descB.localeCompare(descA);
            } else if (sortField === "created_at") {
                return sortDirection === "asc"
                    ? new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime();
            }
            return 0;
        });

    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Check if there are any active filters
    const hasActiveFilters = searchTerm || typeFilter !== "all";

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setTypeFilter("all");
        setSortField("name");
        setSortDirection("asc");
        setCurrentPage(1);
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    // Modal handlers
    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    const openEditModal = (product: AccountProduct) => {
        setCurrentProduct(product);
        setShowEditModal(true);
    };

    const openDeleteModal = (product: AccountProduct) => {
        setCurrentProduct(product);
        setShowDeleteModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Produk Rekening | Bank BRI" />
            <Breadcrumb items={[{ label: "Produk Rekening" }]} />

            {/* Hero Section with Animated Background */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Produk Rekening
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua jenis produk rekening tabungan Bank BRI
                        </p>
                        <div className="mt-4 flex items-center gap-4 text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <Package className="mr-1 h-3 w-3" />
                                {accountProducts.length} Produk Tersedia
                            </span>
                            <span className="inline-flex items-center rounded-full bg-emerald-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                {
                                    accountProducts.filter(
                                        (p) =>
                                            p.accounts && p.accounts.length > 0
                                    ).length
                                }{" "}
                                Produk Aktif
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Button
                            onClick={openCreateModal}
                            className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Produk</span>
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
                                placeholder="Cari berdasarkan nama, kode, atau deskripsi produk..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm transition-colors duration-200 shadow-sm ${
                                    hasActiveFilters
                                        ? "bg-[#00529C] text-white border-[#00529C]"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <ListFilter className="h-4 w-4 mr-2" />
                                Filter & Urut
                                {hasActiveFilters && (
                                    <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-[#00529C] bg-white rounded-full">
                                        {[
                                            searchTerm ? 1 : 0,
                                            typeFilter !== "all" ? 1 : 0,
                                        ].reduce((a, b) => a + b, 0)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel (Expandable) */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Urutkan Berdasarkan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm focus:border-[#00529C] focus:ring-[#00529C]"
                                        value={sortField}
                                        onChange={(e) =>
                                            handleSort(e.target.value)
                                        }
                                    >
                                        <option value="name">
                                            Nama Produk
                                        </option>
                                        <option value="code">
                                            Kode Produk
                                        </option>
                                        <option value="description">
                                            Deskripsi
                                        </option>
                                        <option value="created_at">
                                            Tanggal Dibuat
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arah Urutan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm focus:border-[#00529C] focus:ring-[#00529C]"
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
                                <div className="flex items-end gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-sm h-10"
                                        onClick={clearAllFilters}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reset
                                    </Button>
                                    <Button
                                        className="flex-1 bg-[#00529C] hover:bg-[#003b75] text-white h-10 text-sm"
                                        onClick={() => setShowFilters(false)}
                                    >
                                        Terapkan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search results counter */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C] mr-2">
                                {filteredProducts.length}
                            </span>
                            produk ditemukan
                            {hasActiveFilters && (
                                <span className="ml-2 text-xs text-amber-600">
                                    (dari {accountProducts.length} total)
                                </span>
                            )}
                        </div>

                        {/* Show current page info */}
                        {filteredProducts.length > 0 && (
                            <div className="text-sm text-gray-500">
                                Halaman {currentPage} dari {totalPages}
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    No.
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center">
                                        Produk
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("code")}
                                >
                                    <div className="flex items-center">
                                        Kode
                                        {sortField === "code" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("description")}
                                >
                                    <div className="flex items-center">
                                        Deskripsi
                                        {sortField === "description" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Jumlah Akun
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("created_at")}
                                >
                                    <div className="flex items-center">
                                        Tanggal Dibuat
                                        {sortField === "created_at" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                                            >
                                                <Hash className="h-3 w-3 mr-1" />
                                                {product.code}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <FileText className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                    {product.description ||
                                                        "Tidak ada deskripsi"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.accounts
                                                        ? product.accounts
                                                              .length
                                                        : 0}{" "}
                                                    akun
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                                                {formatDate(product.created_at)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(product)
                                                    }
                                                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(product)
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
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        {hasActiveFilters ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada produk yang sesuai
                                                </p>
                                                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                                                    Coba gunakan kata kunci lain
                                                    atau ubah filter pencarian
                                                </p>
                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={clearSearch}
                                                        className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Hapus Pencarian
                                                    </button>
                                                    <button
                                                        onClick={
                                                            clearAllFilters
                                                        }
                                                        className="inline-flex items-center rounded-lg bg-[#00529C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003b75] transition-colors duration-200"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Reset Semua Filter
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="rounded-full bg-blue-50 p-4 mb-3">
                                                    <Archive className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada produk rekening
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Silakan tambahkan produk
                                                    rekening baru untuk mulai
                                                    mengelola jenis tabungan
                                                    Bank BRI
                                                </p>
                                                <button
                                                    onClick={openCreateModal}
                                                    className="mt-6 inline-flex items-center rounded-lg bg-[#00529C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tambah Produk Rekening
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-200">
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredProducts.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            showItemsPerPage={true}
                            itemsPerPageOptions={[5, 10, 25, 50]}
                            className="w-full"
                        />
                    </div>
                )}
            </div>

            {/* Render modals */}
            <CreateAccountProductModal
                isOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
            />

            {currentProduct && (
                <EditAccountProductModal
                    isOpen={showEditModal}
                    closeModal={() => setShowEditModal(false)}
                    product={currentProduct}
                />
            )}

            <DeleteAccountProductModal
                isOpen={showDeleteModal}
                closeModal={() => setShowDeleteModal(false)}
                product={currentProduct}
            />
        </AuthenticatedLayout>
    );
};

export default AccountProductsIndex;
