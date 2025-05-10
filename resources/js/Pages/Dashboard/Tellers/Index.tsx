import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, User } from "@/types";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    ChevronRight,
    Mail,
    ListFilter,
    ArrowUpDown,
    X,
    User as UserIcon,
    Briefcase,
    Building2,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";

interface TellersIndexProps extends PageProps {
    tellers: User[];
}

const TellersIndex = () => {
    const { tellers } = usePage<TellersIndexProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [filterPosition, setFilterPosition] = useState("");
    const [filterBranch, setFilterBranch] = useState("");

    // Get unique positions and branches for filters
    const positions = [
        ...new Set(tellers.map((teller) => teller.position?.name)),
    ].filter(Boolean);
    const branches = [
        ...new Set(tellers.map((teller) => teller.branch?.name)),
    ].filter(Boolean);

    // State untuk modal delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tellerToDelete, setTellerToDelete] = useState<User | null>(null);

    // Filter tellers based on search term and filters
    const filteredTellers = tellers
        .filter(
            (teller) =>
                (teller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    teller.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    teller.branch?.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    teller.position?.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) &&
                (!filterPosition || teller.position?.name === filterPosition) &&
                (!filterBranch || teller.branch?.name === filterBranch)
        )
        .sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "email") {
                return sortDirection === "asc"
                    ? a.email.localeCompare(b.email)
                    : b.email.localeCompare(a.email);
            } else if (sortField === "branch") {
                const branchA = a.branch?.name || "";
                const branchB = b.branch?.name || "";
                return sortDirection === "asc"
                    ? branchA.localeCompare(branchB)
                    : branchB.localeCompare(branchA);
            } else if (sortField === "position") {
                const positionA = a.position?.name || "";
                const positionB = b.position?.name || "";
                return sortDirection === "asc"
                    ? positionA.localeCompare(positionB)
                    : positionB.localeCompare(positionA);
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

    const clearAllFilters = () => {
        setSearchTerm("");
        setFilterPosition("");
        setFilterBranch("");
    };

    // Fungsi untuk membuka modal delete
    const openDeleteModal = (teller: User) => {
        setTellerToDelete(teller);
        setShowDeleteModal(true);
    };

    // Fungsi untuk menutup modal delete
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTellerToDelete(null);
    };

    // Fungsi untuk menghapus teller
    const handleDelete = () => {
        if (!tellerToDelete) return;

        router.delete(route("tellers.destroy", tellerToDelete.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
        });
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teller | Bank BRI" />
            <Breadcrumb items={[{ label: "Teller" }]} />

            {/* Hero Section with Animated Background */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Manajemen Teller
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                            Kelola semua teller Bank BRI di seluruh cabang
                        </p>
                        <div className="mt-4 flex items-center text-blue-100 text-sm">
                            <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                {tellers.length} Teller Terdaftar
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <Link href={route("tellers.create")}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200 px-5 py-2.5">
                                <Plus className="h-4 w-4" />
                                <span>Tambah Teller</span>
                            </Button>
                        </Link>
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
                                placeholder="Cari teller berdasarkan nama, email, jabatan, atau cabang..."
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
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                            Nama Teller
                                        </option>
                                        <option value="email">Email</option>
                                        <option value="position">
                                            Jabatan
                                        </option>
                                        <option value="branch">Cabang</option>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter Jabatan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={filterPosition}
                                        onChange={(e) =>
                                            setFilterPosition(e.target.value)
                                        }
                                    >
                                        <option value="">Semua Jabatan</option>
                                        {positions.map((position) => (
                                            <option
                                                key={position}
                                                value={position}
                                            >
                                                {position}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter Cabang
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-200 text-sm"
                                        value={filterBranch}
                                        onChange={(e) =>
                                            setFilterBranch(e.target.value)
                                        }
                                    >
                                        <option value="">Semua Cabang</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-gray-600"
                                >
                                    <X className="h-4 w-4 mr-1" /> Reset Filter
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#00529C] hover:bg-[#003b75]"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Terapkan Filter
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Search results counter */}
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#00529C] mr-2">
                            {filteredTellers.length}
                        </span>
                        teller ditemukan
                    </div>
                </div>

                {/* Tellers Table */}
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
                                        Nama Teller
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("email")}
                                >
                                    <div className="flex items-center">
                                        Email
                                        {sortField === "email" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("position")}
                                >
                                    <div className="flex items-center">
                                        Jabatan
                                        {sortField === "position" && (
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#00529C]"
                                    onClick={() => handleSort("branch")}
                                >
                                    <div className="flex items-center">
                                        Cabang
                                        {sortField === "branch" && (
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
                            {filteredTellers.length > 0 ? (
                                filteredTellers.map((teller, index) => (
                                    <tr
                                        key={teller.id}
                                        className="hover:bg-blue-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {teller.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        ID: BRI-T-
                                                        {teller.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="text-sm text-gray-500">
                                                    {teller.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-500">
                                                    {teller.position?.name ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="text-sm text-gray-500 line-clamp-2">
                                                    {teller.branch?.name || "-"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <Link
                                                    href={route(
                                                        "tellers.show",
                                                        teller.id
                                                    )}
                                                    className="rounded-lg p-2 text-[#00529C] hover:bg-blue-50 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "tellers.edit",
                                                        teller.id
                                                    )}
                                                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(teller)
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
                                        {searchTerm ||
                                        filterPosition ||
                                        filterBranch ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="rounded-full bg-gray-100 p-4 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-lg font-medium text-gray-900">
                                                    Tidak ada teller yang sesuai
                                                </p>
                                                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                                                    Coba gunakan kata kunci lain
                                                    atau kurangi filter
                                                    pencarian
                                                </p>
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="mt-4 inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Hapus Filter
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="rounded-full bg-blue-50 p-4 mb-3">
                                                    <Users className="h-8 w-8 text-[#00529C]" />
                                                </div>
                                                <p className="mt-3 text-xl font-medium text-gray-900">
                                                    Belum ada data teller
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                                                    Silakan tambahkan teller
                                                    baru untuk mulai mengelola
                                                    data teller Bank BRI
                                                </p>
                                                <Link
                                                    href={route(
                                                        "tellers.create"
                                                    )}
                                                >
                                                    <Button className="mt-6 bg-[#00529C] hover:bg-[#003b75] gap-1.5">
                                                        <Plus className="h-4 w-4" />
                                                        Tambah Teller Baru
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

                {/* Footer info section */}
                {filteredTellers.length > 0 && (
                    <div className="bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            Menampilkan {filteredTellers.length} dari{" "}
                            {tellers.length} teller
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
            {showDeleteModal && tellerToDelete && (
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
                                            Hapus Teller
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Apakah Anda yakin ingin
                                                menghapus data teller{" "}
                                                <span className="font-medium text-gray-900">
                                                    "{tellerToDelete.name}"
                                                </span>
                                                ? Tindakan ini tidak dapat
                                                dibatalkan dan semua data
                                                terkait teller ini akan dihapus
                                                secara permanen.
                                            </p>
                                        </div>
                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                <span>
                                                    {tellerToDelete.email}
                                                </span>
                                            </div>
                                            {tellerToDelete.position && (
                                                <div className="flex items-start mt-1.5 text-sm text-gray-500">
                                                    <Briefcase className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <span>
                                                        {
                                                            tellerToDelete
                                                                .position.name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {tellerToDelete.branch && (
                                                <div className="flex items-start mt-1.5 text-sm text-gray-500">
                                                    <Building2 className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <span>
                                                        {
                                                            tellerToDelete
                                                                .branch.name
                                                        }
                                                    </span>
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
                                    Hapus Teller
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
        </AuthenticatedLayout>
    );
};

export default TellersIndex;
