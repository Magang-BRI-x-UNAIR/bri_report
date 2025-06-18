"use client";

import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { type FormEventHandler, useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    LogIn,
    Mail,
    AlertCircle,
    Lock,
    CheckCircle,
} from "lucide-react";

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formFilled, setFormFilled] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        setFormFilled(data.email.trim() !== "" && data.password.trim() !== "");
    }, [data.email, data.password]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />
            <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#00529C]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#F37021]/5 rounded-full blur-3xl"></div>
                </div>

                <div
                    className={`relative w-full max-w-md transition-all duration-700 transform ${
                        isLoading
                            ? "opacity-0 translate-y-4"
                            : "opacity-100 translate-y-0"
                    }`}
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Top accent bar */}
                        <div className="h-2 bg-gradient-to-r from-[#00529C] to-[#F37021]"></div>

                        <div className="px-6 py-12 sm:px-12">
                            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                                <div className="flex justify-center">
                                    <div className="bg-[#F37021]/10 p-3 rounded-xl">
                                        <img
                                            className="h-16 w-auto"
                                            src="/images/logo.png"
                                            alt="BRI Logo"
                                        />
                                    </div>
                                </div>
                                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                    Masuk ke Akun Anda
                                </h2>
                                <p className="mt-2 text-center text-sm text-gray-600">
                                    Akses platform laporan terintegrasi BRI
                                </p>
                            </div>

                            <div className="mt-8">
                                <form className="space-y-6" onSubmit={submit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Email
                                            </label>
                                            <div className="mt-1 relative rounded-md">
                                                <div
                                                    className={`flex items-center border ${
                                                        errors.email
                                                            ? "border-red-500 bg-red-50"
                                                            : data.email
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-300 bg-white"
                                                    } rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#00529C] focus-within:border-[#00529C] transition-all`}
                                                >
                                                    <div className="pl-4 flex items-center justify-center">
                                                        <Mail
                                                            className={`h-5 w-5 ${
                                                                errors.email
                                                                    ? "text-red-500"
                                                                    : data.email
                                                                    ? "text-green-500"
                                                                    : "text-gray-400"
                                                            }`}
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                    <input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        autoComplete="email"
                                                        required
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                "email",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`block w-full pl-3 pr-3 py-3 border-0 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm`}
                                                        placeholder="Email Anda"
                                                    />
                                                    {data.email &&
                                                        !errors.email && (
                                                            <div className="pr-3">
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            {errors.email && (
                                                <div className="mt-2 flex items-center text-sm text-red-500">
                                                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                                                    <span>{errors.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="password"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Password
                                                </label>
                                            </div>
                                            <div className="mt-1 relative rounded-md">
                                                <div
                                                    className={`flex items-center border ${
                                                        errors.password
                                                            ? "border-red-500 bg-red-50"
                                                            : data.password
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-300 bg-white"
                                                    } rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#00529C] focus-within:border-[#00529C] transition-all`}
                                                >
                                                    <div className="pl-4 flex items-center justify-center">
                                                        <Lock
                                                            className={`h-5 w-5 ${
                                                                errors.password
                                                                    ? "text-red-500"
                                                                    : data.password
                                                                    ? "text-green-500"
                                                                    : "text-gray-400"
                                                            }`}
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        autoComplete="current-password"
                                                        required
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                "password",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`block w-full pl-3 pr-3 py-3 border-0 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm`}
                                                        placeholder="Password Anda"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="pr-4 flex items-center justify-center"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff
                                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                                aria-hidden="true"
                                                            />
                                                        ) : (
                                                            <Eye
                                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            {errors.password && (
                                                <div className="mt-2 flex items-center text-sm text-red-500">
                                                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                                                    <span>
                                                        {errors.password}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                                                formFilled
                                                    ? "bg-gradient-to-r from-[#00529C] to-[#0063b8] hover:from-[#003b75] hover:to-[#00529C]"
                                                    : "bg-gray-400"
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C]`}
                                        >
                                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                                <LogIn
                                                    className={`h-5 w-5 ${
                                                        formFilled
                                                            ? "text-blue-300 group-hover:text-blue-200"
                                                            : "text-gray-300"
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            {processing ? (
                                                <div className="flex items-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Memproses...
                                                </div>
                                            ) : (
                                                "Masuk"
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">
                                                Atau
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Link
                                            href={route("register")}
                                            className="w-full flex justify-center items-center px-4 py-3 border border-[#F37021] rounded-lg shadow-sm text-sm font-medium text-[#F37021] bg-white hover:bg-[#F37021]/5 transition-colors"
                                        >
                                            Daftar Akun Baru
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security notice */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            Koneksi aman dengan enkripsi SSL
                        </div>
                    </div>

                    {/* Help text */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Butuh bantuan?{" "}
                            <a
                                href="#"
                                className="text-[#00529C] hover:text-[#003b75]"
                            >
                                Hubungi dukungan
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};
export default Login;
