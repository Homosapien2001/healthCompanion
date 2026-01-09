
import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"
import { useAppStore, type MealEntry } from "../../store/useAppStore"

import { X, Check, BookOpen, PenTool } from "lucide-react"
import { cn } from "../../lib/utils"

interface AddFoodFormProps {
    mealType: MealEntry['mealType']
    initialValues?: Partial<Omit<MealEntry, 'id' | 'timestamp'>>
    onClose: () => void
    onSubmit: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => void
}

export function AddFoodForm({ mealType, initialValues, onClose, onSubmit }: AddFoodFormProps) {
    const [mode, setMode] = useState<'manual' | 'recipe'>('manual')

    // REAL STORE CONNECTION (Safe Selectors)
    const recipeBook = useAppStore(state => state.recipeBook || [])
    const loadRecipeBook = useAppStore(state => state.loadRecipeBook)


    const [name, setName] = useState(initialValues?.name || "")
    const [calories, setCalories] = useState(initialValues?.calories?.toString() || "")
    const [protein, setProtein] = useState(initialValues?.protein?.toString() || "")
    const [carbs, setCarbs] = useState(initialValues?.carbs?.toString() || "")
    const [fat, setFat] = useState(initialValues?.fat?.toString() || "")

    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name || "")
            setCalories(initialValues.calories !== undefined ? initialValues.calories.toString() : "")
            setProtein(initialValues.protein !== undefined ? initialValues.protein.toString() : "")
            setCarbs(initialValues.carbs !== undefined ? initialValues.carbs.toString() : "")
            setFat(initialValues.fat !== undefined ? initialValues.fat.toString() : "")
        } else {
            setName("")
            setCalories("")
            setProtein("")
            setCarbs("")
            setFat("")
        }
    }, [initialValues])

    useEffect(() => {
        if (mode === 'recipe') {
            loadRecipeBook()
        }
    }, [mode])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || (mealType !== 'medicine' && !calories)) return

        onSubmit({
            mealType,
            name,
            calories: Number(calories),
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0
        })

        onClose()
    }

    const handleRecipeSelect = (recipe: any) => {
        onSubmit({
            mealType,
            name: recipe.name,
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fat: recipe.fat
        })
        onClose()
    }

    return (
        <Card className="dark:bg-slate-900 border-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Add {mealType === 'medicine' ? 'Medication' : mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <X size={20} />
                </button>
            </div>

            {/* Mode Tabs */}
            {mealType !== 'medicine' && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={cn(
                            "flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                            mode === 'manual' ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        <PenTool size={14} />
                        Manual
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('recipe')}
                        className={cn(
                            "flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                            mode === 'recipe' ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        <BookOpen size={14} />
                        Recipe Book
                    </button>
                </div>
            )}

            {mode === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{mealType === 'medicine' ? 'Medication Name' : 'Food Name'}</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder={mealType === 'medicine' ? "e.g. Vitamin D" : "e.g. Avocado Toast"}
                            autoFocus
                        />
                    </div>

                    {mealType !== 'medicine' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories</label>
                                <input
                                    type="number"
                                    value={calories} onChange={e => setCalories(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}

                    {mealType !== 'medicine' && (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Protein (g)</label>
                                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Carbs (g)</label>
                                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fat (g)</label>
                                <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm" placeholder="0" />
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="outline"
                        className={cn(
                            "mt-2 bg-white dark:bg-slate-800 text-black dark:text-white hover:text-orange-500 hover:border-orange-500 dark:hover:text-orange-400 dark:hover:border-orange-500 transition-all active:scale-[0.98]",
                            mealType === 'medicine' ? "text-red-500 dark:text-red-400 hover:text-red-600 hover:border-red-600" : ""
                        )}
                        disabled={!name || (mealType !== 'medicine' && !calories)}
                    >
                        <Check size={18} className="mr-2" />
                        Confirm & Add
                    </Button>
                </form>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {recipeBook.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No saved recipes yet</p>
                        </div>
                    ) : (
                        recipeBook.map(recipe => (
                            <div
                                key={recipe.id}
                                onClick={() => handleRecipeSelect(recipe)}
                                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors group"
                            >
                                <div>
                                    <div className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400">{recipe.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        P: {recipe.protein}g • C: {recipe.carbs}g • F: {recipe.fat}g
                                    </div>
                                </div>
                                <div className="font-bold text-slate-700 dark:text-gray-200 text-sm">
                                    {recipe.calories} Cal
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </Card>
    )
}
