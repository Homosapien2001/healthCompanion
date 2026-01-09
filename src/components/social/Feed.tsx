import { useEffect, useState } from "react"
import { type Post, fetchFeed } from "../../services/social"
import { useAppStore } from "../../store/useAppStore"
import { PostCard } from "./PostCard"
import { Loader2, RefreshCw, Sparkles, Search, X, LayoutGrid, UserCircle } from "lucide-react"
import { cn } from "../../lib/utils"

interface FeedProps {
    onEditPost?: (post: Post) => void
}

export function Feed({ onEditPost }: FeedProps) {
    const user = useAppStore(state => state.user)
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "mine">("all")

    const loadFeed = async (showLoading = true) => {
        if (showLoading) setIsLoading(true)
        setError(null)
        try {
            const data = await fetchFeed()
            setPosts(data)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Failed to load feed")
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    useEffect(() => {
        loadFeed()
    }, [])

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesFilter = filterType === "all" || post.authorId === user.email

        return matchesSearch && matchesFilter
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                    <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse"></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium">Loading feed...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="text-2xl">😕</span>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-3 font-semibold">{error}</p>
                <button
                    onClick={() => loadFeed()}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Feed Controls */}
            <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search recipes or ingredients..."
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 text-slate-900 dark:text-white transition-all border border-slate-100 dark:border-slate-800"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setFilterType("all")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                            filterType === "all"
                                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        <LayoutGrid size={16} />
                        All Feed
                    </button>
                    <button
                        onClick={() => setFilterType("mine")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                            filterType === "mine"
                                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        <UserCircle size={16} />
                        My Posts
                    </button>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center">
                        <Sparkles size={32} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-1">No posts found</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Be the first to share something!</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <Search size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {searchQuery ? `No results for "${searchQuery}"` : "None of your posts found"}
                    </p>
                    {(searchQuery || filterType !== "all") && (
                        <button
                            onClick={() => { setSearchQuery(""); setFilterType("all") }}
                            className="text-orange-500 font-bold text-sm mt-3 hover:underline"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={() => loadFeed(false)}
                            onEdit={onEditPost}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-center pt-8 pb-4">
                <button
                    onClick={() => loadFeed()}
                    className="flex items-center gap-2 px-6 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold hover:scale-105 active:scale-95 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                    <RefreshCw size={14} />
                    Refresh Feed
                </button>
            </div>
        </div>
    )
}
