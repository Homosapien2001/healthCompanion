import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'
import { type RecipeBookItem, addToRecipeBook as firestoreAddRecipe, getRecipeBook as firestoreGetRecipes, removeFromRecipeBook as firestoreRemoveRecipe } from '../services/social'



export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'
export type Goal = 'lose' | 'maintain' | 'gain'

export interface UserProfile {
    isAuthenticated: boolean
    name: string
    email: string // Added email
    password?: string // Added password
    height: number // cm
    weight: number // kg
    age: number
    gender: Gender
    activityLevel: ActivityLevel
    goal: Goal
    onboardingCompleted: boolean
    photoURL?: string
}

export interface MealEntry {
    id: string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'medicine'
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    timestamp: number
}

export interface DayLog {
    date: string // YYYY-MM-DD
    entries: MealEntry[]
    waterIntake: number // ml (optional)
}

export interface DayPlan {
    date: string
    entries: MealEntry[]
    totalCalories: number
}

interface AppState {
    user: UserProfile
    logs: Record<string, DayLog> // key is YYYY-MM-DD
    plans: Record<string, DayPlan>
    recipeBook: RecipeBookItem[]

    medicineMode: boolean
    apiKey: string | null // Personal key
    sharedApiKey: string | null // Global shared key from owner
    theme: 'light' | 'dark'

    // Actions
    login: () => void
    logout: () => Promise<void>
    setUser: (profile: Partial<UserProfile>) => void
    setTheme: (theme: 'light' | 'dark') => void
    toggleMedicineMode: () => void
    setApiKey: (key: string | null) => void // New action for API key
    addEntry: (date: string, entry: Omit<MealEntry, 'id' | 'timestamp'>) => Promise<void>
    removeEntry: (date: string, entryId: string) => Promise<void>
    addPlanEntry: (date: string, entry: Omit<MealEntry, 'id' | 'timestamp'>) => Promise<void>
    removePlanEntry: (date: string, entryId: string) => Promise<void>
    syncWithFirestore: () => Promise<void>
    loadRecipeBook: () => Promise<void>
    addToRecipeBook: (item: Omit<RecipeBookItem, 'id' | 'addedAt'>) => Promise<void>
    removeFromRecipeBook: (id: string) => Promise<void>

}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: {
                isAuthenticated: false,
                name: 'Guest',
                email: '', // Initial email
                password: '', // Initial password
                height: 170,
                weight: 70,
                age: 30,
                gender: 'male',
                activityLevel: 'moderate',
                goal: 'maintain',
                onboardingCompleted: false
            },
            logs: {},
            plans: {},
            recipeBook: [],

            medicineMode: false,
            apiKey: null,
            sharedApiKey: null,
            theme: 'light',

            login: () => set((state) => ({ user: { ...state.user, isAuthenticated: true } })),
            logout: async () => {
                await signOut(auth);
                set((state) => ({ user: { ...state.user, isAuthenticated: false, email: '' } }));
            },
            setUser: async (profile) => {
                set((state) => ({ user: { ...state.user, ...profile } }))
                const state = useAppStore.getState()
                if (state.user.isAuthenticated && state.user.email) {
                    try {
                        await setDoc(doc(db, 'users', state.user.email), state.user, { merge: true })
                    } catch (e) {
                        console.error("Firestore profile sync error:", e)
                    }
                }
            },
            toggleMedicineMode: () => set((state) => ({ medicineMode: !state.medicineMode })),
            setApiKey: (key) => set({ apiKey: key }),
            setTheme: (theme) => set({ theme }),

            addEntry: async (date, entry) => {
                const newEntry: MealEntry = {
                    ...entry,
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now()
                }

                const state = useAppStore.getState()
                const existingLog = state.logs[date] || { date, entries: [], waterIntake: 0 }
                const updatedLog = {
                    ...existingLog,
                    entries: [...existingLog.entries, newEntry]
                }

                set({
                    logs: {
                        ...state.logs,
                        [date]: updatedLog
                    }
                })

                // Firestore Sync
                if (state.user.isAuthenticated && state.user.email) {
                    try {
                        await setDoc(doc(db, 'users', state.user.email, 'logs', date), updatedLog)
                    } catch (e) {
                        console.error("Firestore sync error:", e)
                    }
                }
            },

            removeEntry: async (date, entryId) => {
                const state = useAppStore.getState()
                const log = state.logs[date]
                if (!log) return

                const updatedLog = {
                    ...log,
                    entries: log.entries.filter(e => e.id !== entryId)
                }

                set({
                    logs: {
                        ...state.logs,
                        [date]: updatedLog
                    }
                })

                // Firestore Sync
                if (state.user.isAuthenticated && state.user.email) {
                    try {
                        await setDoc(doc(db, 'users', state.user.email, 'logs', date), updatedLog)
                    } catch (e) {
                        console.error("Firestore sync error:", e)
                    }
                }
            },

            addPlanEntry: async (date, entry) => {
                const newEntry: MealEntry = {
                    ...entry,
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now()
                }

                const state = useAppStore.getState()
                const existingPlan = state.plans[date] || { date, entries: [], totalCalories: 0 }
                const updatedPlan = {
                    ...existingPlan,
                    entries: [...existingPlan.entries, newEntry]
                }

                set({
                    plans: {
                        ...state.plans,
                        [date]: updatedPlan
                    }
                })

                // Firestore Sync
                if (state.user.isAuthenticated && state.user.email) {
                    try {
                        await setDoc(doc(db, 'users', state.user.email, 'plans', date), updatedPlan)
                    } catch (e) {
                        console.error("Firestore sync error:", e)
                    }
                }
            },

            removePlanEntry: async (date, entryId) => {
                const state = useAppStore.getState()
                const plan = state.plans[date]
                if (!plan) return

                const updatedPlan = {
                    ...plan,
                    entries: plan.entries.filter(e => e.id !== entryId)
                }

                set({
                    plans: {
                        ...state.plans,
                        [date]: updatedPlan
                    }
                })

                // Firestore Sync
                if (state.user.isAuthenticated && state.user.email) {
                    try {
                        await setDoc(doc(db, 'users', state.user.email, 'plans', date), updatedPlan)
                    } catch (e) {
                        console.error("Firestore sync error:", e)
                    }
                }
            },

            syncWithFirestore: async () => {
                const state = useAppStore.getState()
                if (!state.user.isAuthenticated || !state.user.email) return

                console.log("Syncing with Firestore for:", state.user.email)

                try {
                    // 1. Fetch Profile
                    const userDoc = await getDoc(doc(db, 'users', state.user.email))
                    if (userDoc.exists()) {
                        set({ user: { ...state.user, ...userDoc.data() } as UserProfile })
                    }

                    // 2. Fetch Logs (Current week roughly or a subset)
                    const logsColl = collection(db, 'users', state.user.email, 'logs')
                    const logsSnap = await getDocs(logsColl)
                    const fetchedLogs: Record<string, DayLog> = {}
                    logsSnap.forEach(doc => {
                        fetchedLogs[doc.id] = doc.data() as DayLog
                    })

                    // 3. Fetch Plans
                    const plansColl = collection(db, 'users', state.user.email, 'plans')
                    const plansSnap = await getDocs(plansColl)
                    const fetchedPlans: Record<string, DayPlan> = {}
                    plansSnap.forEach(doc => {
                        fetchedPlans[doc.id] = doc.data() as DayPlan
                    })

                    set({
                        logs: { ...state.logs, ...fetchedLogs },
                        plans: { ...state.plans, ...fetchedPlans }
                    })

                    // 4. Fetch Global Shared API Key (Fallback)
                    try {
                        const sharedDoc = await getDoc(doc(db, 'settings', 'ai'))
                        if (sharedDoc.exists()) {
                            set({ sharedApiKey: sharedDoc.data().apiKey })
                        }
                    } catch (e) {
                        console.warn("Could not fetch shared API key (permissions?)", e)
                    }

                    console.log("Firestore sync complete.")
                } catch (e) {
                    console.error("Firestore hydration error:", e)
                }
            },

            loadRecipeBook: async () => {
                const state = useAppStore.getState()
                if (!state.user.isAuthenticated || !state.user.email) return
                try {
                    // Start fetching
                    const recipes = await firestoreGetRecipes(state.user.email)
                    set({ recipeBook: recipes })
                } catch (error) {
                    console.error("Failed to load recipe book", error)
                }
            },

            addToRecipeBook: async (item) => {
                const state = useAppStore.getState()
                if (!state.user.isAuthenticated || !state.user.email) {
                    // Local only fall back? or force auth
                    return
                }

                try {
                    // Optimistic update?
                    // For now, wait for server
                    const id = await firestoreAddRecipe(state.user.email, item)
                    const newItem: RecipeBookItem = { ...item, id: id, addedAt: Date.now() }

                    set(state => ({
                        recipeBook: [newItem, ...state.recipeBook]
                    }))
                } catch (error) {
                    console.error("Failed to add to recipe book", error)
                    throw error
                }
            },

            removeFromRecipeBook: async (id) => {
                const state = useAppStore.getState()
                if (!state.user.isAuthenticated || !state.user.email) return

                try {
                    await firestoreRemoveRecipe(state.user.email, id)
                    set(state => ({
                        recipeBook: state.recipeBook.filter(i => i.id !== id)
                    }))
                } catch (error) {
                    console.error("Failed to remove from recipe book", error)
                    throw error
                }
            }

        }),
        {
            name: 'nutri-track-storage-v2',

            storage: createJSONStorage(() => localStorage),
        }
    )
)

// Initialize Firebase Auth listener
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        useAppStore.getState().setUser({
            isAuthenticated: true,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User'
        })
        // Trigger Cloud Sync
        await useAppStore.getState().syncWithFirestore()
        await useAppStore.getState().loadRecipeBook()

    } else {
        useAppStore.getState().setUser({
            isAuthenticated: false,
            email: '',
            name: 'Guest'
        })
    }
})

