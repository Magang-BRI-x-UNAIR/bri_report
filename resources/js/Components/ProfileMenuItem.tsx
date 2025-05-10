import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

interface ProfileMenuItemProps {
    href: string;
    label: string;
    icon: ReactNode;
}

const ProfileMenuItem = ({ href, label, icon }: ProfileMenuItemProps) => {
    return (
        <Link
            href={href}
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group transition-colors"
        >
            <span className="text-gray-500 group-hover:text-[#00529C] mr-2">
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
};

export default ProfileMenuItem;
