import { useState } from "react"

export default function AddEntryModal({ fields = [], onClose, onSubmit }) {

    const [formData, setFormData] = useState({})

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const renderInput = (field, i) => {

        const name = field.name || `Field ${i + 1}`
        const type = field.type || "text"
        const placeholder = field.placeholder || `Enter ${name}`

        switch (type) {

            case "textarea":
                return (
                    <textarea
                        required
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )

            case "date":
                return (
                    <input
                        type="date"
                        required
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )

            case "number":
                return (
                    <input
                        type="number"
                        required
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )

            case "phone":
                return (
                    <input
                        type="tel"
                        required
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )

            case "email":
                return (
                    <input
                        type="email"
                        required
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )

            default:
                return (
                    <input
                        type="text"
                        required
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />
                )
        }
    }

    const handleSubmit = (e) => {

        e.preventDefault()

        onSubmit({
            ...formData,
            important: false,
            createdAt: new Date()
        })

        onClose()
    }

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

                <h2 className="text-xl font-bold mb-5">
                    Add Entry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {fields.map((field, i) => {

                        const name = field.name || `Field ${i + 1}`

                        return (

                            <div key={i}>

                                <label className="block text-sm font-medium mb-1">
                                    {name}
                                </label>

                                {renderInput(field, i)}

                            </div>

                        )

                    })}

                    <div className="flex justify-end gap-3 pt-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 border rounded-xl"
                        >
                            Cancel
                        </button>

                        <button
                            className="px-5 py-3 bg-indigo-600 text-white rounded-xl"
                        >
                            Save Entry
                        </button>

                    </div>

                </form>

            </div>

        </div>

    )
}