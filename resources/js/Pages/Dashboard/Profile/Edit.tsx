import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { PageProps, User } from "@/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Separator } from "@/Components/ui/separator";
import {
    AlertTriangle,
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    RefreshCcw,
    Mail,
    Phone,
    MapPin,
    User as UserIcon,
    Lock,
    Info,
} from "lucide-react";

interface ProfileEditPageProps extends PageProps {
    user: User;
}

export default function EditProfilePage() {
    const { user } = usePage<ProfileEditPageProps>().props;

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        is_change_password: false as boolean,
        password: "" as string | undefined,
        password_confirmation: "" as string | undefined,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.is_change_password) {
            delete data.password;
            delete data.password_confirmation;
        }

        put(route("profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage("Profil berhasil diperbarui!");
                setTimeout(() => setSuccessMessage(""), 4000);

                // Reset password fields jika berhasil
                if (data.is_change_password) {
                    setData("password", "");
                    setData("password_confirmation", "");
                    setData("is_change_password", false);
                }
            },
        });
    };

    const generateStrongPassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setData("password", retVal);
        setData("password_confirmation", retVal);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handlePasswordToggle = (checked: boolean) => {
        setData("is_change_password", checked);
        if (!checked) {
            setData("password", "");
            setData("password_confirmation", "");
            reset("password", "password_confirmation");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Profil Saya | Bank BRI" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Breadcrumb
                            items={[
                                {
                                    label: "Profil Saya",
                                    href: route("profile.index"),
                                },
                                { label: "Edit Profil" },
                            ]}
                        />
                    </div>

                    {/* Header Profile Card */}
                    <div className="max-w-7xl mx-auto mb-8">
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center space-x-6">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold mb-2">
                                            {user.name}
                                        </h1>
                                        <p className="text-blue-100 mb-2 flex items-center text-lg">
                                            <Mail className="h-5 w-5 mr-2" />
                                            {user.email}
                                        </p>
                                        <p className="text-blue-200 text-sm">
                                            Member sejak{" "}
                                            {new Date(
                                                user.created_at
                                            ).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="max-w-4xl mx-auto mb-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <p className="text-emerald-800 font-medium">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Form */}
                    <div className="max-w-7xl mx-auto">
                        <Card className="shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-t-2xl">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                                        <UserIcon className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-slate-900">
                                            Edit Profil
                                        </CardTitle>
                                        <CardDescription className="text-slate-600 mt-2 text-base">
                                            Perbarui informasi pribadi dan
                                            keamanan akun Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <form onSubmit={handleSubmit}>
                                <CardContent className="p-8 space-y-8">
                                    {/* Informasi Personal */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <Info className="h-5 w-5 mr-2 text-blue-600" />
                                            Informasi Personal
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-medium text-slate-700 flex items-center"
                                                >
                                                    <UserIcon className="h-4 w-4 mr-2 text-slate-500" />
                                                    Nama Lengkap
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    className="h-12 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Masukkan nama lengkap"
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-medium text-slate-700 flex items-center"
                                                >
                                                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                                                    Email
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="h-12 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    autoComplete="email"
                                                    placeholder="Masukkan alamat email"
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="phone"
                                                    className="text-sm font-medium text-slate-700 flex items-center"
                                                >
                                                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                                                    Nomor Telepon
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    className="h-12 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
                                                    value={data.phone || ""}
                                                    onChange={(e) =>
                                                        setData(
                                                            "phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    autoComplete="tel"
                                                    placeholder="Contoh: 08123456789"
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3 md:col-span-1">
                                                <Label
                                                    htmlFor="address"
                                                    className="text-sm font-medium text-slate-700 flex items-center"
                                                >
                                                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                                                    Alamat
                                                </Label>
                                                <Textarea
                                                    id="address"
                                                    className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base min-h-[3rem]"
                                                    value={data.address || ""}
                                                    onChange={(e) =>
                                                        setData(
                                                            "address",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    placeholder="Masukkan alamat lengkap"
                                                />
                                                {errors.address && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Password Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                                <Lock className="h-5 w-5 mr-2 text-blue-600" />
                                                Keamanan Password
                                            </h3>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                            <div className="flex items-start space-x-3">
                                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                                <div>
                                                    <p className="text-amber-800 font-medium text-sm">
                                                        Perubahan Password
                                                        Opsional
                                                    </p>
                                                    <p className="text-amber-700 text-sm mt-1">
                                                        Centang opsi di bawah
                                                        hanya jika Anda ingin
                                                        mengubah password.
                                                        Kosongkan jika tidak
                                                        ingin mengubah password.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="change-password"
                                                    checked={
                                                        data.is_change_password
                                                    }
                                                    onCheckedChange={
                                                        handlePasswordToggle
                                                    }
                                                />
                                                <Label
                                                    htmlFor="change-password"
                                                    className="text-sm font-medium text-slate-700 cursor-pointer"
                                                >
                                                    Saya ingin mengubah password
                                                </Label>
                                            </div>

                                            {data.is_change_password && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                                                    <div className="space-y-3">
                                                        <Label
                                                            htmlFor="password"
                                                            className="text-sm font-medium text-slate-700"
                                                        >
                                                            Password Baru
                                                            <span className="text-red-500 ml-1">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="password"
                                                                value={
                                                                    data.password
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "password",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                type={
                                                                    showNewPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                className="h-12 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 pr-12 text-base"
                                                                autoComplete="new-password"
                                                                placeholder="Masukkan password baru"
                                                                required={
                                                                    data.is_change_password
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100"
                                                                onClick={() =>
                                                                    setShowNewPassword(
                                                                        !showNewPassword
                                                                    )
                                                                }
                                                            >
                                                                {showNewPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        {errors.password && (
                                                            <p className="text-sm text-red-600 flex items-center">
                                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                                {
                                                                    errors.password
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label
                                                            htmlFor="password_confirmation"
                                                            className="text-sm font-medium text-slate-700"
                                                        >
                                                            Konfirmasi Password
                                                            Baru
                                                            <span className="text-red-500 ml-1">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="password_confirmation"
                                                                value={
                                                                    data.password_confirmation
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "password_confirmation",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                type={
                                                                    showConfirmPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                className="h-12 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 pr-12 text-base"
                                                                autoComplete="new-password"
                                                                placeholder="Konfirmasi password baru"
                                                                required={
                                                                    data.is_change_password
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100"
                                                                onClick={() =>
                                                                    setShowConfirmPassword(
                                                                        !showConfirmPassword
                                                                    )
                                                                }
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        {errors.password_confirmation && (
                                                            <p className="text-sm text-red-600 flex items-center">
                                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                                {
                                                                    errors.password_confirmation
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={
                                                                generateStrongPassword
                                                            }
                                                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                                        >
                                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                                            Generate Password
                                                            Kuat
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-slate-50/50 rounded-b-2xl p-8 flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-8 h-12 rounded-xl"
                                        onClick={() => window.history.back()}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="px-8 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <Save className="h-5 w-5 mr-2" />
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
