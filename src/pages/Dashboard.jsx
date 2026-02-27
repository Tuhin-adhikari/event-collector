import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const snap = await getDocs(collection(db, "events"));
        setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const createEvent = async () => {
        if (!newEvent.trim()) return;

        await addDoc(collection(db, "events"), {
            name: newEvent,
            createdAt: new Date()
        });

        setNewEvent("");
        fetchEvents();
    };

    const logout = async () => {
        await signOut(auth);
        nav("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-8">

            {/* Header */}
            <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-indigo-700">
                        Events Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Manage and track all event entries
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition shadow"
                >
                    Logout
                </button>
            </div>

            {/* Create Event Section */}
            <div className="bg-white shadow-md rounded-2xl p-5 mb-8">

                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Create New Event
                </h2>

                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        value={newEvent}
                        onChange={(e) => setNewEvent(e.target.value)}
                        placeholder="Event Name (e.g., 28 Feb - Green Valley)"
                        className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-3 rounded-xl w-full outline-none"
                    />

                    <button
                        onClick={createEvent}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold shadow transition"
                    >
                        Add Event
                    </button>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div
                        key={event.id}
                        onClick={() => nav(`/event/${event.id}`)}
                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-indigo-200"
                    >
                        <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                            {event.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Click to manage entries →
                        </p>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {events.length === 0 && (
                <div className="text-center text-gray-500 mt-12">
                    No events created yet.
                </div>
            )}

        </div>
    );
}