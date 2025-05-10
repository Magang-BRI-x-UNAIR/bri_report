import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { AccountProduct, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    CreditCard,
    ChevronRight,
    ListFilter,
    ArrowUpDown,
    X,
    Save,
    FileText,
    Tag,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";

interface AccountProductsIndexProps extends PageProps {
    accountProducts: AccountProduct[];
}

const AccountProductsIndex = () => {
    const { accountProducts } = usePage<AccountProductsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<
        Partial<AccountProduct>
    >({
        name: "",
        code: "",
        description: "",
    });
    // State untuk modal delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] =
        useState<AccountProduct | null>(null);
    const [errors, setErrors] = useState<{
        name?: string;
        code?: string;
        description?: string;
    }>({});

    // Filter account products based on search term
    const filteredProducts = accountProducts
        .filter(
            (product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description &&
                    product.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        )
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
            } else if (sortField === "accounts") {
                return sortDirection === "asc"
                    ? (a.accounts?.length || 0) - (b.accounts?.length || 0)
                    : (b.accounts?.length || 0) - (a.accounts?.length || 0);
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

    // Modal functions
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentProduct({ name: "", description: "" });
        setErrors({});
        setShowModal(true);
    };

    const openEditModal = (product: AccountProduct) => {
        setIsEditing(true);
        setCurrentProduct({ ...product });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setCurrentProduct((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: {
            name?: string;
            code?: string;
            description?: string;
        } = {};

        if (!currentProduct.name?.trim()) {
            newErrors.name = "Nama produk harus diisi";
        }

        if (!currentProduct.code?.trim()) {
            newErrors.code = "Kode produk harus diisi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isEditing) {
            // Update existing product
            router.put(
                route("account-products.update", currentProduct.id),
                currentProduct as any,
                {
                    onSuccess: () => {
                        closeModal();
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                }
            );
        } else {
            // Create new product
            router.post(
                route("account-products.store"),
                currentProduct as any,
                {
                    onSuccess: () => {
                        closeModal();
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                }
            );
        }
    };

    // Fungsi untuk membuka modal delete
    const openDeleteModal = (product: AccountProduct) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    // Fungsi untuk menutup modal delete
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    // Fungsi untuk menghapus product
    const handleDelete = () => {
        if (!productToDelete) return;

        router.delete(route("account-products.destroy", productToDelete.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
        });
    };

    // Format date function
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
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
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {accountProducts.length} Produk Terdaftar
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Button
                            onClick={openCreateModal}
                            className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Buat Produk</span>
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
                                placeholder="Cari produk berdasarkan nama atau deskripsi..."
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
                                            Nama Produk
                                        </option>
                                        <option value="code">
                                            Kode Produk
                                        </option>
                                        <option value="description">
                                            Deskripsi
                                        </option>
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
                            {filteredProducts.length}
                        </span>
                        produk ditemukan
                    </div>
                </div>

                {/* Products Table */}
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
                                        Nama Produk
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
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

                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Tanggal Dibuat
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
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                                            {product.code}
                                                        </span>
                                                        <span>
                                                            ID: BRI-P-
                                                            {product.id
                                                                .toString()
                                                                .padStart(
                                                                    4,
                                                                    "0"
                                                                )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                    {product.description ||
                                                        "Tidak ada deskripsi"}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {formatDate(product.created_at)}
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
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        {searchTerm ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada produk yang sesuai
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
                                                    <CreditCard className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data produk
                                                    rekening
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

                {/* Footer info section */}
                {filteredProducts.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            Menampilkan {filteredProducts.length} dari{" "}
                            {accountProducts.length} produk
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

            {/* Modal Confirmation untuk Delete */}
            {showDeleteModal && productToDelete && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={closeDeleteModal}
                        ></div>

                        {/* Modal panel */}
                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-red-600 px-4 py-3 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    Konfirmasi Penghapusan
                                </h3>
                                <button
                                    type="button"
                                    className="bg-red-600 rounded-md text-white hover:bg-red-700 focus:outline-none"
                                    onClick={closeDeleteModal}
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900"
                                            id="modal-title"
                                        >
                                            Hapus Produk Rekening
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Apakah Anda yakin ingin
                                                menghapus produk rekening{" "}
                                                <span className="font-medium text-gray-900">
                                                    "{productToDelete.name}"
                                                </span>
                                                ? Tindakan ini tidak dapat
                                                dibatalkan dan semua data
                                                terkait produk ini akan dihapus
                                                secara permanen.
                                            </p>
                                        </div>
                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                                <span>
                                                    <span className="font-medium">
                                                        {productToDelete.code}
                                                    </span>{" "}
                                                    · ID: BRI-P-
                                                    {productToDelete.id
                                                        .toString()
                                                        .padStart(4, "0")}
                                                </span>
                                            </div>
                                            <div className="flex items-center mt-1.5 text-sm text-gray-500">
                                                <Tag className="h-4 w-4 text-gray-400 mr-2" />
                                                <span>
                                                    {productToDelete.accounts
                                                        ?.length || 0}{" "}
                                                    rekening terdaftar dengan
                                                    produk ini
                                                </span>
                                            </div>
                                            {productToDelete.accounts &&
                                                productToDelete.accounts
                                                    .length > 0 && (
                                                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-medium">
                                                        Perhatian: Penghapusan
                                                        produk ini akan
                                                        mempengaruhi{" "}
                                                        {
                                                            productToDelete
                                                                .accounts.length
                                                        }{" "}
                                                        rekening yang terkait
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleDelete}
                                >
                                    Hapus Produk
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={closeDeleteModal}
                                >
                                    Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Create/Edit Product */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={closeModal}
                        ></div>

                        {/* Modal panel */}
                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-[#00529C] px-4 py-3 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    {isEditing
                                        ? "Edit Produk Rekening"
                                        : "Tambah Produk Rekening Baru"}
                                </h3>
                                <button
                                    type="button"
                                    className="bg-[#00529C] rounded-md text-white hover:bg-[#003b75] focus:outline-none"
                                    onClick={closeModal}
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="code"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Kode Produk
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                id="code"
                                                value={
                                                    currentProduct.code || ""
                                                }
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                                    errors.code
                                                        ? "border-red-300"
                                                        : ""
                                                }`}
                                                placeholder="Contoh: BM, VM, SIMPEDES"
                                                autoFocus
                                            />
                                            {errors.code && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.code}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Nama Produk Rekening
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={
                                                    currentProduct.name || ""
                                                }
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                                    errors.name
                                                        ? "border-red-300"
                                                        : ""
                                                }`}
                                                placeholder="Contoh: Britama Bisnis"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="description"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Deskripsi (Opsional)
                                            </label>
                                            <textarea
                                                name="description"
                                                id="description"
                                                rows={3}
                                                value={
                                                    currentProduct.description ||
                                                    ""
                                                }
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                                    errors.description
                                                        ? "border-red-300"
                                                        : ""
                                                }`}
                                                placeholder="Deskripsi singkat tentang produk rekening ini"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00529C] text-base font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditing
                                            ? "Update Produk"
                                            : "Simpan Produk"}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={closeModal}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default AccountProductsIndex;
