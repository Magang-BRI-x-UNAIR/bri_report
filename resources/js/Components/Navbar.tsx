"use client";

import type { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    Menu,
    X,
    ChevronDown,
    User,
    Settings,
    LogOut,
    Bell,
    Search,
} from "lucide-react";
import NavLink from "./NavLink";
import MobileNavLink from "./MobileNavLink";
import ProfileMenuItem from "./ProfileMenuItem";

const Navbar = () => {
    const { auth } = usePage<PageProps>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isProfileMenuOpen &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileMenuOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    return (
        <nav
            className={`w-full sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-white shadow-lg py-3"
                    : "bg-gradient-to-r from-[#003b75] to-[#00529C] py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-3">
                            <div
                                className={`rounded-xl ${
                                    isScrolled ? "bg-[#00529C]" : "bg-white/10"
                                }`}
                            >
                                <img
                                    src="/logo.png"
                                    alt="BRI Logo"
                                    className="h-8 w-auto"
                                />
                            </div>
                            <span
                                className={`text-xl font-bold tracking-tight ${
                                    isScrolled ? "text-[#00529C]" : "text-white"
                                }`}
                            >
                                BRI Report
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links - Center aligned */}
                    <div className="hidden md:flex md:items-center md:justify-center md:flex-1 mx-4">
                        <div className="flex space-x-1">
                            <NavLink
                                href="/"
                                label="Home"
                                isScrolled={isScrolled}
                            />
                            <NavLink
                                href="/about"
                                label="About"
                                isScrolled={isScrolled}
                            />
                            <NavLink
                                href="/contact"
                                label="Contact"
                                isScrolled={isScrolled}
                            />
                            {auth.user && (
                                <NavLink
                                    href="/dashboard"
                                    label="Dashboard"
                                    isScrolled={isScrolled}
                                />
                            )}
                        </div>
                    </div>

                    {/* Auth Links and Actions */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2 rounded-full transition-colors ${
                                isScrolled
                                    ? "text-gray-600 hover:bg-gray-100"
                                    : "text-white/90 hover:bg-white/10"
                            }`}
                        >
                            <Search size={20} />
                            <span className="sr-only">Search</span>
                        </button>

                        {/* Search Input (conditionally rendered) */}
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 transition-all duration-300 ease-in-out">
                                <div className="max-w-3xl mx-auto relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00529C]"
                                    />
                                    <Search
                                        className="absolute left-3 top-3.5 text-gray-400"
                                        size={18}
                                    />
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {auth.user ? (
                            <div
                                className="relative profile-menu"
                                ref={profileMenuRef}
                            >
                                {/* Notification Bell */}
                                <button
                                    className={`p-2 rounded-full mr-2 transition-colors ${
                                        isScrolled
                                            ? "text-gray-600 hover:bg-gray-100"
                                            : "text-white/90 hover:bg-white/10"
                                    }`}
                                >
                                    <Bell size={20} />
                                    <span className="sr-only">
                                        Notifications
                                    </span>
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#F37021]"></span>
                                </button>

                                {/* User Profile Button */}
                                <button
                                    type="button"
                                    className={`flex items-center space-x-2 rounded-full p-1.5 px-3 transition-colors duration-200 ${
                                        isScrolled
                                            ? "bg-blue-50 hover:bg-blue-100 text-[#00529C]"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                                    onClick={() =>
                                        setIsProfileMenuOpen(!isProfileMenuOpen)
                                    }
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#F37021] flex items-center justify-center text-white font-medium">
                                        {auth.user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {auth.user.name.split(" ")[0]}
                                    </span>
                                    <ChevronDown size={16} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 rounded-xl overflow-hidden shadow-lg bg-white ring-1 ring-black/5 transform origin-top-right transition-all duration-200">
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <ProfileMenuItem
                                                href="/profile"
                                                label="Profile"
                                                icon={<User size={16} />}
                                            />
                                            <ProfileMenuItem
                                                href="/settings"
                                                label="Settings"
                                                icon={<Settings size={16} />}
                                            />
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md group transition-colors"
                                            >
                                                <LogOut
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                <span>Logout</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isScrolled
                                            ? "text-[#00529C] border border-[#00529C] hover:bg-blue-50"
                                            : "text-white border border-white/30 hover:bg-white/10"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-[#F37021] to-[#ff8c47] text-white rounded-md hover:from-[#e05f10] hover:to-[#ff7c30] text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2 rounded-full transition-colors ${
                                isScrolled
                                    ? "text-gray-600 hover:bg-gray-100"
                                    : "text-white/90 hover:bg-white/10"
                            }`}
                        >
                            <Search size={20} />
                        </button>

                        <button
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                                isScrolled
                                    ? "text-[#00529C] hover:bg-blue-50"
                                    : "text-white hover:bg-white/10"
                            }`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div
                    className={`md:hidden border-t ${
                        isScrolled
                            ? "bg-white border-gray-200"
                            : "bg-[#00529C] border-[#00407c]"
                    }`}
                >
                    <div className="pt-2 pb-4 space-y-1 px-2">
                        <MobileNavLink
                            href="/"
                            label="Home"
                            isScrolled={isScrolled}
                        />
                        <MobileNavLink
                            href="/about"
                            label="About"
                            isScrolled={isScrolled}
                        />
                        <MobileNavLink
                            href="/contact"
                            label="Contact"
                            isScrolled={isScrolled}
                        />

                        {/* Auth links for mobile */}
                        {auth.user ? (
                            <>
                                <MobileNavLink
                                    href="/dashboard"
                                    label="Dashboard"
                                    isScrolled={isScrolled}
                                />
                                <MobileNavLink
                                    href="/profile"
                                    label="Profile"
                                    isScrolled={isScrolled}
                                />
                                <MobileNavLink
                                    href="/settings"
                                    label="Settings"
                                    isScrolled={isScrolled}
                                />
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg ${
                                        isScrolled
                                            ? "text-red-600 hover:bg-red-50"
                                            : "text-red-400 hover:bg-[#00407c]"
                                    }`}
                                >
                                    <LogOut size={16} className="mr-2" />
                                    <span>Logout</span>
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-2 px-2 pt-2">
                                <Link
                                    href="/login"
                                    className={`w-full text-center px-4 py-2 text-sm font-medium rounded-lg ${
                                        isScrolled
                                            ? "text-[#00529C] border border-[#00529C]"
                                            : "text-white border border-white/30 hover:bg-white/10"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="w-full text-center px-4 py-2 bg-gradient-to-r from-[#F37021] to-[#ff8c47] text-white rounded-lg hover:from-[#e05f10] hover:to-[#ff7c30] text-sm font-medium shadow-md"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Search (conditionally rendered) */}
            {isSearchOpen && (
                <div className="md:hidden bg-white shadow-lg p-4 border-t border-gray-200 transition-all duration-300 ease-in-out">
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00529C]"
                        />
                        <Search
                            className="absolute left-3 top-3.5 text-gray-400"
                            size={18}
                        />
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
