"use client";

import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useMemo } from "react";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    showPageNumbers?: boolean;
    siblingCount?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalItems,
    perPage,
    onPageChange,
    showPageNumbers = true,
    siblingCount = 1,
    className = "",
}: PaginationProps) {
    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Calculate the range of items being displayed
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    // Generate page numbers to display
    const pageNumbers = useMemo(() => {
        if (!showPageNumbers) return [];

        const totalPageNumbers = siblingCount * 2 + 3; // Current + siblings on both sides + first + last

        // If we have fewer pages than we want to show, return all page numbers
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Calculate left and right sibling indexes
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(
            currentPage + siblingCount,
            totalPages
        );

        // Determine if we should show dots
        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 1;

        // Build the page numbers array
        const pages = [];

        // Always show first page
        pages.push(1);

        // Add left dots if needed
        if (showLeftDots) {
            pages.push(-1); // Use negative number to represent dots
        }

        // Add page numbers around current page
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
            if (i !== 1 && i !== totalPages) {
                pages.push(i);
            }
        }

        // Add right dots if needed
        if (showRightDots) {
            pages.push(-2); // Use another negative number to represent dots
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages, siblingCount, showPageNumbers]);

    // If there's only 1 page, don't show pagination
    if (totalPages <= 1) return null;

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
        >
            <div className="text-sm text-gray-500">
                Menampilkan {startItem}-{endItem} dari {totalItems} item
            </div>

            <div className="flex items-center space-x-2">
                {/* First page button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="Halaman pertama"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                {showPageNumbers &&
                    pageNumbers.map((page, index) => {
                        if (page < 0) {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-gray-400"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={`page-${page}`}
                                variant={
                                    currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                className={`h-8 w-8 ${
                                    currentPage === page
                                        ? "bg-[#00529C] hover:bg-[#003b75]"
                                        : ""
                                }`}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        );
                    })}

                {/* Next page button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman terakhir"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
