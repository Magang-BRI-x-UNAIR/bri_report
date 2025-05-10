import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Position } from "@/types";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Briefcase,
    ChevronRight,
    FileText,
    ListFilter,
    ArrowUpDown,
    X,
    Save,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";

interface PositionsIndexProps extends PageProps {
    positions: Position[];
}

const PositionsIndex = () => {
    const { positions } = usePage<PositionsIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<Partial<Position>>({
        name: "",
        description: "",
    });
    // State untuk modal delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(
        null
    );
    const [errors, setErrors] = useState<{
        name?: string;
        description?: string;
    }>({});

    // Filter positions based on search term
    const filteredPositions = positions
        .filter(
            (position) =>
                position.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                position.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "description") {
                return sortDirection === "asc"
                    ? a.description.localeCompare(b.description)
                    : b.description.localeCompare(a.description);
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
        setCurrentPosition({ name: "", description: "" });
        setErrors({});
        setShowModal(true);
    };

    const openEditModal = (position: Position) => {
        setIsEditing(true);
        setCurrentPosition({ ...position });
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
        setCurrentPosition((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { name?: string; description?: string } = {};

        if (!currentPosition.name?.trim()) {
            newErrors.name = "Nama jabatan harus diisi";
        }

        if (!currentPosition.description?.trim()) {
            newErrors.description = "Deskripsi jabatan harus diisi";
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
            // Update existing position
            router.put(
                route("positions.update", currentPosition.id),
                currentPosition as any,
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
            // Create new position
            router.post(route("positions.store"), currentPosition as any, {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            });
        }
    };

    // Fungsi untuk membuka modal delete
    const openDeleteModal = (position: Position) => {
        setPositionToDelete(position);
        setShowDeleteModal(true);
    };

    // Fungsi untuk menutup modal delete
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPositionToDelete(null);
    };

    // Fungsi untuk menghapus jabatan
    const handleDelete = () => {
        if (!positionToDelete) return;

        router.delete(route("positions.destroy", positionToDelete.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jabatan | Bank BRI" />
            <Breadcrumb items={[{ label: "Jabatan" }]} />

            {/* Hero Section with Animated Background */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Jabatan
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua jabatan karyawan Bank BRI
                        </p>
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {positions.length} Jabatan Terdaftar
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Button
                            onClick={openCreateModal}
                            className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Buat Jabatan</span>
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
                                placeholder="Cari jabatan berdasarkan nama atau deskripsi..."
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
                                            Nama Jabatan
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
                            {filteredPositions.length}
                        </span>
                        jabatan ditemukan
                    </div>
                </div>

                {/* Positions Table */}
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
                                        Nama Jabatan
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
                                    className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredPositions.length > 0 ? (
                                filteredPositions.map((position, index) => (
                                    <tr
                                        key={position.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                                                    <Briefcase className="h-5 w-5 text-[#00529C]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {position.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        ID: BRI-POS-
                                                        {position.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <FileText className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                    {position.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <Link
                                                    href={route(
                                                        "positions.show",
                                                        position.id
                                                    )}
                                                    className="rounded-lg p-2 text-[#00529C] hover:bg-blue-50 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(position)
                                                    }
                                                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            position
                                                        )
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
                                                    Tidak ada jabatan yang
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
                                                    <Briefcase className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data jabatan
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Silakan tambahkan jabatan
                                                    baru untuk mulai mengelola
                                                    data jabatan Bank BRI
                                                </p>
                                                <button
                                                    onClick={openCreateModal}
                                                    className="mt-6 inline-flex items-center rounded-lg bg-[#00529C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tambah Jabatan Baru
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
                {filteredPositions.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            Menampilkan {filteredPositions.length} dari{" "}
                            {positions.length} jabatan
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
            {showDeleteModal && positionToDelete && (
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
                                            Hapus Jabatan
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Apakah Anda yakin ingin
                                                menghapus jabatan{" "}
                                                <span className="font-medium text-gray-900">
                                                    "{positionToDelete.name}"
                                                </span>
                                                ? Tindakan ini tidak dapat
                                                dibatalkan dan semua data
                                                terkait jabatan ini akan dihapus
                                                secara permanen.
                                            </p>
                                        </div>
                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                                                <span>
                                                    ID: BRI-POS-
                                                    {positionToDelete.id
                                                        .toString()
                                                        .padStart(4, "0")}
                                                </span>
                                            </div>
                                            <div className="flex items-start mt-1.5 text-sm text-gray-500">
                                                <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                <span>
                                                    {
                                                        positionToDelete.description
                                                    }
                                                </span>
                                            </div>
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
                                    Hapus Jabatan
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

            {/* Modal for Create/Edit Position */}
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
                                        ? "Edit Jabatan"
                                        : "Tambah Jabatan Baru"}
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
                                                htmlFor="name"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Nama Jabatan
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={
                                                    currentPosition.name || ""
                                                }
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                                    errors.name
                                                        ? "border-red-300"
                                                        : ""
                                                }`}
                                                placeholder="Masukkan nama jabatan"
                                                autoFocus
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
                                                Deskripsi
                                            </label>
                                            <textarea
                                                name="description"
                                                id="description"
                                                rows={3}
                                                value={
                                                    currentPosition.description ||
                                                    ""
                                                }
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                                    errors.description
                                                        ? "border-red-300"
                                                        : ""
                                                }`}
                                                placeholder="Masukkan deskripsi jabatan"
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
                                            ? "Update Jabatan"
                                            : "Simpan Jabatan"}
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

export default PositionsIndex;
