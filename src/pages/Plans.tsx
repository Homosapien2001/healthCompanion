import { useState } from "react"
import { WeeklyCalendar } from "../components/plans/WeeklyCalendar"
import { useAppStore, type MealEntry } from "../store/useAppStore"
import { format } from "date-fns"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Plus, Copy, Sparkles, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { AddFoodForm } from "../components/log/AddFoodForm"
import { generateMealPlan } from "../lib/ai"
import { toast } from "sonner"

export default function Plans() {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [activeTab, setActiveTab] = useState<MealEntry['mealType']>('breakfast')
    const [isAddingMode, setIsAddingMode] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const plans = useAppStore(state => state.plans[selectedDate])
    const logs = useAppStore(state => state.logs[selectedDate])
    const user = useAppStore(state => state.user)
    const addPlanEntry = useAppStore(state => state.addPlanEntry)

    const entries = plans?.entries.filter(e => e.mealType === activeTab) || []

    const plannedCalories = (plans?.entries || []).reduce((acc, e) => acc + e.calories, 0)
    const actualCalories = (logs?.entries || []).reduce((acc, e) => acc + e.calories, 0)

    // Copy from previous day (mock logic for now)
    const handleGenerateAI = async () => {
        const state = useAppStore.getState()
        const hasKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || state.sharedApiKey

        if (!hasKey) {
            toast.error("AI Features Restricted", {
                description: "AI generation is temporarily unavailable. Please try again later."
            })
            return
        }
        setIsGenerating(true)
        try {
            const suggestedMeals = await generateMealPlan(user)
            // Add all suggested meals to the plan
            for (const meal of suggestedMeals) {
                await addPlanEntry(selectedDate, meal)
            }
            toast.success("Meal Plan Generated!", {
                description: "AI has created a balanced menu for your day."
            })
        } catch (e: any) {
            console.error("Meal planning failed:", e)
            toast.error("Generation Failed", {
                description: e.message || "Please check your API key and connection."
            })
        } finally {
            setIsGenerating(false)
        }
    }

    // Wrapper for AddFoodForm to add to PLANS instead of LOGS
    // We need to modify AddFoodForm OR handle the submission manually.
    // Ideally AddFoodForm should accept an 'onAdd' callback instead of using store directly.
    // But for speed, I'll just use a hack or duplicate AddFoodForm logic?
    // Better: Refactor AddFoodForm to take `onSubmit` prop.

    // For now, I'll skip the refactor details and just assume I can pass a custom submit handler if I change AddFoodForm.
    // Wait, I designed AddFoodForm to use `addEntry` directly. I should modify it to be reusable.

    return (
        <div className="space-y-6 pt-2 pb-6">
            <header className="space-y-4 px-1">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800">Meal Planner</h1>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleGenerateAI} disabled={isGenerating} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:opacity-90 transition-opacity">
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {isGenerating ? "AI Planning..." : "Generate Plan with AI"}
                    </button>
                    <button onClick={() => alert("Coming soon!")} className="p-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-slate-400 transition-colors">
                        <Copy size={18} />
                    </button>
                </div>
            </header>

            <WeeklyCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* Summary Card */}
            <Card className="bg-slate-800 text-white border-none shadow-xl shadow-slate-200">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Planned</div>
                        <div className="text-2xl font-bold">{plannedCalories}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Actual</div>
                        <div className={cn("text-2xl font-bold", actualCalories > plannedCalories ? "text-red-400" : "text-emerald-400")}>
                            {actualCalories}
                        </div>
                    </div>
                </div>
                {/* Simple Bar */}
                <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (actualCalories / (plannedCalories || 2000)) * 100)}%` }} />
                </div>
            </Card>

            {/* Meal Sections */}
            <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <Card className="min-h-[200px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-700 capitalize">{activeTab}</h3>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-orange-50 text-orange-600" onClick={() => setIsAddingMode(true)}>
                            <Plus size={18} />
                        </Button>
                    </div>

                    {activeTab && (
                        <div className="space-y-3">
                            {entries.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                    No meals planned
                                </div>
                            ) : (
                                entries.map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="font-medium text-slate-700">{entry.name}</span>
                                        <span className="text-slate-500">{entry.calories} Cal</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* Placeholder for modal/form */}
            {isAddingMode && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm mb-20 sm:mb-0">
                        <AddFoodForm
                            mealType={activeTab}
                            onClose={() => setIsAddingMode(false)}
                            onSubmit={(entry) => addPlanEntry(selectedDate, entry)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
