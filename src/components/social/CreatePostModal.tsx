import { useState, useRef, useEffect } from "react"
import { useAppStore } from "../../store/useAppStore"
import { createPost, updatePost, type Post } from "../../services/social"
import { Button } from "../ui/Button"
import { X, Plus, Loader2, Image as ImageIcon, Save, Camera, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"


interface CreatePostModalProps {
    onClose: () => void
    onPostCreated: () => void
    postToEdit?: Post
}

export function CreatePostModal({ onClose, onPostCreated, postToEdit }: CreatePostModalProps) {
    const user = useAppStore(state => state.user)

    const [title, setTitle] = useState(postToEdit?.title || "")
    const [description, setDescription] = useState(postToEdit?.description || "")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(postToEdit?.image || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Toggle for Post Type
    const [postType, setPostType] = useState<"recipe" | "photo">(
        postToEdit ? (postToEdit.ingredients.length > 0 ? "recipe" : "photo") : "recipe"
    )

    // Macros
    const [calories, setCalories] = useState(postToEdit?.calories?.toString() || "")
    const [protein, setProtein] = useState(postToEdit?.macros?.protein?.toString() || "")
    const [carbs, setCarbs] = useState(postToEdit?.macros?.carbs?.toString() || "")
    const [fat, setFat] = useState(postToEdit?.macros?.fat?.toString() || "")

    const [ingredientInput, setIngredientInput] = useState("")
    const [ingredients, setIngredients] = useState<string[]>(postToEdit?.ingredients || [])

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset state if postToEdit changes (though usually the modal is unmounted/remounted)
    useEffect(() => {
        if (postToEdit) {
            setTitle(postToEdit.title)
            setDescription(postToEdit.description)
            setImagePreview(postToEdit.image || null)
            setPostType(postToEdit.ingredients.length > 0 ? "recipe" : "photo")
            setCalories(postToEdit.calories?.toString() || "")
            setProtein(postToEdit.macros?.protein?.toString() || "")
            setCarbs(postToEdit.macros?.carbs?.toString() || "")
            setFat(postToEdit.macros?.fat?.toString() || "")
            setIngredients(postToEdit.ingredients || [])
        }
    }, [postToEdit])

    const handleAddIngredient = () => {
        if (!ingredientInput.trim()) return
        setIngredients([...ingredients, ingredientInput.trim()])
        setIngredientInput("")
    }

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index))
    }


    // Client-side image compression
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target?.result as string
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')

                    // Max dimensions
                    const MAX_WIDTH = 800
                    const MAX_HEIGHT = 800
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    ctx?.drawImage(img, 0, 0, width, height)

                    // Compress to JPEG with 0.7 quality to keep size low for Firestore
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
                    resolve(compressedBase64)
                }
                img.onerror = (error) => reject(error)
            }
            reader.onerror = (error) => reject(error)
        })
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !user.isAuthenticated) {
            toast.error("Please fill in the required fields")
            return
        }

        setIsSubmitting(true)
        try {
            let finalizedImageUrl = imagePreview || ""

            if (imageFile) {
                // Compress and get Base64 string
                finalizedImageUrl = await compressImage(imageFile)
            }

            const postData = {
                title,
                description,
                image: finalizedImageUrl,
                calories: Number(calories) || 0,
                macros: {
                    protein: Number(protein) || 0,
                    carbs: Number(carbs) || 0,
                    fat: Number(fat) || 0
                },
                ingredients: postType === "recipe" ? ingredients : []
            }

            if (postToEdit) {
                await updatePost(postToEdit.id, postData)
                toast.success("Post Updated!", {
                    description: "Your changes have been saved."
                })
            } else {
                await createPost({
                    ...postData,
                    authorId: user.email || "guest",
                    authorName: user.name || "Guest User",
                    authorPhoto: user.photoURL || undefined
                })

                toast.success("Recipe Posted!", {
                    description: "Your recipe is now live on the feed."
                })
            }

            onPostCreated()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error(postToEdit ? "Failed to update post" : "Failed to post recipe", {
                description: error instanceof Error ? error.message : "Unknown error"
            })

        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {postToEdit ? "Edit Post" : (postType === "recipe" ? "Share Recipe" : "Create Post")}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-6">

                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setPostType("recipe")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${postType === "recipe" ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-slate-500"}`}
                        >
                            <UtensilsCrossed size={16} />
                            Recipe
                        </button>
                        <button
                            onClick={() => setPostType("photo")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${postType === "photo" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500"}`}
                        >
                            <Camera size={16} />
                            Photo
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {postType === "recipe" ? "Recipe Title" : "Title / Caption"}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="e.g. Healthy Chicken Salad"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {postType === "recipe" ? "Description / Instructions" : "Description (Optional)"}
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[100px]"
                                placeholder="How to make it..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {postType === "recipe" ? "Recipe Photo" : "Photo"}
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-slate-200 dark:border-slate-700 group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null)
                                            setImagePreview(null)
                                            if (fileInputRef.current) fileInputRef.current.value = ""
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="text-sm font-medium">Click to upload photo</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Macros - Conditional */}
                    {postType === "recipe" && (
                        <div>
                            <h4 className="font-medium text-slate-800 dark:text-gray-200 mb-3">Nutrition Facts (per serving)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Calories</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={calories}
                                            onChange={e => setCalories(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">kcal</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Protein</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={protein}
                                            onChange={e => setProtein(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Carbs</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={carbs}
                                            onChange={e => setCarbs(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Fat</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={fat}
                                            onChange={e => setFat(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ingredients - Conditional */}
                    {postType === "recipe" && (
                        <div>
                            <h4 className="font-medium text-slate-800 dark:text-gray-200 mb-3">Ingredients</h4>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={ingredientInput}
                                    onChange={e => setIngredientInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddIngredient()}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                    placeholder="Add ingredient..."
                                />
                                <button
                                    onClick={handleAddIngredient}
                                    className="p-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {ingredients.map((ing, i) => (
                                    <div key={i} className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm border border-orange-100 dark:border-orange-900/50">
                                        {ing}
                                        <button onClick={() => removeIngredient(i)} className="p-0.5 hover:bg-orange-200 dark:hover:bg-orange-800 rounded text-orange-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {ingredients.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No ingredients added yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <Button
                        fullWidth
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 size={20} className="animate-spin mr-2" />
                        ) : (
                            <Save size={20} className="mr-2" />
                        )}
                        {isSubmitting ? (postToEdit ? "Updating..." : "Posting...") : (postToEdit ? "Save Changes" : (postType === "recipe" ? "Share Recipe" : "Post"))}
                    </Button>
                </div>
            </div>
        </div>
    )
}
