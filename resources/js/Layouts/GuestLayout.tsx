import { useEffect, type PropsWithChildren } from "react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

const GuestLayout = ({
    children,
    title,
}: PropsWithChildren<{ title: string }>) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | BRI Report`;
        }
    }, [title]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
};

export default GuestLayout;
