import { useState } from "react"
import { type Post, toggleLikePost, deletePost } from "../../services/social"
import { useAppStore } from "../../store/useAppStore"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Heart, Bookmark, Loader2, Flame, Droplets, Wheat, Cookie, ChefHat, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { cn } from "../../lib/utils"

interface PostCardProps {
    post: Post
    onDelete?: () => void
    onEdit?: (post: Post) => void
}

export function PostCard({ post, onDelete, onEdit }: PostCardProps) {
    const user = useAppStore(state => state.user)
    const recipeBook = useAppStore(state => state.recipeBook)
    const addToRecipeBook = useAppStore(state => state.addToRecipeBook)
    const removeFromRecipeBook = useAppStore(state => state.removeFromRecipeBook)

    // Check if already saved
    const savedItem = recipeBook.find(item => item.originalPostId === post.id)
    const isSaved = !!savedItem

    const isOwner = user.email === post.authorId

    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user.email) || false)
    const [likeCount, setLikeCount] = useState(post.likes)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleSaveToggle = async () => {
        if (!user.isAuthenticated) {
            toast.error("Please login to save recipes")
            return
        }

        setIsSaving(true)
        try {
            if (isSaved) {
                // Unsave
                if (savedItem) {
                    await removeFromRecipeBook(savedItem.id)
                    toast.success("Removed", { description: "Removed from your saved items." })
                }
            } else {
                // Save
                await addToRecipeBook({
                    originalPostId: post.id,
                    name: post.title,
                    calories: post.calories,
                    protein: post.macros.protein,
                    carbs: post.macros.carbs,
                    fat: post.macros.fat,
                    source: "community"
                })
                toast.success("Saved!", {
                    description: `${post.title} has been saved.`
                })
            }
        } catch (error) {
            toast.error(isSaved ? "Failed to remove" : "Failed to save")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLikeToggle = async () => {
        if (!user.isAuthenticated) {
            toast.error("Please login to like posts")
            return
        }

        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikeCount((prev: number) => newIsLiked ? prev + 1 : prev - 1)

        try {
            await toggleLikePost(post.id, user.email, !newIsLiked)
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikeCount((prev: number) => !newIsLiked ? prev + 1 : prev - 1)
            toast.error("Failed to update like")
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return

        setIsDeleting(true)
        try {
            await deletePost(post.id)
            toast.success("Post deleted")
            onDelete?.()
        } catch (error) {
            toast.error("Failed to delete post")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="group relative">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

            <Card className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/30 ring-2 ring-white dark:ring-slate-800">
                            {post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <ChefHat size={10} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-white">{post.authorName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                            {post.ingredients && post.ingredients.length > 0 ? "Shared a delicious recipe" : "Shared a post"}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-1 shadow-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 p-1">
                            <button
                                onClick={() => onEdit?.(post)}
                                className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                title="Edit Post"
                            >
                                <Pencil size={18} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Delete Post"
                            >
                                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Content (Ordered Above Image) */}
                <div className="px-6 pb-4 pt-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3 leading-tight">
                        {post.title}
                    </h3>
                    {post.description && (
                        <div className="relative">
                            <p className={cn(
                                "text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-all duration-300 whitespace-pre-wrap",
                                !isExpanded && "line-clamp-2"
                            )}>
                                {post.description}
                            </p>
                            {post.description.length > 80 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-orange-500 hover:text-orange-600 font-bold text-xs mt-1.5 transition-colors flex items-center gap-1"
                                >
                                    {isExpanded ? "Show Less" : "Read More..."}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Image (if any) */}
                {post.image && (
                    <div className="relative w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden mb-5">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                )}

                {/* Recipe Details (Bottom) */}
                <div className="px-6 pb-5">
                    {/* Macros Grid - Only show if calories > 0 */}
                    {post.calories > 0 && (
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            <div className="relative group/macro">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl opacity-10 group-hover/macro:opacity-20 transition-opacity"></div>
                                <div className="relative text-center p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-orange-200/50 dark:border-orange-800/30 hover:scale-105 transition-transform shadow-sm">
                                    <Flame size={20} className="mx-auto text-orange-600 dark:text-orange-400 mb-2" strokeWidth={2.5} />
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{post.calories}</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Cal</div>
                                </div>
                            </div>
                            <div className="relative group/macro">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-10 group-hover/macro:opacity-20 transition-opacity"></div>
                                <div className="relative text-center p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 hover:scale-105 transition-transform shadow-sm">
                                    <Droplets size={20} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" strokeWidth={2.5} />
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{post.macros.protein}g</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Prot</div>
                                </div>
                            </div>
                            <div className="relative group/macro">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl opacity-10 group-hover/macro:opacity-20 transition-opacity"></div>
                                <div className="relative text-center p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-green-200/50 dark:border-green-800/30 hover:scale-105 transition-transform shadow-sm">
                                    <Wheat size={20} className="mx-auto text-green-600 dark:text-green-400 mb-2" strokeWidth={2.5} />
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{post.macros.carbs}g</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Carbs</div>
                                </div>
                            </div>
                            <div className="relative group/macro">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl opacity-10 group-hover/macro:opacity-20 transition-opacity"></div>
                                <div className="relative text-center p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/30 hover:scale-105 transition-transform shadow-sm">
                                    <Cookie size={20} className="mx-auto text-yellow-600 dark:text-yellow-400 mb-2" strokeWidth={2.5} />
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{post.macros.fat}g</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Fat</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ingredients Preview */}
                    {post.ingredients && post.ingredients.length > 0 && (
                        <div className="mb-6">
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"></div>
                                Ingredients
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {post.ingredients.slice(0, 4).map((ing, i) => (
                                    <span key={i} className="text-xs px-3.5 py-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-shadow">
                                        {ing}
                                    </span>
                                ))}
                                {post.ingredients.length > 4 && (
                                    <span className="text-xs px-3.5 py-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl text-orange-700 dark:text-orange-400 font-bold border border-orange-200/50 dark:border-orange-700/50 shadow-sm">
                                        +{post.ingredients.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleLikeToggle}
                            className={cn(
                                "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm",
                                isLiked
                                    ? "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-red-500/20"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            )}
                        >
                            <Heart size={18} className={cn(isLiked && "fill-current")} strokeWidth={2.5} />
                            <span>{likeCount}</span>
                        </button>

                        <div className="flex-1" />

                        <Button
                            variant={isSaved ? "outline" : "primary"}
                            size="sm"
                            onClick={handleSaveToggle}
                            disabled={isSaving}
                            className={cn(
                                "rounded-2xl px-6 py-2.5 font-bold transition-all hover:scale-105 active:scale-95 shadow-lg",
                                isSaved
                                    ? "bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:text-green-400 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 shadow-green-500/20"
                                    : "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white border-none shadow-orange-500/40"
                            )}
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <Bookmark size={16} className={cn("mr-2", isSaved && "fill-current")} strokeWidth={2.5} />
                                    {isSaved ? "Saved" : "Save"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
