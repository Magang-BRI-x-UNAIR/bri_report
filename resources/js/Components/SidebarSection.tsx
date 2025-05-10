"use client";

import type React from "react";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mb-3 mt-4">
            <button
                onClick={toggleExpand}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-blue-100 hover:bg-[#0063bc]/30"
            >
                <span className="uppercase tracking-wider text-xs font-semibold">
                    {title}
                </span>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[#F37021]" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-[#F37021]" />
                )}
            </button>
            <div
                className={`mt-1 space-y-1 transition-all duration-200 ease-in-out ${
                    isExpanded
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default SidebarSection;
