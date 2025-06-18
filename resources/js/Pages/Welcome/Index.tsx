"use client";

import { useEffect, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import { Head } from "@inertiajs/react";

const WelcomePage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <GuestLayout>
            <Head title="Selamat Datang" />

            <div className="relative">
                <div
                    className="fixed hidden lg:block w-24 h-24 bg-gradient-to-br from-[#00529C]/10 to-[#00529C]/30 rounded-full blur-xl z-0"
                    style={{
                        top: `${Math.max(120, 120 + scrollY * 0.1)}px`,
                        left: `${Math.max(100, 100 + scrollY * 0.05)}px`,
                        opacity: Math.max(0.3, 1 - scrollY * 0.001),
                    }}
                />
                <div
                    className="fixed hidden lg:block w-32 h-32 bg-gradient-to-br from-[#F37021]/10 to-[#F37021]/20 rounded-full blur-xl z-0"
                    style={{
                        top: `${Math.max(400, 400 + scrollY * -0.2)}px`,
                        right: `${Math.max(150, 150 + scrollY * 0.1)}px`,
                        opacity: Math.max(0.3, 1 - scrollY * 0.001),
                    }}
                />
                <div
                    className="fixed hidden lg:block w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/20 rounded-full blur-xl z-0"
                    style={{
                        bottom: `${Math.max(200, 200 + scrollY * -0.15)}px`,
                        left: `${Math.max(200, 200 + scrollY * -0.05)}px`,
                        opacity: Math.max(0.3, 1 - scrollY * 0.001),
                    }}
                />

                {/* Main content */}
                <div className="relative z-10">
                    <Hero />
                    <Features />
                    <HowItWorks />
                </div>
            </div>
        </GuestLayout>
    );
};

export default WelcomePage;
