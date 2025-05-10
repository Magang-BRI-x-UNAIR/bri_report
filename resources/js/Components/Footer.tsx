import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-[#003b75] to-[#00529C] text-white w-full py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Logo and Description */}
                    <div className="flex flex-col space-y-5">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/10 p-2.5 rounded-xl">
                                <img
                                    src="/logo.svg"
                                    alt="BRI Logo"
                                    className="h-9 w-auto"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                BRI Report
                            </span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">
                            Platform laporan terintegrasi untuk meningkatkan
                            kinerja dan layanan BRI dengan teknologi terkini
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a
                                href="#"
                                className="text-white hover:text-[#F37021] transition-colors duration-200"
                            >
                                <Facebook size={20} />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-[#F37021] transition-colors duration-200"
                            >
                                <Twitter size={20} />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-[#F37021] transition-colors duration-200"
                            >
                                <Instagram size={20} />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-[#F37021] transition-colors duration-200"
                            >
                                <Linkedin size={20} />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="text-[#F37021] font-semibold text-lg mb-2">
                            Quick Links
                        </h3>
                        <a
                            href="/"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Home
                        </a>
                        <a
                            href="/about"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            About
                        </a>
                        <a
                            href="/contact"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Contact
                        </a>
                        <a
                            href="/dashboard"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Dashboard
                        </a>
                    </div>

                    {/* Services */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="text-[#F37021] font-semibold text-lg mb-2">
                            Our Services
                        </h3>
                        <a
                            href="#"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Financial Reports
                        </a>
                        <a
                            href="#"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Performance Analytics
                        </a>
                        <a
                            href="#"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Business Intelligence
                        </a>
                        <a
                            href="#"
                            className="text-gray-200 hover:text-[#F37021] transition-colors duration-200 flex items-center"
                        >
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                            Data Visualization
                        </a>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="text-[#F37021] font-semibold text-lg mb-2">
                            Contact Us
                        </h3>
                        <p className="text-sm text-gray-200 flex items-start">
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2 mt-1.5"></span>
                            <span>
                                Jl. Jenderal Sudirman Kav. 44-46, Jakarta 10210
                            </span>
                        </p>
                        <p className="text-sm text-gray-200 flex items-start">
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2 mt-1.5"></span>
                            <span>Email: contact@bri.co.id</span>
                        </p>
                        <p className="text-sm text-gray-200 flex items-start">
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2 mt-1.5"></span>
                            <span>Phone: (021) 2500 900</span>
                        </p>
                        <p className="text-sm text-gray-200 flex items-start">
                            <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2 mt-1.5"></span>
                            <span>Fax: (021) 2500 901</span>
                        </p>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-[#00407c] mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm">
                            © {new Date().getFullYear()} PT Bank Rakyat
                            Indonesia (Persero) Tbk. All rights reserved.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="#"
                            className="text-gray-300 hover:text-[#F37021] transition-colors duration-200 text-sm"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-gray-300 hover:text-[#F37021] transition-colors duration-200 text-sm"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-gray-300 hover:text-[#F37021] transition-colors duration-200 text-sm"
                        >
                            Help Center
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
