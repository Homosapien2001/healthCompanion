import { useAppStore } from "../store/useAppStore"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import {
    Pill,
    Bell,
    Search,
    ArrowLeft,
    ScanLine,
    CalendarClock,
    MessageCircle
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { toast } from "sonner"
import { searchMedicine, type Medicine } from "../services/medicine"

export default function MedicineMode() {
    const user = useAppStore(state => state.user)
    const toggleMedicineMode = useAppStore(state => state.toggleMedicineMode)
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Medicine[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

    // Reminder State
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [reminderForm, setReminderForm] = useState({
        time: "08:00",
        notes: "",
        medicineName: ""
    })

    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setSearchQuery(query)

        if (query.length > 1) {
            setIsSearching(true)
            setHasSearched(false) // Reset while searching
            // Create a local variable to capture the current query for this closure
            const currentQuery = query
            try {
                const results = await searchMedicine(query)
                // Only update if the query hasn't changed in the meantime (basic debouncing/race check)
                if (currentQuery === query) {
                    setSearchResults(results)
                    setHasSearched(true)
                }
            } catch (error) {
                console.error("Search failed", error)
            } finally {
                if (currentQuery === query) {
                    setIsSearching(false)
                }
            }
        } else {
            setSearchResults([])
            setHasSearched(false)
            setIsSearching(false)
        }
    }

    const checkPhoneAndOpenReminder = (prefillMedicine?: Medicine) => {
        if (!user.phoneNumber) {
            toast.error("Phone number required! Please add your phone number in Profile settings to enable WhatsApp reminders.")
            setTimeout(() => {
                toggleMedicineMode()
                navigate("/profile")
            }, 1500)
            return
        }

        if (prefillMedicine) {
            setReminderForm(prev => ({ ...prev, medicineName: prefillMedicine.name }))
            setSelectedMedicine(null)
        }
        setShowReminderModal(true)
    }

    const handleSaveReminder = async () => {
        if (!reminderForm.medicineName) {
            toast.error("Please enter medicine name")
            return
        }

        try {
            if (user.email) {
                await addDoc(collection(db, 'users', user.email, 'reminders'), {
                    ...reminderForm,
                    createdAt: Date.now(),
                    enabled: true,
                    phoneNumber: user.phoneNumber
                })
            }

            toast.success("Reminder Scheduled!", {
                description: `We will notify ${user.phoneNumber} at ${reminderForm.time} via WhatsApp.`
            })
            setShowReminderModal(false)
            setReminderForm({ time: "08:00", notes: "", medicineName: "" })
        } catch (error) {
            console.error("Failed to save reminder", error)
            toast.error("Failed to schedule reminder")
        }
    }

    return (
        <div className="min-h-screen bg-red-50 dark:bg-slate-950 p-4 pb-24 flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                        <Pill className="fill-current" />
                        Medicine Mode
                    </h1>
                    <p className="text-sm text-red-800/60 dark:text-slate-400">
                        Focused medication management
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMedicineMode}
                    className="border-red-200 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 bg-transparent"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Exit
                </Button>
            </header>

            {/* Main Actions */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                {/* Search */}
                <Card className="p-4 border-red-100 dark:border-slate-800 shadow-md relative z-20">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                        Find Medicine
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Type medicine name (e.g. Paracetamol)..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {(searchResults.length > 0 || (hasSearched && searchQuery.length > 1)) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-[300px] overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map(med => (
                                    <button
                                        key={med.id}
                                        onClick={() => {
                                            setSelectedMedicine(med)
                                            setSearchQuery("")
                                            setSearchResults([])
                                            setHasSearched(false)
                                        }}
                                        className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-900/10 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                                    >
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{med.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{med.genericName}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No medicines found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Scan Prescription */}
                <button className="relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-transform text-left">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Scan Prescription</h3>
                            <p className="text-red-100 text-sm">Upload or take a photo to auto-fill</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <ScanLine size={28} />
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                </button>
            </div>

            {/* Reminders Section */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <CalendarClock size={20} className="text-slate-400" />
                        Schedule
                    </h2>
                    <button
                        onClick={() => checkPhoneAndOpenReminder()}
                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:opacity-80"
                    >
                        + Add Reminder
                    </button>
                </div>

                {/* WhatsApp Notification Promo */}
                <Card onClick={() => checkPhoneAndOpenReminder()} className="mb-4 p-4 border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50 cursor-pointer hover:bg-green-50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500 text-white rounded-lg shrink-0">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-400 text-sm">WhatsApp Notifications</h3>
                            <p className="text-xs text-green-700/70 dark:text-green-500 mt-1">
                                {user.phoneNumber ? `Active for ${user.phoneNumber}` : "Enable 15 min alerts on your phone"}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!("Notification" in window)) {
                                        toast.error("Notifications not supported");
                                        return;
                                    }
                                    Notification.requestPermission().then(permission => {
                                        if (permission === 'granted') {
                                            new Notification("Test Notification", { body: "If you see this, reminders will work!" });
                                            toast.success("Test notification sent!");
                                        } else {
                                            toast.error("Permission denied");
                                        }
                                    });
                                }}
                                className="mt-2 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-1 rounded hover:bg-green-300 transition"
                            >
                                Test Alert
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Empty State or List */}
                <div className="space-y-3">
                    {/* Mock Item */}
                    <Card className="p-4 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex flex-col items-center justify-center w-12 h-14 bg-red-100 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
                            <span className="text-xs font-bold">PM</span>
                            <span className="text-lg font-bold leading-none">08</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">Amoxicillin</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">500mg • After Food</p>
                        </div>
                        <div className="h-8 w-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300">
                            <Bell size={14} />
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800 opacity-60">
                        <div className="flex flex-col items-center justify-center w-12 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                            <span className="text-xs font-bold">AM</span>
                            <span className="text-lg font-bold leading-none">09</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 line-through">Vitamin D</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1000IU • Taken at 9:05 AM</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <ScanLine size={14} className="rotate-180" />
                            {/* Just checking icon reuse, "Check" might be better */}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Medicine Details Modal */}
            {selectedMedicine && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[85vh] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMedicine.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedMedicine.genericName}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedMedicine(null)}
                                    className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                                >
                                    <ArrowLeft size={20} className="rotate-180" /> {/* Close icon substitute */}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <h4 className="font-semibold text-red-700 dark:text-red-400 text-sm uppercase tracking-wide mb-1">Description</h4>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        {selectedMedicine.description}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Dosage</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        {selectedMedicine.dosage}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Common Side Effects</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {selectedMedicine.sideEffects.map(effect => (
                                            <li key={effect} className="text-slate-600 dark:text-slate-400 text-sm">
                                                {effect}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Warnings</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {selectedMedicine.warnings.map(warning => (
                                            <li key={warning} className="text-slate-600 dark:text-slate-400 text-sm">
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Button fullWidth onClick={() => checkPhoneAndOpenReminder(selectedMedicine)}>
                                Add to Schedule with Reminders
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Reminder Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-200">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Set Reminder</h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Medicine Name</label>
                                <input
                                    value={reminderForm.medicineName}
                                    onChange={e => setReminderForm({ ...reminderForm, medicineName: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700"
                                    placeholder="e.g. Ibuprofen"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={reminderForm.time}
                                    onChange={e => setReminderForm({ ...reminderForm, time: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Notes (Optional)</label>
                                <input
                                    value={reminderForm.notes}
                                    onChange={e => setReminderForm({ ...reminderForm, notes: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700"
                                    placeholder="e.g. Take with food"
                                />
                            </div>

                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-xl flex gap-3 items-center">
                                <MessageCircle size={20} className="text-green-600 shrink-0" />
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    A WhatsApp alert will be sent to <b>{user.phoneNumber}</b> 15 mins before time.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" fullWidth onClick={() => setShowReminderModal(false)}>Cancel</Button>
                            <Button fullWidth onClick={handleSaveReminder}>Save Reminder</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
