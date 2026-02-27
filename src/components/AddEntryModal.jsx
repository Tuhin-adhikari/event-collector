import { useState } from "react";

export default function AddEntryModal({ onClose, onSubmit }) {
    const [parentName, setParentName] = useState("");
    const [phone, setPhone] = useState("");
    const [childName, setChildName] = useState("");
    const [childAge, setChildAge] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            parentName,
            phone,
            childName,
            childAge,
            createdAt: new Date()
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-5 text-gray-800">
                    Add New Entry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        required
                        placeholder="Parent Name"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        onChange={(e) => setParentName(e.target.value)}
                    />

                    <input
                        required
                        placeholder="Phone Number"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <input
                        required
                        placeholder="Child Name"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        onChange={(e) => setChildName(e.target.value)}
                    />

                    <input
                        required
                        type="number"
                        placeholder="Child Age"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        onChange={(e) => setChildAge(e.target.value)}
                    />

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 border rounded-xl"
                        >
                            Cancel
                        </button>

                        <button
                            className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        >
                            Save Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}