import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { UniversalBanker } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    CreditCard,
    Search,
    Eye,
    Filter,
    XCircle,
    ArrowUpDown,
    X,
    DollarSign,
    Calendar,
    User,
    TrendingUp,
    TrendingDown,
    Minus,
    FileX,
    AlertCircle,
    CheckCircle,
    Clock,
    Ban,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import ClientPagination from "@/Components/ClientPagination";

interface AccountTabProps {
    universalBanker: UniversalBanker;
}

const AccountTab: React.FC<AccountTabProps> = ({ universalBanker }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [sortBy, setSortBy] = useState("client.name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get unique product types for filter
    const accountProducts = useMemo(() => {
        if (!universalBanker?.accounts) return [];
        const types = new Set<string>();
        universalBanker.accounts.forEach((account) => {
            if (account.account_product?.name) {
                types.add(account.account_product.name);
            }
        });
        return Array.from(types);
    }, [universalBanker?.accounts]);

    // Get unique statuses for filter
    const statuses = useMemo(() => {
        if (!universalBanker?.accounts) return [];
        const statusSet = new Set<string>();
        universalBanker.accounts.forEach((account) => {
            if (account.status) {
                statusSet.add(account.status);
            }
        });
        return Array.from(statusSet);
    }, [universalBanker?.accounts]);

    // Filter and sort accounts
    const filteredAccounts = useMemo(() => {
        if (!universalBanker?.accounts) {
            return [];
        }
        return universalBanker.accounts
            .filter((account) => {
                if (!account.client || !account.account_product) return false;

                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    searchQuery === "" ||
                    account.account_number
                        .toLowerCase()
                        .includes(searchLower) ||
                    account.client.name.toLowerCase().includes(searchLower) ||
                    account.client.cif.toLowerCase().includes(searchLower) ||
                    (account.client.email &&
                        account.client.email
                            .toLowerCase()
                            .includes(searchLower));

                const matchesStatus =
                    statusFilter === "all" || account.status === statusFilter;

                const matchesProduct =
                    productFilter === "all" ||
                    account.account_product.name === productFilter;

                return matchesSearch && matchesStatus && matchesProduct;
            })
            .sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "client.name") {
                    valueA = a.client?.name || "";
                    valueB = b.client?.name || "";
                } else if (sortBy === "account_number") {
                    valueA = a.account_number || "";
                    valueB = b.account_number || "";
                } else if (sortBy === "current_balance") {
                    valueA = a.current_balance || 0;
                    valueB = b.current_balance || 0;
                } else if (sortBy === "account_product.name") {
                    valueA = a.account_product?.name || "";
                    valueB = b.account_product?.name || "";
                } else if (sortBy === "status") {
                    valueA = a.status || "";
                    valueB = b.status || "";
                } else {
                    valueA = new Date(a.opened_at || 0).getTime();
                    valueB = new Date(b.opened_at || 0).getTime();
                }

                if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
                if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
    }, [
        universalBanker?.accounts,
        searchQuery,
        statusFilter,
        productFilter,
        sortBy,
        sortOrder,
    ]);

    // Pagination
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAccounts = filteredAccounts.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Check if there are any active filters
    const hasActiveFilters =
        searchQuery.length > 0 ||
        statusFilter !== "all" ||
        productFilter !== "all";

    // Handle sort change
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setProductFilter("all");
        setCurrentPage(1);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
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

    // Get status color and icon
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200";
            case "inactive":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "blocked":
                return "bg-red-100 text-red-800 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return <CheckCircle className="h-3 w-3" />;
            case "inactive":
                return <Minus className="h-3 w-3" />;
            case "blocked":
                return <Ban className="h-3 w-3" />;
            case "pending":
                return <Clock className="h-3 w-3" />;
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    // Get balance trend indicator
    const getBalanceTrend = (
        currentBalance: number,
        availableBalance: number
    ) => {
        if (currentBalance > availableBalance) {
            return {
                icon: <TrendingUp className="h-3 w-3 text-green-600" />,
                text: "Tinggi",
                className: "text-green-600",
            };
        } else if (currentBalance < availableBalance) {
            return {
                icon: <TrendingDown className="h-3 w-3 text-red-600" />,
                text: "Rendah",
                className: "text-red-600",
            };
        } else {
            return {
                icon: <Minus className="h-3 w-3 text-gray-600" />,
                text: "Seimbang",
                className: "text-gray-600",
            };
        }
    };

    // Calculate statistics
    const accountStats = useMemo(() => {
        const total = filteredAccounts.length;
        const activeAccounts = filteredAccounts.filter(
            (acc) => acc.status === "active"
        ).length;

        // Pastikan current_balance dikonversi ke number
        const totalBalance = filteredAccounts.reduce((sum, acc) => {
            return (
                sum +
                (typeof acc.current_balance === "string"
                    ? parseFloat(acc.current_balance)
                    : acc.current_balance || 0)
            );
        }, 0);

        const averageBalance = total > 0 ? totalBalance / total : 0;

        return {
            total,
            activeAccounts,
            totalBalance,
            averageBalance,
        };
    }, [filteredAccounts]);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Daftar Rekening Nasabah
                            </CardTitle>
                            <CardDescription className="text-blue-700/70">
                                Semua rekening yang dikelola oleh{" "}
                                <span className="font-semibold text-blue-800">
                                    {universalBanker.name}
                                </span>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    <CreditCard className="mr-1 h-3 w-3" />
                                    {universalBanker.accounts?.length || 0}{" "}
                                    Total Rekening
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50/50 border-b border-gray-100">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        Total Rekening
                                    </p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {accountStats.total}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        Rekening Aktif
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                        {accountStats.activeAccounts}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        Total Saldo
                                    </p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatCurrency(
                                            accountStats.totalBalance
                                        )}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        Rata-rata Saldo
                                    </p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatCurrency(
                                            accountStats.averageBalance
                                        )}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/70">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    placeholder="Cari nasabah, nomor rekening, atau CIF..."
                                    className="pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Filter Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        {statuses.map((status) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(status)}
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={productFilter}
                                    onValueChange={setProductFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter Produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Produk
                                        </SelectItem>
                                        {accountProducts.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={resetFilters}
                                    title="Reset filter"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Filter indicator */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 mr-2">
                                    {filteredAccounts.length}
                                </span>
                                rekening ditemukan
                                {hasActiveFilters && (
                                    <span className="ml-2 text-xs text-amber-600">
                                        (dari{" "}
                                        {universalBanker.accounts?.length || 0}{" "}
                                        total)
                                    </span>
                                )}
                            </div>

                            {filteredAccounts.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    Halaman {currentPage} dari {totalPages}
                                </div>
                            )}
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-3 flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-md text-sm">
                                <Filter className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700">
                                    Filter aktif
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                                    onClick={resetFilters}
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Reset Filter
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Accounts Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            handleSort("client.name")
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4 text-gray-500" />
                                            Nama Nasabah
                                            {sortBy === "client.name" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            handleSort("account_number")
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="h-4 w-4 text-gray-500" />
                                            Nomor Rekening
                                            {sortBy === "account_number" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            handleSort("account_product.name")
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            Jenis Produk
                                            {sortBy ===
                                                "account_product.name" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            handleSort("current_balance")
                                        }
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            <DollarSign className="h-4 w-4 text-gray-500" />
                                            Saldo
                                            {sortBy === "current_balance" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort("status")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            {sortBy === "status" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort("opened_at")}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            Tanggal Dibuka
                                            {sortBy === "opened_at" && (
                                                <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-600" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[80px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentAccounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center"
                                        >
                                            {hasActiveFilters ? (
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="rounded-full bg-gray-100 p-3">
                                                        <Search className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-medium text-gray-900">
                                                            Tidak ada rekening
                                                            yang sesuai
                                                        </p>
                                                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                                                            Coba gunakan kata
                                                            kunci lain atau ubah
                                                            filter pencarian
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={resetFilters}
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Reset Filter
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="rounded-full bg-blue-50 p-3">
                                                        <FileX className="h-8 w-8 text-blue-600" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-medium text-gray-900">
                                                            Belum ada rekening
                                                        </p>
                                                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                                                            Universal Banker ini
                                                            belum mengelola
                                                            rekening apapun
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentAccounts.map((account, index) => (
                                        <TableRow
                                            key={account.id}
                                            className={`hover:bg-blue-50/40 transition-colors ${
                                                index % 2 === 0
                                                    ? "bg-gray-50/30"
                                                    : ""
                                            }`}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-blue-700">
                                                            {account.client.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {
                                                                account.client
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            CIF:{" "}
                                                            {account.client.cif}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-sm font-medium text-gray-800">
                                                    {account.account_number}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {
                                                        account.account_product
                                                            .name
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="font-medium text-gray-900">
                                                        {formatCurrency(
                                                            account.current_balance
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        {
                                                            getBalanceTrend(
                                                                account.current_balance,
                                                                account.available_balance
                                                            ).icon
                                                        }
                                                        <span
                                                            className={
                                                                getBalanceTrend(
                                                                    account.current_balance,
                                                                    account.available_balance
                                                                ).className
                                                            }
                                                        >
                                                            {
                                                                getBalanceTrend(
                                                                    account.current_balance,
                                                                    account.available_balance
                                                                ).text
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getStatusColor(
                                                        account.status
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(
                                                            account.status
                                                        )}
                                                        {account.status}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-700">
                                                    {formatDate(
                                                        account.opened_at
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={route(
                                                                    "accounts.show",
                                                                    account.id
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Lihat detail
                                                                rekening
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredAccounts.length > 0 && (
                        <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-200">
                            <ClientPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredAccounts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                showItemsPerPage={true}
                                itemsPerPageOptions={[5, 10, 15, 20, 25]}
                                className="w-full"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountTab;
