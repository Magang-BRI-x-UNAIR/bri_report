import { UniversalBanker } from "@/types";
import { X, Trash2, User, MapPin } from "lucide-react";
import { router } from "@inertiajs/react";

interface DeleteUniversalBankerModalProps {
    isOpen: boolean;
    closeModal: () => void;
    universalBanker: UniversalBanker | null;
}

const DeleteUniversalBankerModal = ({
    isOpen,
    closeModal,
    universalBanker,
}: DeleteUniversalBankerModalProps) => {
    if (!isOpen || !universalBanker) return null;

    const handleDelete = () => {
        router.delete(route("universalBankers.destroy", universalBanker.id), {
            onSuccess: () => {
                closeModal();
            },
        });
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
                    <div className="bg-red-600 px-4 py-3 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-white">
                            Konfirmasi Penghapusan
                        </h3>
                        <button
                            type="button"
                            className="bg-red-600 rounded-md text-white hover:bg-red-700 focus:outline-none"
                            onClick={closeModal}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3
                                    className="text-lg leading-6 font-medium text-gray-900"
                                    id="modal-title"
                                >
                                    Hapus Universal Banker
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Apakah Anda yakin ingin menghapus
                                        Universal Banker{" "}
                                        <span className="font-medium text-gray-900">
                                            "{universalBanker.name}"
                                        </span>
                                        ? Tindakan ini tidak dapat dibatalkan
                                        dan semua data terkait Universal Banker
                                        ini akan dihapus secara permanen.
                                    </p>
                                </div>
                                <div className="mt-3 border-t border-gray-200 pt-3">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>
                                            NIP:{" "}
                                            {universalBanker.nip
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </div>
                                    <div className="flex items-start mt-1.5 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                        <span>
                                            {universalBanker.branch?.name ||
                                                "Tidak terdaftar di cabang manapun"}
                                        </span>
                                    </div>
                                    {universalBanker.email && (
                                        <div className="flex items-start mt-1.5 text-sm text-gray-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-4 w-4 text-gray-400 mr-2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                                />
                                            </svg>
                                            <span>{universalBanker.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleDelete}
                        >
                            Hapus Universal Banker
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={closeModal}
                        >
                            Batalkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteUniversalBankerModal;
