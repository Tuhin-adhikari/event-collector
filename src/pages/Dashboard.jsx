import { useEffect, useState } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

export default function Dashboard() {

    const [events, setEvents] = useState([])
    const [newEvent, setNewEvent] = useState("")
    const [fields, setFields] = useState([{ name: "", type: "text", options: "" }])

    const nav = useNavigate()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        const snap = await getDocs(collection(db, "events"))
        setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }

    /* ---------- FIELD MANAGEMENT ---------- */

    const addField = () => {
        if (fields.length >= 10) return
        setFields([...fields, { name: "", type: "text", options: "" }])
    }

    const removeField = (index) => {
        const updated = [...fields]
        updated.splice(index, 1)
        setFields(updated)
    }

    const updateField = (index, key, value) => {
        const updated = [...fields]
        updated[index][key] = value
        setFields(updated)
    }

    /* ---------- CREATE EVENT ---------- */

    const createEvent = async () => {

        if (!newEvent.trim()) {
            alert("Enter event name")
            return
        }

        const cleanedFields = fields.map(f => ({
            name: f.name,
            type: f.type,
            options: f.options ? f.options.split(",") : []
        }))

        await addDoc(collection(db, "events"), {
            name: newEvent,
            fields: cleanedFields,
            createdAt: new Date()
        })

        setNewEvent("")
        setFields([{ name: "", type: "text", options: "" }])

        fetchEvents()
    }

    /* ---------- LOGOUT ---------- */

    const logout = async () => {
        await signOut(auth)
        nav("/")
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-8">

            {/* HEADER */}

            <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between gap-4">

                <h1 className="text-2xl md:text-3xl font-bold text-indigo-700">
                    Event Lead Dashboard
                </h1>

                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl shadow"
                >
                    Logout
                </button>

            </div>

            {/* CREATE EVENT */}

            <div className="bg-white shadow-lg rounded-2xl p-6 mb-10">

                <h2 className="text-xl font-semibold mb-4">
                    Create New Event
                </h2>

                <input
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="Event Name"
                    className="border p-3 rounded-xl w-full mb-5"
                />

                <div className="space-y-4">

                    {fields.map((field, i) => (

                        <div key={i} className="bg-gray-50 p-4 rounded-xl space-y-3">

                            <div className="flex gap-3">

                                <input
                                    placeholder="Field Name (Example: Parent Name)"
                                    value={field.name}
                                    onChange={(e) =>
                                        updateField(i, "name", e.target.value)
                                    }
                                    className="border p-3 rounded-xl w-full"
                                />

                                <button
                                    onClick={() => removeField(i)}
                                    className="bg-red-500 text-white px-3 rounded-lg"
                                >
                                    ✕
                                </button>

                            </div>

                            <select
                                value={field.type}
                                onChange={(e) =>
                                    updateField(i, "type", e.target.value)
                                }
                                className="border p-3 rounded-xl w-full"
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="tel">Phone</option>
                                <option value="email">Email</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                                <option value="datetime-local">Date + Time</option>
                                <option value="textarea">Textarea</option>
                                <option value="select">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                            </select>

                            {/* Dropdown options */}

                            {field.type === "select" && (

                                <input
                                    placeholder="Dropdown Options (comma separated)"
                                    value={field.options}
                                    onChange={(e) =>
                                        updateField(i, "options", e.target.value)
                                    }
                                    className="border p-3 rounded-xl w-full"
                                />

                            )}

                        </div>

                    ))}

                </div>

                <div className="flex flex-wrap gap-3 mt-5">

                    <button
                        onClick={addField}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl"
                    >
                        + Add Field ({fields.length}/10)
                    </button>

                    <button
                        onClick={createEvent}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl"
                    >
                        Create Event
                    </button>

                </div>

            </div>

            {/* EVENTS GRID */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {events.map(event => (

                    <div
                        key={event.id}
                        onClick={() => nav(`/event/${event.id}`)}
                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                    >

                        <h2 className="text-lg font-semibold text-indigo-700">
                            {event.name}
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            {event.fields?.length || 0} data fields
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            Click to manage leads
                        </p>

                    </div>

                ))}

            </div>

        </div>

    )

}