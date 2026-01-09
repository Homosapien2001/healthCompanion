import { useAppStore } from "../store/useAppStore"
import { Card } from "../components/ui/Card"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns"
import { calculateTDEE } from "../lib/calories"
import { getAIHealthInsights } from "../lib/ai"
import { Sparkles, Brain, Loader2, Zap, Target, Flame, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "../lib/utils"

export default function Stats() {
    const logs = useAppStore(state => state.logs)
    const user = useAppStore(state => state.user)

    // Weekly Data Logic
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
    const end = endOfWeek(today, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end })

    const targetCalories = calculateTDEE(user)

    const data = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const log = logs[dateStr]
        const total = (log?.entries || []).reduce((acc, e) => acc + e.calories, 0)
        return {
            day: format(day, 'EEE'), // Mon, Tue
            calories: total,
            isToday: isSameDay(day, today),
            fullDate: dateStr
        }
    })

    // Filter out future days (0 calories) from average calculation unless it's genuinely 0? 
    // For simplicity, let's average over days passed so far in the week including today.
    const daysPassed = days.filter(d => d <= today).length || 1
    const totalCaloriesSoFar = data.filter(d => new Date(d.fullDate) <= today).reduce((acc, d) => acc + d.calories, 0)
    const weeklyAverage = Math.round(totalCaloriesSoFar / daysPassed)

    // Calculate Weekly Macro Averages
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const log = logs[dateStr]
        if (log) {
            log.entries.forEach(e => {
                totalProtein += e.protein
                totalCarbs += e.carbs
                totalFat += e.fat
            })
        }
    })

    const avgProtein = Math.round(totalProtein / daysPassed)
    const avgCarbs = Math.round(totalCarbs / daysPassed)
    const avgFat = Math.round(totalFat / daysPassed)

    // Rough Macr Targets (e.g. 30/35/35 split of TDEE)
    // P: 4 cal/g, C: 4 cal/g, F: 9 cal/g
    const targetProtein = Math.round((targetCalories * 0.3) / 4)
    const targetCarbs = Math.round((targetCalories * 0.35) / 4)
    const targetFat = Math.round((targetCalories * 0.35) / 9)

    const [aiInsights, setAiInsights] = useState<string | null>(null)
    const [isLoadingAI, setIsLoadingAI] = useState(false)

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoadingAI(true)
            const insights = await getAIHealthInsights(data, user)
            setAiInsights(insights)
            setIsLoadingAI(false)
        }
        fetchInsights()
    }, [])

    return (
        <div className="space-y-6 pt-2 pb-24 -mx-4 px-4 min-h-screen bg-slate-950 text-slate-200">
            <header className="pt-4">
                <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Zap size={16} fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-widest">Performance Dashboard</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Your Progress</h1>
            </header>

            {/* AI Health Coach Card (Glassmorphism) */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <Card className="relative bg-slate-900/80 backdrop-blur-xl border-slate-800 text-white p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                        <Brain size={140} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-orange-500/20 p-2 rounded-xl">
                                <Sparkles size={20} className="text-orange-400" />
                            </div>
                            <h3 className="font-bold text-lg tracking-wide uppercase text-slate-300 text-xs">AI Insights</h3>
                        </div>
                        {isLoadingAI ? (
                            <div className="flex items-center gap-3 text-slate-400 text-sm italic">
                                <Loader2 size={18} className="animate-spin text-orange-500" />
                                Analyzing metrics...
                            </div>
                        ) : (
                            <p className="text-slate-200 leading-relaxed text-sm font-medium">
                                {aiInsights || "Start logging your meals to unlock your AI health coach."}
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Calories Chart (Area Chart) */}
            <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Flame size={20} className="text-orange-500" />
                        </div>
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Calorie Flux</h3>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Weekly Avg</div>
                        <div className="text-xl font-black text-orange-500">{weeklyAverage}</div>
                    </div>
                </div>

                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#f97316' }}
                            />
                            <ReferenceLine y={targetCalories} stroke="#334155" strokeDasharray="5 5" label={{ value: 'GOAL', position: 'right', fill: '#475569', fontSize: 10, fontWeight: 800 }} />
                            <Area
                                type="monotone"
                                dataKey="calories"
                                stroke="#f97316"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorCal)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Averages (Modern Macro Grid) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-cyan-500" />
                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">Macro Composition</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <StatRow label="Protein" value={avgProtein} target={targetProtein} unit="g" color="bg-emerald-500" shadow="shadow-emerald-500/20" />
                    <StatRow label="Carbs" value={avgCarbs} target={targetCarbs} unit="g" color="bg-cyan-500" shadow="shadow-cyan-500/20" />
                    <StatRow label="Fat" value={avgFat} target={targetFat} unit="g" color="bg-orange-500" shadow="shadow-orange-500/20" />
                </div>
            </div>

            {/* Consistency Tracker (Dark Style) */}
            <Card className="bg-slate-900 border-slate-800 border-dashed">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Target size={20} className="text-purple-500" />
                    </div>
                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">Consistency Map</h3>
                </div>
                <div className="flex justify-between gap-1.5 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, w) => (
                        <div key={w} className="flex-1 space-y-2">
                            <div className="h-14 bg-slate-800/50 rounded-xl p-1.5 flex items-end justify-center gap-[2px] border border-slate-800">
                                {Array.from({ length: 7 }).map((_, d) => (
                                    <div
                                        key={d}
                                        className={cn(
                                            "w-full rounded-sm transition-all duration-1000",
                                            Math.random() > 0.3 ? 'bg-orange-500 h-full opacity-80' : 'bg-slate-700 h-1/4'
                                        )}
                                    ></div>
                                ))}
                            </div>
                            <div className="text-[9px] text-center text-slate-500 font-black uppercase">W{w + 1}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

interface StatRowProps {
    label: string
    value: number
    target: number
    unit: string
    color: string
}

function StatRow({ label, value, target, unit, color, shadow }: StatRowProps & { shadow: string }) {
    const pct = Math.min(100, (value / target) * 100)
    const diff = Math.round(((value - target) / target) * 100)
    const isOver = diff > 0

    return (
        <Card className="bg-slate-900 border-slate-800 p-5 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{value}</span>
                        <span className="text-xs font-bold text-slate-500">/ {target}{unit}</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter",
                    isOver ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                )}>
                    {isOver ? '+' : ''}{diff}% Target
                </div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div
                    className={cn("h-full transition-all duration-1000 shadow-lg", color, shadow)}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </Card>
    )
}
