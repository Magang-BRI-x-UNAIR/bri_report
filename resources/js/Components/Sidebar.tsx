// File: resources/js/Components/Sidebar.tsx

"use client";

import { Link, usePage } from "@inertiajs/react";
import {
    X,
    FolderTree,
    Tags,
    Users,
    Home,
    Building2,
    Briefcase,
    CreditCard,
    BookOpen,
    UserCircle, // Tambahkan ikon untuk Profil
} from "lucide-react";
import { useState, useEffect } from "react";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

interface SidebarProps {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ sidebarOpen, toggleSidebar }: SidebarProps) => {
    const { url } = usePage();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-[#00529C] to-[#003b70] shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 items-center justify-between border-b border-[#0063bc]/30 px-4">
                    <Link
                        href={route("dashboard.index")}
                        className="flex items-center"
                    >
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F37021]/80 shadow-md shadow-[#00529C]/30">
                            <img
                                className="h-8 w-auto"
                                src="/images/logo.png"
                                alt="BRI Logo"
                            />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-white">
                            BRI Report
                        </span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="rounded-md p-1 text-blue-200 hover:bg-[#00529C]/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F37021] lg:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Sidebar content */}
                <div className="custom-scrollbar flex h-[calc(100%-4rem)] flex-col overflow-y-auto py-4">
                    <nav className="flex-grow space-y-1 px-3">
                        <SidebarItem
                            href="dashboard.index"
                            icon={Home}
                            text="Dashboard"
                            isActive={route().current("dashboard.index")}
                        />

                        <SidebarSection title="Akun Saya">
                            <SidebarItem
                                href="profile.index"
                                icon={UserCircle}
                                text="Profil Saya"
                                isActive={route().current("profile.edit")}
                            />
                        </SidebarSection>

                        <SidebarSection title="Organization">
                            <SidebarItem
                                href="branches.index"
                                icon={Building2}
                                text="Cabang"
                                isActive={route().current("branches.*")}
                            />
                            <SidebarItem
                                href="universalBankers.index"
                                icon={Users}
                                text="Universal Banker"
                                isActive={route().current("universalBankers.*")}
                            />
                            <SidebarItem
                                href="account-products.index"
                                icon={BookOpen}
                                text="Produk Rekening"
                                isActive={route().current("account-products.*")}
                            />
                        </SidebarSection>

                        <SidebarSection title="Reports">
                            <SidebarItem
                                href="clients.index"
                                icon={Users}
                                text="Nasabah"
                                isActive={
                                    route().current("clients.index") ||
                                    route().current("clients.*")
                                }
                            />
                            <SidebarItem
                                href="accounts.index"
                                icon={CreditCard}
                                text="Rekening"
                                isActive={
                                    route().current("accounts.index") ||
                                    route().current("accounts.*")
                                }
                            />
                        </SidebarSection>
                    </nav>

                    {/* Footer Section */}
                    <div className="mt-auto border-t border-[#0063bc]/30 p-4 space-y-3">
                        {/* Logout button */}
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 bg-[#F37021] hover:bg-[#F37021]/80 text-white py-2 px-3 rounded-lg transition-colors duration-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-log-out"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span className="font-medium text-sm">Logout</span>
                        </Link>

                        {/* System status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-[#F37021] shadow-md shadow-[#F37021]/40"></div>
                                <span className="text-sm text-blue-100">
                                    All systems online
                                </span>
                            </div>
                            <span className="text-xs text-blue-300">
                                v1.2.0
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
