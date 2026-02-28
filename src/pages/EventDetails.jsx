import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "firebase/firestore";
import { db } from "../firebase";
import AddEntryModal from "../components/AddEntryModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ADMIN_PASSWORD = "agent2817"; // 🔐 CHANGE IF NEEDED

export default function EventDetails() {
    const { id } = useParams();
    const [entries, setEntries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [passwordModal, setPasswordModal] = useState(false);
    const [adminPass, setAdminPass] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        const snap = await getDocs(collection(db, "events", id, "entries"));
        setEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const addEntry = async (data) => {
        await addDoc(collection(db, "events", id, "entries"), data);
        fetchEntries();
    };

    // Open password modal
    const requestDelete = (entryId) => {
        setDeleteId(entryId);
        setPasswordModal(true);
        setAdminPass("");
        setError("");
    };

    // Confirm deletion
    const confirmDelete = async () => {
        if (adminPass !== ADMIN_PASSWORD) {
            setError("Wrong Admin Password");
            return;
        }

        await deleteDoc(doc(db, "events", id, "entries", deleteId));
        setPasswordModal(false);
        fetchEntries();
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(entries);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Entries");
        XLSX.writeFile(wb, "event_data.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Parent", "Phone", "Child Name", "Child Grade"]],
            body: entries.map(e => [
                e.parentName,
                e.phone,
                e.childName,
                e.childAge
            ])
        });
        doc.save("event_data.pdf");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-5">

            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold">
                        Entries ({entries.length})
                    </h1>

                    <div className="grid grid-cols-2 md:flex gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white py-3 px-5 rounded-xl font-semibold"
                        >
                            + Add
                        </button>

                        <button
                            onClick={exportExcel}
                            className="bg-green-600 text-white py-3 px-5 rounded-xl font-semibold"
                        >
                            Excel
                        </button>

                        <button
                            onClick={exportPDF}
                            className="bg-red-600 text-white py-3 px-5 rounded-xl font-semibold col-span-2 md:col-span-1"
                        >
                            PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-100">
                            <tr>
                                <th className="p-4 text-left">Parent</th>
                                <th className="p-4 text-left">Phone</th>
                                <th className="p-4 text-left">Child's Name</th>
                                <th className="p-4 text-left">Child's Grade</th>
                                <th className="p-4 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id} className="border-t">
                                    <td className="p-4">{entry.parentName}</td>
                                    <td className="p-4">{entry.phone}</td>
                                    <td className="p-4">{entry.childName}</td>
                                    <td className="p-4">{entry.childAge}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => requestDelete(entry.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <AddEntryModal
                        onClose={() => setShowModal(false)}
                        onSubmit={addEntry}
                    />
                )}

                {/* 🔐 Password Modal */}
                {passwordModal && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-lg font-bold mb-4">
                                Enter Admin Password
                            </h2>

                            <input
                                type="password"
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="w-full border p-3 rounded-xl mb-3"
                                placeholder="Admin Password"
                            />

                            {error && (
                                <p className="text-red-500 text-sm mb-2">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setPasswordModal(false)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}