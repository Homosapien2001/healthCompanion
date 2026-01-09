
import { useState } from "react"
import { Card } from "../ui/Card"
import { User, Quote, Sparkles } from "lucide-react"
import { useAppStore } from "../../store/useAppStore"
import { Link } from "react-router-dom"

const QUOTES = [
    "Consistency beats motivation.",
    "Small steps every day.",
    "Progress, not perfection.",
    "Health is an investment.",
    "Do it for your future self.",
    "Eat to nourish, not just to feed.",
    "Your body is your temple."
]

export function MotivationHeader() {
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
    const user = useAppStore(state => state.user)

    // Get time of day for greeting
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
    const firstName = user.name?.split(' ')[0] || "Friend"

    return (
        <div className="relative">
            {/* Header Section with App Name/Greeting */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                        NutriTrack
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        {greeting}, {firstName}
                    </p>
                </div>

                <Link
                    to="/profile"
                    className="relative group block"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative h-12 w-12 rounded-xl bg-slate-900 dark:bg-white p-0.5 overflow-hidden shadow-lg">
                        <div className="h-full w-full rounded-[10px] overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                            <User size={20} className="text-slate-700 dark:text-slate-300" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quote Card */}
            <Card className="relative overflow-hidden rounded-3xl border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-50 text-white dark:text-slate-900 group">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-white/5 dark:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative p-6 flex flex-col items-center text-center z-10">
                    <div className="w-10 h-10 mb-4 rounded-full bg-white/10 dark:bg-slate-900/10 backdrop-blur-md flex items-center justify-center">
                        <Quote size={20} className="text-orange-400 dark:text-orange-600 fill-current" />
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-3 leading-snug font-serif italic tracking-wide">
                        "{quote}"
                    </h2>

                    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase opacity-70 bg-white/10 dark:bg-black/5 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Sparkles size={10} />
                        <span>Daily Wisdom</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
