import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
export function classNames(
    ...classes: (string | boolean | undefined | null)[]
): string {
    return classes.filter(Boolean).join(" ");
}

export const formatCompactCurrency = (value: number) => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} M`;
    } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)} Jt`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)} Rb`;
    }
    return value.toString();
};

export const formatCurrency = (amount: number, currency = "IDR") => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
};
