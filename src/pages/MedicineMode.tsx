Pill,
    Bell,
    Search,
    ArrowLeft,
    ScanLine,
    CalendarClock,
    MessageCircle
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function MedicineMode() {
    const toggleMedicineMode = useAppStore(state => state.toggleMedicineMode)
    const [searchQuery, setSearchQuery] = useState("")

    const handleWhatsAppSetup = () => {
        // Mocking the setup
        toast.success("WhatsApp Reminders Enabled", {
            description: "You will receive notifications 15 minutes before your scheduled dose."
        })
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
                <Card className="p-4 border-red-100 dark:border-slate-800 shadow-md">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                        Find Medicine
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Type medicine name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>
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
                    <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:opacity-80">
                        + Add Reminder
                    </button>
                </div>

                {/* WhatsApp Notification Promo */}
                <Card onClick={handleWhatsAppSetup} className="mb-4 p-4 border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50 cursor-pointer hover:bg-green-50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500 text-white rounded-lg shrink-0">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-400 text-sm">WhatsApp Notifications</h3>
                            <p className="text-xs text-green-700/70 dark:text-green-500 mt-1">
                                Get notified 15 minutes before every dose directly on WhatsApp.
                            </p>
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
        </div>
    )
}
