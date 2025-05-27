import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
    items: T[];
    initialPage?: number;
    itemsPerPage?: number;
}

interface UsePaginationResult<T> {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    currentItems: T[];
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
    totalItems: number;
}

export function usePagination<T>({
    items,
    initialPage = 1,
    itemsPerPage = 10,
}: UsePaginationProps<T>): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [perPage, setItemsPerPage] = useState(itemsPerPage);

    // Reset to first page when items change
    useMemo(() => {
        if (currentPage > 1 && (currentPage - 1) * perPage >= items.length) {
            setCurrentPage(1);
        }
    }, [items, currentPage, perPage]);

    // Calculate total pages
    const totalPages = useMemo(
        () => Math.ceil(items.length / perPage),
        [items.length, perPage]
    );

    // Get current items
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        return items.slice(startIndex, startIndex + perPage);
    }, [items, currentPage, perPage]);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        currentItems,
        itemsPerPage: perPage,
        setItemsPerPage,
        totalItems: items.length,
    };
}
