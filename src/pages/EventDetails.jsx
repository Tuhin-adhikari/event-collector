import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore"

import { db } from "../firebase"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function EventDetails() {

    const { id } = useParams()

    const [event, setEvent] = useState(null)
    const [entries, setEntries] = useState([])
    const [formData, setFormData] = useState({})

    const [showEntryModal, setShowEntryModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [deleteId, setDeleteId] = useState(null)
    const [password, setPassword] = useState("")

    const [sortField, setSortField] = useState(null)
    const [sortAsc, setSortAsc] = useState(true)

    const ADMIN_PASSWORD = "agent2817";

    /* ---------- FIELD HELPERS ---------- */

    const getFieldName = (field, i) =>
        typeof field === "string"
            ? field
            : field.name || field.label || `Field ${i + 1}`

    const getFieldType = (field) =>
        typeof field === "string"
            ? "text"
            : field.type || "text"

    /* ---------- LOAD DATA ---------- */

    useEffect(() => {
        fetchEvent()
        fetchEntries()
    }, [])

    const fetchEvent = async () => {

        const ref = doc(db, "events", id)
        const snap = await getDoc(ref)

        if (snap.exists()) {

            setEvent(snap.data())

            let initial = {}

            snap.data().fields.forEach((f, i) => {
                initial[getFieldName(f, i)] = ""
            })

            setFormData(initial)

        }

    }

    const fetchEntries = async () => {

        const querySnapshot = await getDocs(
            collection(db, "events", id, "entries")
        )

        const data = querySnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }))

        setEntries(data)

    }

    /* ---------- FORM ---------- */

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const addEntry = async (e) => {

        e.preventDefault()

        await addDoc(collection(db, "events", id, "entries"), {
            ...formData,
            important: false
        })

        fetchEntries()

        let reset = {}

        event.fields.forEach((f, i) => {
            const name = getFieldName(f, i)
            reset[name] = ""
        })

        setFormData(reset)
        setShowEntryModal(false)

    }

    /* ---------- DELETE ---------- */

    const confirmDelete = (entryId) => {
        setDeleteId(entryId)
        setShowDeleteModal(true)
    }

    const deleteEntry = async () => {

        if (password !== ADMIN_PASSWORD) {
            alert("Wrong password")
            return
        }

        await deleteDoc(doc(db, "events", id, "entries", deleteId))

        setShowDeleteModal(false)
        setPassword("")
        fetchEntries()

    }

    /* ---------- IMPORTANT ---------- */

    const toggleImportant = async (entry) => {

        const ref = doc(db, "events", id, "entries", entry.id)

        await updateDoc(ref, {
            important: !entry.important
        })

        fetchEntries()

    }

    /* ---------- SORT ---------- */

    const sortByField = (field) => {

        let asc = sortAsc

        if (sortField === field) asc = !asc
        else asc = true

        setSortField(field)
        setSortAsc(asc)

        const sorted = [...entries].sort((a, b) => {

            if (a[field] < b[field]) return asc ? -1 : 1
            if (a[field] > b[field]) return asc ? 1 : -1
            return 0

        })

        setEntries(sorted)

    }

    /* ---------- EXPORT EXCEL ---------- */

    const exportExcel = () => {

        const headers = event.fields.map((f, i) => getFieldName(f, i))

        const data = entries.map(e => {

            let obj = {}

            headers.forEach(h => {
                obj[h] = e[h]
            })

            return obj

        })

        const ws = XLSX.utils.json_to_sheet(data)

        const wb = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(wb, ws, "Leads")

        XLSX.writeFile(wb, event.name + "_leads.xlsx")

    }

    /* ---------- EXPORT PDF ---------- */

    const exportPDF = () => {

        const headers = event.fields.map((f, i) => getFieldName(f, i))

        const rows = entries.map(e =>
            headers.map(h => e[h])
        )

        const pdf = new jsPDF()

        autoTable(pdf, {
            head: [headers],
            body: rows
        })

        pdf.save(event.name + "_leads.pdf")

    }

    /* ---------- UI ---------- */

    if (!event) return <div className="p-4">Loading...</div>

    return (

        <div className="p-4 max-w-4xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">
                {event.name}
            </h1>

            <div className="flex gap-2 mb-4 flex-wrap">

                <button
                    onClick={() => {
                        let reset = {}
                        event.fields.forEach((f, i) => {
                            reset[getFieldName(f, i)] = ""
                        })
                        setFormData(reset)
                        setShowEntryModal(true)
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    + Add Entry
                </button>

                <button
                    onClick={exportExcel}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Export Excel
                </button>

                <button
                    onClick={exportPDF}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                    Export PDF
                </button>

            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            {event.fields.map((f, i) => {

                                const name = getFieldName(f, i)

                                return (
                                    <th
                                        key={i}
                                        onClick={() => sortByField(name)}
                                        className="p-3 text-left cursor-pointer"
                                    >
                                        {name} ⇅
                                    </th>
                                )

                            })}

                            <th className="p-3">⭐</th>
                            <th className="p-3">Delete</th>

                        </tr>

                    </thead>

                    <tbody>

                        {entries.map(entry => (

                            <tr
                                key={entry.id}
                                className={`border-t ${entry.important ? "bg-yellow-100" : ""}`}
                            >

                                {event.fields.map((f, i) => {

                                    const name = getFieldName(f, i)

                                    return (
                                        <td key={i} className="p-3">
                                            {entry[name]}
                                        </td>
                                    )

                                })}

                                <td className="p-3">

                                    <button
                                        onClick={() => toggleImportant(entry)}
                                        className="px-2 py-1 rounded bg-yellow-400"
                                    >
                                        {entry.important ? "⭐" : "☆"}
                                    </button>

                                </td>

                                <td className="p-3">

                                    <button
                                        onClick={() => confirmDelete(entry.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* ---------- ENTRY MODAL ---------- */}

            {showEntryModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white rounded-xl w-full max-w-md p-6">

                        <h2 className="text-xl font-bold mb-4">
                            Add Entry
                        </h2>

                        <form onSubmit={addEntry} className="space-y-4">

                            {event.fields.map((field, i) => {

                                const name = getFieldName(field, i)
                                const type = getFieldType(field)

                                /* textarea */

                                if (type === "textarea") {

                                    return (
                                        <div key={i}>
                                            <label className="block text-sm mb-1">{name}</label>
                                            <textarea
                                                value={formData[name] || ""}
                                                placeholder={"Enter " + name}
                                                onChange={(e) => handleChange(name, e.target.value)}
                                                className="w-full border p-3 rounded-lg"
                                            />
                                        </div>
                                    )

                                }

                                /* select */

                                if (type === "select") {

                                    return (
                                        <div key={i}>
                                            <label className="block text-sm mb-1">{name}</label>

                                            <select
                                                value={formData[name] || ""}
                                                onChange={(e) => handleChange(name, e.target.value)}
                                                className="w-full border p-3 rounded-lg"
                                            >

                                                <option value="">Select {name}</option>

                                                {field.options?.map((opt, idx) => (
                                                    <option key={idx} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}

                                            </select>

                                        </div>
                                    )

                                }

                                /* checkbox */

                                if (type === "checkbox") {

                                    return (
                                        <div key={i} className="flex items-center gap-2">

                                            <input
                                                type="checkbox"
                                                checked={formData[name] || false}
                                                onChange={(e) => handleChange(name, e.target.checked)}
                                            />

                                            <label>{name}</label>

                                        </div>
                                    )

                                }

                                /* default inputs */

                                return (

                                    <div key={i}>

                                        <label className="block text-sm mb-1">
                                            {name}
                                        </label>

                                        <input
                                            type={type}
                                            value={formData[name] || ""}
                                            placeholder={"Enter " + name}
                                            onChange={(e) => handleChange(name, e.target.value)}
                                            className="w-full border p-3 rounded-lg"
                                        />

                                    </div>

                                )

                            })}

                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    onClick={() => setShowEntryModal(false)}
                                    className="w-1/2 bg-gray-300 py-2 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="w-1/2 bg-green-600 text-white py-2 rounded"
                                >
                                    Save Entry
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ---------- DELETE MODAL ---------- */}

            {showDeleteModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-lg w-80">

                        <h2 className="font-bold mb-3">
                            Admin Password
                        </h2>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 w-full mb-3"
                        />

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-300 px-3 py-1 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deleteEntry}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}