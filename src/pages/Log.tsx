import { useState, useRef } from "react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { format } from "date-fns"
import { useAppStore, type MealEntry } from "../store/useAppStore"
import { Plus, Trash2, Pill, Loader2, Camera, X } from "lucide-react"
import { AddFoodForm } from "../components/log/AddFoodForm"
import { CameraCapture } from "../components/log/CameraCapture"
import { cn } from "../lib/utils"
import { calculateTDEE } from "../lib/calories"
import { analyzeImage } from "../lib/ai"
import { toast } from "sonner"

export default function Log() {
    // Dynamic Tabs
    const TABS: MealEntry['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack']
    // Medicine is now handled in Medicine Mode

    const [activeTab, setActiveTab] = useState<MealEntry['mealType']>('breakfast')
    const [isAddingMode, setIsAddingMode] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [showScanModal, setShowScanModal] = useState(false)
    const [showWebCamera, setShowWebCamera] = useState(false)
    const [scannedData, setScannedData] = useState<Partial<MealEntry> | undefined>(undefined)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    const addEntry = useAppStore(state => state.addEntry)
    const user = useAppStore(state => state.user)

    const today = format(new Date(), 'yyyy-MM-dd')
    const logs = useAppStore(state => state.logs[today])
    const removeEntry = useAppStore(state => state.removeEntry)

    const entries = logs?.entries.filter(e => e.mealType === activeTab) || []

    const dailyTotal = (logs?.entries || []).reduce((acc, e) => acc + e.calories, 0)

    // Calculate TDEE/BMR (Miffin-St Jeor Equation)
    const target = calculateTDEE(user)

    const progress = Math.min(100, (dailyTotal / target) * 100)

    const handleAddEntry = (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
        addEntry(today, entry)
        setScannedData(undefined) // Reset scan data after add
    }

    const handleScanClick = () => {
        setShowScanModal(true)
    }

    const handleCameraChoice = () => {
        setShowScanModal(false)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        if (isMobile) {
            if (cameraInputRef.current) cameraInputRef.current.click()
        } else {
            setShowWebCamera(true)
        }
    }

    const handleGalleryChoice = () => {
        setShowScanModal(false)
        if (galleryInputRef.current) galleryInputRef.current.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        processScannedFile(file)
    }

    const handleWebCapture = (file: File) => {
        setShowWebCamera(false)
        processScannedFile(file)
    }

    const processScannedFile = async (file: File) => {
        setIsScanning(true)
        try {
            const result = await analyzeImage(file)
            setScannedData(result)
            setIsAddingMode(true)

            if (result.name !== "Identified Food") {
                toast.success("Meal Scanned!", {
                    description: `Identified as ${result.name} with ${result.calories} Cal.`
                })
            }
        } catch (error: any) {
            console.error("Scan failed", error)
            toast.error("Scan Failed", {
                description: error.message || "Could not analyze the image. Please try again."
            })
        } finally {
            setIsScanning(false)
            if (cameraInputRef.current) cameraInputRef.current.value = ''
            if (galleryInputRef.current) galleryInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-6 pt-2 pb-6">
            {/* Daily Summary Header */}
            {/* ... (existing code unchanged until content area) ... */}
            <Card className="border-none shadow-sm pb-6 dark:bg-slate-900">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Today's Intake</div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">
                            {dailyTotal} <span className="text-lg font-normal text-slate-400">/ {target}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Remaining</div>
                        <div className="text-lg font-semibold text-slate-600 dark:text-slate-300">{target - dailyTotal}</div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000", progress > 100 ? "bg-red-500" : "bg-orange-500")}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab)
                            setIsAddingMode(false)
                            setScannedData(undefined)
                        }}
                        className={cn(
                            "flex-1 py-2 px-3 text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap flex items-center justify-center gap-2",
                            activeTab === tab
                                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        )}
                    >
                        {tab === 'medicine' && <Pill size={14} />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-4 min-h-[300px]">
                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
                <input
                    type="file"
                    ref={galleryInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {isAddingMode ? (
                    <AddFoodForm
                        mealType={activeTab}
                        initialValues={scannedData}
                        onClose={() => {
                            setIsAddingMode(false)
                            setScannedData(undefined)
                        }}
                        onSubmit={handleAddEntry}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={() => setIsAddingMode(true)}
                                className={cn(
                                    "bg-white dark:bg-slate-900 text-black dark:text-white hover:text-orange-500 hover:border-orange-500 transition-colors",
                                    activeTab === 'medicine' ? "text-red-500 hover:text-red-600 hover:border-red-600" : ""
                                )}
                            >
                                {activeTab === 'medicine' ? <Pill size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                                Add {activeTab === 'medicine' ? 'Medication' : activeTab}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                className="bg-white dark:bg-slate-900 text-black dark:text-white hover:text-orange-500 hover:border-orange-500 transition-colors"
                                onClick={handleScanClick}
                                disabled={activeTab === 'medicine' || isScanning}
                            >
                                {isScanning ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Camera size={18} className="mr-2 text-slate-500 dark:text-slate-400" />}
                                {isScanning ? "Scanning..." : "Scan Meal"}
                            </Button>

                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {entries.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <p>No food logged for {activeTab}</p>
                                </div>
                            ) : (
                                entries.map(entry => (
                                    <Card key={entry.id} className="flex justify-between items-center p-4 dark:bg-slate-900">
                                        <div>
                                            <div className="font-semibold text-slate-800 dark:text-white">{entry.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="font-bold text-slate-700 dark:text-slate-200">{entry.calories} Cal</div>
                                            <button
                                                onClick={() => removeEntry(today, entry.id)}
                                                className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Custom Camera Modal for Desktop */}
            {showWebCamera && (
                <CameraCapture
                    onCapture={handleWebCapture}
                    onClose={() => setShowWebCamera(false)}
                />
            )}

            {/* Scan Options Modal */}
            {showScanModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scan Meal</h3>
                                <button onClick={() => setShowScanModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Choose how you want to add your meal
                            </p>
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                <button
                                    onClick={handleCameraChoice}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-900/50 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Camera size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Take Photo</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-normal">Use your camera directly</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleGalleryChoice}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all border border-slate-100 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-900/50 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Upload Image</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-normal">Choose from your library</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
