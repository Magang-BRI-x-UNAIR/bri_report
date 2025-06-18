import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { type FormEventHandler, useEffect, useState, useMemo } from "react"; // Tambahkan useMemo
import {
    Eye,
    EyeOff,
    UserPlus,
    Mail,
    AlertCircle,
    Lock,
    CheckCircle,
    User,
    Info, // Untuk ikon di password strength
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/Components/ui/card";

const Register = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formFilled, setFormFilled] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300); // Sedikit dipercepat
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setFormFilled(
            data.name.trim() !== "" &&
                data.email.trim() !== "" &&
                data.password.trim() !== "" &&
                data.password_confirmation.trim() !== "" &&
                data.password === data.password_confirmation // Tambahkan pengecekan password match
        );
    }, [data.name, data.email, data.password, data.password_confirmation]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    // Fungsi untuk menghitung kekuatan password
    const getPasswordStrength = () => {
        if (!data.password) return 0;
        let strength = 0;
        if (data.password.length >= 8) strength += 25;
        else if (data.password.length >= 6) strength += 10;
        if (/[A-Z]/.test(data.password)) strength += 25;
        if (/[a-z]/.test(data.password)) strength += 15; // Tambahan untuk huruf kecil
        if (/\d/.test(data.password)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) strength += 25;
        return Math.min(strength, 100); // Pastikan tidak melebihi 100
    };

    const passwordStrengthValue = useMemo(
        () => getPasswordStrength(),
        [data.password]
    );

    const getStrengthColorAndText = () => {
        const strength = passwordStrengthValue;
        if (strength <= 25)
            return {
                color: "bg-red-500",
                text: "Sangat Lemah",
                textColor: "text-red-600",
            };
        if (strength <= 50)
            return {
                color: "bg-orange-500",
                text: "Lemah",
                textColor: "text-orange-600",
            };
        if (strength <= 75)
            return {
                color: "bg-yellow-500",
                text: "Sedang",
                textColor: "text-yellow-600",
            };
        return {
            color: "bg-green-500",
            text: "Kuat",
            textColor: "text-green-600",
        };
    };

    const {
        color: strengthBarColor,
        text: strengthText,
        textColor: strengthTextColor,
    } = getStrengthColorAndText();

    // Kriteria Password
    const passwordCriteria = [
        { label: "Minimal 8 karakter", met: data.password.length >= 8 },
        { label: "Huruf kapital (A-Z)", met: /[A-Z]/.test(data.password) },
        { label: "Huruf kecil (a-z)", met: /[a-z]/.test(data.password) },
        { label: "Angka (0-9)", met: /\d/.test(data.password) },
        {
            label: "Simbol (!@#$...)",
            met: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
        },
    ];

    return (
        <GuestLayout title="Daftar Akun Baru">
            <Head title="Daftar Akun Baru" />

            <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="absolute inset-0 overflow-hidden opacity-50">
                    <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-[#00529C]/20 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-[#F37021]/20 rounded-full blur-3xl animate-pulse-slower delay-2000"></div>
                </div>

                <div
                    className={`relative w-full max-w-lg transition-all duration-500 ease-out ${
                        isLoading
                            ? "opacity-0 translate-y-5"
                            : "opacity-100 translate-y-0"
                    }`}
                >
                    <Card className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                        <div className="h-2.5 bg-gradient-to-r from-[#F37021] via-[#00529C] to-[#003b70]"></div>

                        <CardHeader className="px-6 py-8 sm:px-10">
                            <div className="flex justify-center mb-6">
                                <Link
                                    href="/"
                                    className="inline-block bg-gray-100 p-3 rounded-lg shadow-sm"
                                >
                                    <img
                                        className="h-12 w-auto" // Ukuran logo disesuaikan
                                        src="/images/logo.png" // Pastikan path logo benar
                                        alt="BRI Logo"
                                    />
                                </Link>
                            </div>
                            <CardTitle className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
                                Buat Akun BRI Report Anda
                            </CardTitle>
                            <CardDescription className="mt-2 text-center text-sm text-gray-500">
                                Sudah punya akun?{" "}
                                <Link
                                    href={route("login")}
                                    className="font-medium text-[#00529C] hover:text-[#F37021] transition-colors"
                                >
                                    Masuk di sini
                                </Link>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-8 sm:px-10">
                            <form className="space-y-5" onSubmit={submit}>
                                <div>
                                    <Label htmlFor="name">
                                        Nama Lengkap{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="mt-1 relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            className={`pl-10 ${
                                                errors.name
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50"
                                                    : "focus:border-[#00529C] focus:ring-[#00529C]"
                                            }`}
                                            placeholder="Masukkan nama lengkap Anda"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">
                                        Alamat Email{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="mt-1 relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            className={`pl-10 ${
                                                errors.email
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50"
                                                    : "focus:border-[#00529C] focus:ring-[#00529C]"
                                            }`}
                                            placeholder="contoh@bri.co.id"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">
                                        Password{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="mt-1 relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            required
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 pr-10 ${
                                                errors.password
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50"
                                                    : "focus:border-[#00529C] focus:ring-[#00529C]"
                                            }`}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Sembunyikan password"
                                                    : "Tampilkan password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Indikator Kekuatan Password */}
                                {data.password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span
                                                className={`font-medium ${strengthTextColor}`}
                                            >
                                                Kekuatan: {strengthText}
                                            </span>
                                            <span className="text-gray-500">
                                                {passwordStrengthValue}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all duration-300 ${strengthBarColor}`}
                                                style={{
                                                    width: `${passwordStrengthValue}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                                            {passwordCriteria.map(
                                                (criterion, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center ${
                                                            criterion.met
                                                                ? "text-green-600"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {criterion.met ? (
                                                            <CheckCircle
                                                                size={12}
                                                                className="mr-1.5"
                                                            />
                                                        ) : (
                                                            <AlertCircle
                                                                size={12}
                                                                className="mr-1.5"
                                                            />
                                                        )}
                                                        {criterion.label}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="mt-1 relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            required
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 pr-10 ${
                                                errors.password_confirmation ||
                                                (data.password_confirmation &&
                                                    data.password !==
                                                        data.password_confirmation)
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50"
                                                    : "focus:border-[#00529C] focus:ring-[#00529C]"
                                            }`}
                                            placeholder="Ulangi password Anda"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Sembunyikan konfirmasi password"
                                                    : "Tampilkan konfirmasi password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                    {data.password_confirmation &&
                                        data.password !==
                                            data.password_confirmation &&
                                        !errors.password_confirmation && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                                <AlertCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                                Password tidak cocok.
                                            </p>
                                        )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing || !formFilled}
                                        className="w-full group relative flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#00529C] to-[#0063b8] hover:from-[#003b75] hover:to-[#00529C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <UserPlus className="h-5 w-5 mr-2 opacity-80 group-hover:opacity-100" />
                                        {processing
                                            ? "Mendaftarkan..."
                                            : "Daftar Akun Baru"}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div
                                        className="absolute inset-0 flex items-center"
                                        aria-hidden="true"
                                    >
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">
                                            Sudah punya akun?
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href={route("login")}
                                        className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Masuk ke Akun Anda
                                    </Link>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center w-full">
                                Dengan mendaftar, Anda menyetujui{" "}
                                <a
                                    href="#"
                                    className="font-medium text-[#00529C] hover:text-[#F37021]"
                                >
                                    Syarat Layanan
                                </a>{" "}
                                dan{" "}
                                <a
                                    href="#"
                                    className="font-medium text-[#00529C] hover:text-[#F37021]"
                                >
                                    Kebijakan Privasi
                                </a>{" "}
                                kami.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
};

export default Register;
