import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useAppStore, type UserProfile } from "../store/useAppStore"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Settings, User, Bell, Shield, ChevronRight, Sun, Moon, Camera } from "lucide-react"
import { cn } from "../lib/utils"
import { storage } from "../lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"

export default function Profile() {
    const user = useAppStore(state => state.user)
    const setUser = useAppStore(state => state.setUser)
    const theme = useAppStore(state => state.theme)
    const setTheme = useAppStore(state => state.setTheme)
    const medicineMode = useAppStore(state => state.medicineMode)
    const toggleMedicineMode = useAppStore(state => state.toggleMedicineMode)

    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formRef.current) return

        const formData = new FormData(formRef.current)
        setUser({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            height: Number(formData.get("height")),
            weight: Number(formData.get("weight")),
            age: Number(formData.get("age")),
            gender: formData.get("gender") as UserProfile['gender'],
            activityLevel: formData.get("activity") as UserProfile['activityLevel']
        })
        setIsEditing(false)
    }

    const handleMedicineToggle = () => {
        toggleMedicineMode()
        if (!medicineMode) {
            // Request notification permission if enabling
            if ("Notification" in window) {
                Notification.requestPermission()
            }
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading profile picture...")

        try {
            const fileRef = ref(storage, `profiles/${user.email || 'guest'}_${Date.now()}`)
            await uploadBytes(fileRef, file)
            const url = await getDownloadURL(fileRef)
            setUser({ photoURL: url })
            toast.success("Profile picture updated!", { id: toastId })
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Upload failed. Please try again.", { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6 pt-2 pb-6">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="relative h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group cursor-pointer overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                                <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Consistent for 12 days</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="h-10 w-10 p-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-orange-400" />}
                </Button>
            </header>

            {/* User Details Form/View */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800">Physical Profile</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-orange-600">
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>

                {isEditing ? (
                    <form ref={formRef} onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                            <input name="name" defaultValue={user.name} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg active:scale-[0.99] text-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                            <input name="email" type="email" defaultValue={user.email} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg active:scale-[0.99] text-slate-900 dark:text-slate-100" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Height (cm)</label>
                                <input name="height" type="number" defaultValue={user.height} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Weight (kg)</label>
                                <input name="weight" type="number" defaultValue={user.weight} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Age</label>
                                <input name="age" type="number" defaultValue={user.age} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                                <select name="gender" defaultValue={user.gender} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Activity</label>
                                <select name="activity" defaultValue={user.activityLevel} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                                    <option value="sedentary">Sedentary</option>
                                    <option value="light">Light</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        </div>

                        <Button type="submit" fullWidth>Save Changes</Button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-y-4 text-center border-b border-slate-100 pb-4">
                            <div className="col-span-3 text-left pl-2">
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200 break-all">{user.email || 'No email set'}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-y-4 text-center">
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Height</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">{user.height} cm</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Weight</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">{user.weight} kg</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">BMI</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">{(user.weight / ((user.height / 100) ** 2)).toFixed(1)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Age</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">{user.age}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gender</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{user.gender}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activity</div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{user.activityLevel}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <Button
                variant="outline"
                className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                    useAppStore.getState().logout();
                    window.location.reload(); // Refresh to ensure clean state
                }}
            >
                Log Out / Delete Device Data
            </Button>

            {/* Settings */}
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 ml-1">App Settings</h3>

            {/* Medicine Mode */}
            <Card className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white transition-colors", medicineMode ? "bg-red-500" : "bg-slate-300 dark:bg-slate-700")}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Medicine Mode</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[180px]">
                            {medicineMode ? "Reminders active via Notifications" : "Track medication schedules"}
                        </div>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={medicineMode} onChange={handleMedicineToggle} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
            </Card>

            {medicineMode && (
                <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-xl border border-red-100 dark:border-red-900/50 text-sm text-red-800 dark:text-red-300 animate-in slide-in-from-top-2">
                    <p className="font-bold mb-1">Disclaimer</p>
                    This app does not replace professional medical advice. Please consult your doctor for dosage instructions.
                </div>
            )}

            {/* Other Settings Links */}
            <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-slate-400 dark:text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Notifications</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                </button>
                <Link to="/settings" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                            <Settings size={18} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">General Settings</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
                </Link>
            </Card>

            <div className="text-center text-xs text-slate-300 pt-8 pb-4">
                Version 1.0.0 (MVP)
            </div>
        </div>
    )
}
