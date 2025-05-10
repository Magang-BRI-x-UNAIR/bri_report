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
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (route().current("dashboard") || route().current("groups.*")) {
            setActiveSection("environments");
        } else if (
            route().current("clients.*") ||
            route().current("applications.*") ||
            route().current("groups.*")
        ) {
            setActiveSection("access");
        } else {
            setActiveSection(null);
        }
    }, [url, route]);

    // Toggle section expansion
    const toggleSection = (section: string) => {
        if (activeSection === section) {
            setActiveSection(null);
        } else {
            setActiveSection(section);
        }
    };

    return (
        <>
            {/* Mobile sidebar backdrop with fade effect */}
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
                        href={route("dashboard")}
                        className="flex items-center"
                    >
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F37021]/80 shadow-md shadow-[#00529C]/30">
                            <img
                                className="h-8 w-auto"
                                src="/logo.png"
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

                {/* Sidebar content with custom scrollbar */}
                <div className="custom-scrollbar flex h-[calc(100%-4rem)] flex-col overflow-y-auto py-4">
                    <nav className="flex-grow space-y-1 px-3">
                        {/* Dashboard */}
                        <SidebarItem
                            href="dashboard"
                            icon={Home}
                            text="Dashboard"
                            isActive={route().current("dashboard")}
                        />

                        <SidebarSection title="Organization">
                            <SidebarItem
                                href="branches.index"
                                icon={Building2}
                                text="Cabang"
                                isActive={route().current("branches.*")}
                            />
                            <SidebarItem
                                href="positions.index"
                                icon={Briefcase}
                                text="Jabatan"
                                isActive={route().current("positions.*")}
                            />
                            <SidebarItem
                                href="tellers.index"
                                icon={Users}
                                text="Teller"
                                isActive={route().current("tellers.*")}
                            />
                            <SidebarItem
                                href="account-products.index"
                                icon={BookOpen}
                                text="Produk Rekening"
                                isActive={route().current("account-products.*")}
                            />
                        </SidebarSection>

                        {/* Add more menu items here */}
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

                            <SidebarItem
                                href="dashboard"
                                icon={FolderTree}
                                text="Monthly Summary"
                                isActive={false}
                            />
                            <SidebarItem
                                href="dashboard"
                                icon={Tags}
                                text="Annual Review"
                                isActive={false}
                            />
                        </SidebarSection>
                    </nav>

                    {/* Footer Section */}
                    <div className="mt-auto border-t border-[#0063bc]/30 p-4">
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
