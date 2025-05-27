"use client";

import type { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, Search } from "lucide-react";
import NavLink from "./NavLink";
import MobileNavLink from "./MobileNavLink";

const Navbar = () => {
    const { auth } = usePage<PageProps>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                                className={`rounded-xl p-1.5 ${
                                    // Sedikit padding untuk logo
                                    isScrolled ? "bg-[#00529C]" : "bg-white/10"
                                }`}
                            >
                                <img
                                    src="/logo.png" // Pastikan path logo benar
                                    alt="BRI Logo"
                                    className="h-8 w-auto" // Ukuran disesuaikan
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
                                href="/about" // Ganti dengan rute yang sesuai jika ada
                                label="About"
                                isScrolled={isScrolled}
                            />
                            <NavLink
                                href="/contact" // Ganti dengan rute yang sesuai jika ada
                                label="Contact"
                                isScrolled={isScrolled}
                            />
                            {/* Tombol Dashboard hanya muncul jika user sudah login */}
                            {auth.user && (
                                <NavLink
                                    href={route("dashboard")}
                                    label="Dashboard"
                                    isScrolled={isScrolled}
                                />
                            )}
                        </div>
                    </div>

                    {/* Auth Links and Actions */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {auth.user ? (
                            // Jika pengguna terautentikasi, tampilkan tombol Logout
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md ${
                                    isScrolled
                                        ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                                        : "text-white bg-red-600/80 hover:bg-red-700/80"
                                }`}
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Link>
                        ) : (
                            // Jika pengguna belum login, tampilkan tombol Login dan Register
                            <>
                                <Link
                                    href={route("login")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isScrolled
                                            ? "text-[#00529C] border border-[#00529C] hover:bg-blue-50"
                                            : "text-white border border-white/30 hover:bg-white/10"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route("register")}
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
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                                isScrolled
                                    ? "text-[#00529C] hover:bg-blue-50"
                                    : "text-white hover:bg-white/10"
                            }`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
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
                    id="mobile-menu"
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
                            href="/about" // Sesuaikan rute
                            label="About"
                            isScrolled={isScrolled}
                        />
                        <MobileNavLink
                            href="/contact" // Sesuaikan rute
                            label="Contact"
                            isScrolled={isScrolled}
                        />

                        {/* Auth links for mobile */}
                        {auth.user ? (
                            <>
                                <MobileNavLink
                                    href={route("dashboard")}
                                    label="Dashboard"
                                    isScrolled={isScrolled}
                                />
                                {/* Tombol Profile dan Settings bisa tetap ada di mobile jika diinginkan */}
                                <MobileNavLink
                                    href={route("profile.edit")}
                                    label="Profile"
                                    isScrolled={isScrolled}
                                />
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg ${
                                        isScrolled
                                            ? "text-red-600 hover:bg-red-50"
                                            : "text-red-300 hover:bg-red-700/20 hover:text-red-200" // Warna disesuaikan untuk kontras
                                    }`}
                                >
                                    <LogOut size={16} className="mr-2" />
                                    <span>Logout</span>
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-2 px-2 pt-2">
                                <Link
                                    href={route("login")}
                                    className={`w-full text-center px-4 py-2 text-sm font-medium rounded-lg ${
                                        isScrolled
                                            ? "text-[#00529C] border border-[#00529C]"
                                            : "text-white border border-white/30 hover:bg-white/10"
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="w-full text-center px-4 py-2 bg-gradient-to-r from-[#F37021] to-[#ff8c47] text-white rounded-lg hover:from-[#e05f10] hover:to-[#ff7c30] text-sm font-medium shadow-md"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
