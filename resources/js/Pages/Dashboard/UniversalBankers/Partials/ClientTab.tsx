import { useState } from "react";
import { Link } from "@inertiajs/react";
import { UniversalBanker, Client } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    Users,
    Search,
    Eye,
    Mail,
    Phone,
    Clock,
    User,
    X,
    UserX,
    Filter,
    Archive,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import ClientPagination from "@/Components/ClientPagination";

interface ClientTabProps {
    universalBanker: UniversalBanker;
    clients: Client[];
}

const ClientTab: React.FC<ClientTabProps> = ({ universalBanker, clients }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter clients based on search query
    const filteredClients = clients.filter((client) => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            client.name.toLowerCase().includes(searchLower) ||
            client.cif.toLowerCase().includes(searchLower) ||
            (client.email &&
                client.email.toLowerCase().includes(searchLower)) ||
            (client.phone && client.phone.toLowerCase().includes(searchLower))
        );
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentClients = filteredClients.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Check if there are any active filters
    const hasActiveFilters = searchQuery.length > 0;

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

    // Get client's accounts count
    const getClientAccountsCount = (clientId: number) => {
        return universalBanker.accounts.filter(
            (account) => Number(account.client.id) === clientId
        ).length;
    };

    // Get client's accounts
    const getClientAccounts = (clientId: number) => {
        return universalBanker.accounts.filter(
            (account) => Number(account.client.id) === clientId
        );
    };

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-emerald-800">
                                <Users className="h-5 w-5 text-emerald-600" />
                                Daftar Nasabah
                            </CardTitle>
                            <CardDescription className="text-emerald-700/70">
                                Semua nasabah yang ditangani oleh{" "}
                                <span className="font-semibold text-emerald-800">
                                    {universalBanker.name}
                                </span>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                                    <User className="mr-1 h-3 w-3" />
                                    {clients.length} Total Nasabah
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Search and Filter Section */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/70">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    placeholder="Cari nasabah berdasarkan nama, CIF, email, atau telepon..."
                                    className="pl-10 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
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
                        </div>

                        {/* Search results counter */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 mr-2">
                                    {filteredClients.length}
                                </span>
                                nasabah ditemukan
                                {hasActiveFilters && (
                                    <span className="ml-2 text-xs text-amber-600">
                                        (dari {clients.length} total)
                                    </span>
                                )}
                            </div>

                            {/* Show current page info */}
                            {filteredClients.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    Halaman {currentPage} dari {totalPages}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clients Grid */}
                    <div className="p-6">
                        {currentClients.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentClients.map((client, index) => (
                                    <div
                                        key={client.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:border-emerald-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-50 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg font-bold text-emerald-700">
                                                    {client.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {client.name}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-normal bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        {getClientAccountsCount(
                                                            Number(client.id)
                                                        )}{" "}
                                                        rekening
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center text-sm">
                                                        <span className="font-medium text-gray-500 min-w-[45px]">
                                                            CIF:
                                                        </span>
                                                        <span className="ml-2 font-mono text-gray-700">
                                                            {client.cif}
                                                        </span>
                                                    </div>

                                                    {client.email && (
                                                        <div className="flex items-center text-sm">
                                                            <Mail className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                                                            <span className="text-gray-600 truncate">
                                                                {client.email}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {client.phone && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                                                            <span className="text-gray-600">
                                                                {client.phone}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center text-sm">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                                                        <span className="text-gray-600">
                                                            Bergabung{" "}
                                                            {formatDate(
                                                                client.joined_at
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client's Accounts */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Rekening:
                                                </span>
                                                <div className="flex gap-1 flex-wrap">
                                                    {getClientAccounts(
                                                        Number(client.id)
                                                    )
                                                        .slice(0, 3)
                                                        .map((account) => (
                                                            <TooltipProvider
                                                                key={account.id}
                                                            >
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-xs ${
                                                                                account.status ===
                                                                                "active"
                                                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                account
                                                                                    .account_product
                                                                                    .name
                                                                            }
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="text-center">
                                                                            <p className="font-medium">
                                                                                {
                                                                                    account.account_number
                                                                                }
                                                                            </p>
                                                                            <p className="text-sm">
                                                                                {formatCurrency(
                                                                                    account.current_balance
                                                                                )}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                Status:{" "}
                                                                                {
                                                                                    account.status
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}

                                                    {getClientAccountsCount(
                                                        Number(client.id)
                                                    ) > 3 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {getClientAccountsCount(
                                                                Number(client.id)
                                                            ) - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 flex justify-end">
                                            <Link
                                                href={route(
                                                    "clients.show",
                                                    client.id
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs gap-1 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Lihat Detail
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                {hasActiveFilters ? (
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="rounded-full bg-gray-100 p-4">
                                            <Search className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-medium text-gray-900">
                                                Tidak ada nasabah yang sesuai
                                            </p>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                                                Coba gunakan kata kunci lain
                                                atau ubah filter pencarian
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={clearSearch}
                                                variant="outline"
                                                size="sm"
                                                className="gap-1"
                                            >
                                                <X className="h-4 w-4" />
                                                Hapus Pencarian
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="rounded-full bg-emerald-50 p-4">
                                            <UserX className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-medium text-gray-900">
                                                Belum ada nasabah
                                            </p>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                                                Universal Banker ini belum
                                                menangani nasabah apapun.
                                                Nasabah akan muncul di sini
                                                ketika Universal Banker mulai
                                                mengelola rekening.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredClients.length > 0 && (
                        <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-200">
                            <ClientPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredClients.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                showItemsPerPage={true}
                                itemsPerPageOptions={[5, 10, 15, 20]}
                                className="w-full"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientTab;
