import { ArrowLeft, Key } from "lucide-react"
import { Link } from "react-router-dom"

export default function Settings() {

    return (
        <div className="space-y-6 pt-2 pb-6 px-4">
            <div className="flex items-center gap-3 mb-2">
                <Link to="/profile" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 rounded-3xl flex items-center justify-center shadow-inner">
                    <Key size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Intelligence Active</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[240px]">
                        Your cloud-based nutritionist is now active for all your meal scans and health insights.
                    </p>
                </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-12 space-y-1">
                <p>NutriTrack v1.0.0</p>
            </div>
        </div>
    )
}
