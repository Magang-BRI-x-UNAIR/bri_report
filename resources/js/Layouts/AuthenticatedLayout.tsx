"use client";

import type React from "react";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import { Toaster } from "@/Components/ui/toaster";

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    fluid?: boolean;
}

const AuthenticatedLayout = ({
    children,
    fluid = false,
}: AuthenticatedLayoutProps) => {
    const { props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // On first load for desktop, start with open sidebar
            if (!mobile && !pageLoaded) {
                setSidebarOpen(true);
            }
        };

        // Detect initial screen size
        handleResize();
        setPageLoaded(true);

        // Add resize listener
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, [pageLoaded]);

    // Click outside handling for user dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target as Node)
            ) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll to top when changing pages
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
    }, [props.url]); // Reset scroll when URL changes

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar component */}
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content area with flexible layout */}
            <div
                className={`flex flex-1 flex-col min-h-0 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? "lg:ml-64" : ""
                }`}
                ref={userDropdownRef}
            >
                {/* Page content wrapper - this is the scrollable container */}
                <main
                    className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
                    ref={mainContentRef}
                >
                    {/* Main content area with appropriate padding and max-width */}
                    <div
                        className={`p-4 sm:p-6 lg:p-8 ${
                            fluid ? "w-full" : "max-w-7xl mx-auto"
                        }`}
                    >
                        <div className="animate-fadeIn">{children}</div>
                    </div>
                </main>
                <Toaster />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
