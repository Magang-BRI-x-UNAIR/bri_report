import { Link } from "@inertiajs/react";

interface MobileNavLinkProps {
    href: string;
    label: string;
    isScrolled: boolean;
}

const MobileNavLink = ({ href, label, isScrolled }: MobileNavLinkProps) => {
    return (
        <Link
            href={href}
            className={`block px-4 py-3 text-sm font-medium rounded-lg ${
                isScrolled
                    ? "text-gray-700 hover:bg-gray-100 hover:text-[#00529C]"
                    : "text-white hover:bg-[#00407c]"
            }`}
        >
            {label}
        </Link>
    );
};

export default MobileNavLink;
