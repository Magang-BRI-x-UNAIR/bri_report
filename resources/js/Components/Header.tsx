"use client";

import type { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import {
    Menu,
    Search,
    ChevronDown,
    Settings,
    LogOut,
    UserCircle,
    HelpCircle,
    Bell,
    ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
    toggleSidebar: () => void;
    toggleUserDropdown?: () => void;
    userDropdownOpen?: boolean;
}

const Header = ({
    toggleSidebar,
    toggleUserDropdown: propToggleUserDropdown,
    userDropdownOpen: propUserDropdownOpen,
}: HeaderProps) => {
    const { auth } = usePage<PageProps>().props;
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // Internal state if not provided from props
    const [internalUserDropdownOpen, setInternalUserDropdownOpen] =
        useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Determine if we're using internal or prop-based state
    const userDropdownOpen =
        propUserDropdownOpen !== undefined
            ? propUserDropdownOpen
            : internalUserDropdownOpen;
    const toggleUserDropdown =
        propToggleUserDropdown ||
        (() => {
            setInternalUserDropdownOpen((prev) => !prev);
        });

    const handleSearchFocus = () => {
        setSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setSearchFocused(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        searchInputRef.current?.focus();
    };

    // Handle keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Close dropdown on escape
            if (e.key === "Escape" && userDropdownOpen) {
                toggleUserDropdown();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [userDropdownOpen, toggleUserDropdown]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userDropdownOpen &&
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target as Node)
            ) {
                toggleUserDropdown();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [userDropdownOpen, toggleUserDropdown]);

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!auth.user?.name) return "U";
        return auth.user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 shadow-sm border-b border-gray-200 bg-white text-gray-800 sm:px-6">
            <div className="md:hidden flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="rounded-md p-2 transition-colors duration-200 text-[#00529C] hover:bg-gray-100 hover:text-[#F37021] lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Search */}
            <div
                className={`relative max-w-md w-full mx-4 transition-all duration-300 ${
                    searchFocused ? "scale-105" : ""
                }`}
                ref={searchRef}
            >
                <div
                    className={`relative rounded-md shadow-sm ${
                        searchFocused ? "ring-2 ring-[#00529C]" : ""
                    }`}
                >
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search
                            className={`h-4 w-4 ${
                                searchFocused
                                    ? "text-[#00529C]"
                                    : "text-gray-400"
                            }`}
                        />
                    </div>
                    <input
                        ref={searchInputRef}
                        id="search"
                        name="search"
                        className="block w-full rounded-md py-2 pl-10 pr-10 text-sm 
                            bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 
                            focus:outline-none focus:border-[#00529C] transition-colors duration-200"
                        placeholder="Cari nasabah, rekening, atau cabang..."
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-xs bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center">
                                ×
                            </span>
                        </button>
                    )}
                    {searchFocused && !searchTerm && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded-md border border-gray-300 text-xs">
                                /
                            </kbd>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-1 sm:space-x-3">
                {/* Notifications */}
                <button
                    className="relative p-1.5 rounded-full transition-colors duration-200 hidden sm:block
                        text-[#00529C] hover:bg-gray-100 hover:text-[#F37021]"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* Help */}
                <button
                    className="p-1.5 rounded-full transition-colors duration-200 hidden sm:block
                        text-[#00529C] hover:bg-gray-100 hover:text-[#F37021]"
                    aria-label="Help"
                >
                    <HelpCircle className="h-5 w-5" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={userDropdownRef}>
                    <button
                        onClick={toggleUserDropdown}
                        className="flex items-center space-x-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:ring-offset-2 transition-all duration-200 p-1"
                        id="user-menu"
                        aria-expanded={userDropdownOpen}
                        aria-haspopup="true"
                    >
                        {/* User avatar */}
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00529C] to-[#003b75] flex items-center justify-center text-white font-medium text-sm shadow-sm">
                            {getUserInitials()}
                        </div>
                        <div className="hidden md:flex md:items-center">
                            <span className="text-sm font-medium text-gray-700">
                                {auth.user?.name}
                            </span>
                            <ChevronDown
                                className={`ml-1 h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                    userDropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    {userDropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none divide-y divide-gray-100 transform opacity-100 scale-100 transition-all duration-200 ease-out"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="user-menu"
                        >
                            <div className="px-4 py-3 bg-gray-50/70">
                                <p className="text-sm font-medium text-gray-900">
                                    {auth.user?.name}
                                </p>
                                <p className="truncate text-xs text-gray-500 mt-0.5">
                                    {auth.user?.email}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        Online
                                    </span>
                                </div>
                            </div>

                            <div className="py-1">
                                <Link
                                    href={route("profile.edit")}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00529C] transition-colors"
                                    role="menuitem"
                                >
                                    <UserCircle className="mr-3 h-4 w-4" />
                                    Profil Anda
                                </Link>
                                <Link
                                    href={route("profile.edit")}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00529C] transition-colors"
                                    role="menuitem"
                                >
                                    <Settings className="mr-3 h-4 w-4" />
                                    Pengaturan
                                </Link>
                                <a
                                    href="https://bri.co.id"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00529C] transition-colors"
                                    role="menuitem"
                                >
                                    <ExternalLink className="mr-3 h-4 w-4" />
                                    Website BRI
                                </a>
                            </div>

                            <div className="py-1">
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    role="menuitem"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
