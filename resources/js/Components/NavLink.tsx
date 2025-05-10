import { Link } from "@inertiajs/react";

interface NavLinkProps {
    href: string;
    label: string;
    isScrolled: boolean;
}

const NavLink = ({ href, label, isScrolled }: NavLinkProps) => {
    return (
        <Link
            href={href}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isScrolled
                    ? "text-gray-700 hover:text-[#00529C] hover:bg-blue-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
        >
            {label}
        </Link>
    );
};

export default NavLink;
