import { Link } from "@inertiajs/react";
import type { LucideIcon } from "lucide-react";
import type React from "react";

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    text: string;
    isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    href,
    icon: Icon,
    text,
    isActive,
}) => {
    return (
        <Link
            href={route(href)}
            className={`flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                    ? "bg-gradient-to-r from-[#F37021]/90 to-[#F37021]/70 text-white shadow-md"
                    : "text-blue-100 hover:bg-[#0063bc]/40 hover:text-white"
            }`}
        >
            <Icon
                className={`mr-3 h-5 w-5 ${
                    isActive ? "text-white" : "text-blue-200"
                }`}
            />
            {text}
            {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white"></div>
            )}
        </Link>
    );
};

export default SidebarItem;
