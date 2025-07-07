"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
} from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
    className?: string;
}

const ClientPagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    showItemsPerPage = true,
    itemsPerPageOptions = [10, 25, 50, 100],
    className = "",
}) => {
    // Generate page numbers to display
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5; // Number of pages to show around current page

        if (totalPages <= showPages + 2) {
            // Show all pages if total pages is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate start and end of middle section
            let start = Math.max(2, currentPage - Math.floor(showPages / 2));
            let end = Math.min(
                totalPages - 1,
                currentPage + Math.floor(showPages / 2)
            );

            // Adjust if we're near the beginning or end
            if (currentPage <= Math.floor(showPages / 2) + 1) {
                end = Math.min(totalPages - 1, showPages);
            }
            if (currentPage >= totalPages - Math.floor(showPages / 2)) {
                start = Math.max(2, totalPages - showPages + 1);
            }

            // Add ellipsis if needed
            if (start > 2) {
                pages.push("...");
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (end < totalPages - 1) {
                pages.push("...");
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1 && !showItemsPerPage) {
        return null;
    }

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
        >
            {/* Items per page selector */}
            {showItemsPerPage && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Tampilkan</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) =>
                            onItemsPerPageChange(Number(value))
                        }
                    >
                        <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {itemsPerPageOptions.map((option) => (
                                <SelectItem
                                    key={option}
                                    value={option.toString()}
                                >
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">per halaman</span>
                </div>
            )}

            {/* Page info */}
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                    Menampilkan{" "}
                    <span className="font-medium text-gray-900">
                        {totalItems > 0 ? startItem : 0}
                    </span>{" "}
                    sampai{" "}
                    <span className="font-medium text-gray-900">{endItem}</span>{" "}
                    dari{" "}
                    <span className="font-medium text-gray-900">
                        {totalItems}
                    </span>{" "}
                    hasil
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        {/* First page button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                            title="Halaman pertama"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Previous page button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                            title="Halaman sebelumnya"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {pageNumbers.map((page, index) => (
                                <React.Fragment key={index}>
                                    {page === "..." ? (
                                        <div className="flex items-center justify-center h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </div>
                                    ) : (
                                        <Button
                                            variant={
                                                page === currentPage
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                onPageChange(page as number)
                                            }
                                            className="h-8 w-8 p-0"
                                            title={`Halaman ${page}`}
                                        >
                                            {page}
                                        </Button>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Next page button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                            title="Halaman selanjutnya"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last page button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                            title="Halaman terakhir"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPagination;
