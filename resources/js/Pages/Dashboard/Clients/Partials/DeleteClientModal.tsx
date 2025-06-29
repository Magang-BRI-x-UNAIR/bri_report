import { Client } from "@/types";
import { X, Trash2, FileText, Mail, Phone } from "lucide-react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

interface DeleteClientModalProps {
    isOpen: boolean;
    closeModal: () => void;
    client: Client | null;
}

const DeleteClientModal = ({
    isOpen,
    closeModal,
    client,
}: DeleteClientModalProps) => {
    if (!isOpen || !client) return null;

    const handleDelete = () => {
        router.delete(route("clients.destroy", client.id), {
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
                                    Hapus Nasabah
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Apakah Anda yakin ingin menghapus
                                        nasabah{" "}
                                        <span className="font-medium text-gray-900">
                                            "{client.name}"
                                        </span>
                                        ? Tindakan ini tidak dapat dibatalkan
                                        dan semua data terkait nasabah ini akan
                                        dihapus secara permanen.
                                    </p>
                                </div>
                                <div className="mt-3 border-t border-gray-200 pt-3">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>CIF: {client.cif}</span>
                                    </div>

                                    {client.email && (
                                        <div className="flex items-center text-sm text-gray-500 mt-1.5">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span>{client.email}</span>
                                        </div>
                                    )}

                                    {client.phone && (
                                        <div className="flex items-center text-sm text-gray-500 mt-1.5">
                                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}

                                    <div className="mt-2 text-xs text-gray-400">
                                        ID: BRI-C-
                                        {client.id.toString().padStart(4, "0")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full sm:w-auto sm:ml-3"
                            onClick={handleDelete}
                        >
                            Hapus Nasabah
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto"
                            onClick={closeModal}
                        >
                            Batalkan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteClientModal;
