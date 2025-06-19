import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, User } from "@/types";
import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Shield,
    Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { formatDate } from "@/lib/utils";

interface ProfileIndexPageProps extends PageProps {
    user: User;
}

export default function Profile() {
    const { user } = usePage<ProfileIndexPageProps>().props;

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            {/* Profile Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#00529C] to-[#003b75] p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between">
                    <div className="mb-6 md:mb-0 flex flex-col md:flex-row items-center md:items-start gap-5">
                        <div className="h-24 w-24 overflow-hidden rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-xl">
                            <UserIcon className="h-12 w-12 text-[#00529C]" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {user.name}
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-blue-100 text-lg">
                                {user.email}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                    {user.email_verified_at
                                        ? "Verified Account"
                                        : "Unverified Account"}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-blue-800/30 px-2.5 py-1 text-xs font-medium text-white">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-blue-200"></span>
                                    Member since{" "}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route("profile.edit")}>
                            <Button className="shadow-md bg-white text-[#00529C] hover:bg-blue-50 gap-1.5 font-medium transition-all duration-200">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - User Info Card */}
                <Card className="md:col-span-1 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Your personal details and contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <UserIcon className="h-5 w-5 mt-0.5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Full Name
                                    </p>
                                    <p className="text-base font-medium">
                                        {user.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Mail className="h-5 w-5 mt-0.5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Email Address
                                    </p>
                                    <p className="text-base font-medium">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Phone className="h-5 w-5 mt-0.5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Phone Number
                                    </p>
                                    <p className="text-base font-medium">
                                        {user.phone || "Not provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 mt-0.5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Address
                                    </p>
                                    <p className="text-base font-medium">
                                        {user.address || "Not provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 mt-0.5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Account Created
                                    </p>
                                    <p className="text-base font-medium">
                                        {formatDate(user.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Tabbed Content */}
                <div className="md:col-span-2">
                    <Card className="border border-gray-100 shadow-md">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Overview of your account details and settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div className="grid gap-2">
                                    <div className="font-medium flex items-center justify-between">
                                        <span>Account Status</span>
                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                <Shield className="h-3.5 w-3.5 mr-1" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                <Shield className="h-3.5 w-3.5 mr-1" />
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {user.email_verified_at
                                            ? `Your account was verified on ${formatDate(
                                                  user.email_verified_at
                                              )}`
                                            : "Your email address has not been verified yet. Please check your inbox for a verification link."}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-base font-medium leading-6">
                                        Account Details
                                    </h3>
                                    <dl className="divide-y divide-gray-100">
                                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm font-medium text-gray-500">
                                                User ID
                                            </dt>
                                            <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                                                {user.id}
                                            </dd>
                                        </div>
                                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm font-medium text-gray-500">
                                                Last Updated
                                            </dt>
                                            <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                                                {formatDate(user.updated_at)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
