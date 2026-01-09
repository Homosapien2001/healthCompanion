import { Home, PlusCircle, Calendar, BarChart2, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"

export function BottomNav() {
    const location = useLocation()

    const items = [
        { icon: Home, label: "Home", path: "/" },
        { icon: PlusCircle, label: "Log", path: "/log" },
        { icon: Calendar, label: "Plans", path: "/plans" },
        { icon: BarChart2, label: "Stats", path: "/stats" },
        { icon: User, label: "Profile", path: "/profile" },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 pb-safe pt-1 px-4 flex justify-around items-center z-50 h-[80px] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] transition-colors duration-300">
            {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300 relative p-2 rounded-xl",
                            isActive ? "text-primary -translate-y-1" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <item.icon
                            className={cn("w-6 h-6 transition-all", isActive && "fill-orange-100")}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className={cn("text-[11px] font-medium", isActive ? "opacity-100" : "opacity-80")}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
