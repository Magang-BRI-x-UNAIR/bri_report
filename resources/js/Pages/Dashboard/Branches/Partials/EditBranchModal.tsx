import { Branch } from "@/types";
import { X, Save } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";

interface EditBranchModalProps {
    isOpen: boolean;
    closeModal: () => void;
    branch: Branch;
}

const EditBranchModal = ({
    isOpen,
    closeModal,
    branch,
}: EditBranchModalProps) => {
    const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({
        ...branch,
    });
    const [errors, setErrors] = useState<{ name?: string; address?: string }>(
        {}
    );

    // Update state when branch prop changes
    useEffect(() => {
        if (branch) {
            setCurrentBranch({ ...branch });
        }
    }, [branch]);

    if (!isOpen) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setCurrentBranch((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { name?: string; address?: string } = {};

        if (!currentBranch.name?.trim()) {
            newErrors.name = "Nama cabang harus diisi";
        }

        if (!currentBranch.address?.trim()) {
            newErrors.address = "Alamat cabang harus diisi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        router.put(
            route("branches.update", currentBranch.id),
            currentBranch as any,
            {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    setErrors(errors);
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={closeModal}
                ></div>

                {/* Modal panel */}
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>
                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-[#00529C] px-4 py-3 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-white">
                            Edit Cabang
                        </h3>
                        <button
                            type="button"
                            className="bg-[#00529C] rounded-md text-white hover:bg-[#003b75] focus:outline-none"
                            onClick={closeModal}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nama Cabang
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={currentBranch.name || ""}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                            errors.name ? "border-red-300" : ""
                                        }`}
                                        placeholder="Masukkan nama cabang"
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Alamat
                                    </label>
                                    <textarea
                                        name="address"
                                        id="address"
                                        rows={3}
                                        value={currentBranch.address || ""}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00529C] focus:ring-[#00529C] sm:text-sm ${
                                            errors.address
                                                ? "border-red-300"
                                                : ""
                                        }`}
                                        placeholder="Masukkan alamat lengkap cabang"
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00529C] text-base font-medium text-white hover:bg-[#003b75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Update Cabang
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={closeModal}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBranchModal;
