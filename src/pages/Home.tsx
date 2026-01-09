
import { useState } from "react"
import { MotivationHeader } from "../components/home/MotivationHeader"
import { Feed } from "../components/social/Feed"
import { CreatePostModal } from "../components/social/CreatePostModal"
import { Plus, Sparkles } from "lucide-react"
import { useAppStore } from "../store/useAppStore"
import { toast } from "sonner"
import type { Post } from "../services/social"

export default function Home() {
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [postToEdit, setPostToEdit] = useState<Post | null>(null)
    const user = useAppStore(state => state.user)

    const handleCreateClick = () => {
        if (!user.isAuthenticated) {
            toast.error("Please login to post recipes")
            return
        }
        setShowCreatePost(true)
    }

    const handleEditPost = (post: Post) => {
        setPostToEdit(post)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -mx-6 -mt-2 px-6 pt-2 pb-20 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Motivation */}
                <MotivationHeader />

                {/* Feed Section */}
                <div>
                    <div className="flex justify-between items-center mb-6 px-1">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                Community Recipes
                            </h2>
                        </div>
                    </div>

                    <Feed onEditPost={handleEditPost} />
                </div>

                {/* Floating Action Button */}
                {!postToEdit && !showCreatePost && (
                    <button
                        onClick={handleCreateClick}
                        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white rounded-2xl shadow-2xl shadow-orange-500/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group backdrop-blur-sm"
                    >
                        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                    </button>
                )}

                {/* Create/Edit Post Modal */}
                {(showCreatePost || postToEdit) && (
                    <CreatePostModal
                        postToEdit={postToEdit || undefined}
                        onClose={() => {
                            setShowCreatePost(false)
                            setPostToEdit(null)
                        }}
                        onPostCreated={() => {
                            // Instead of generic reload, maybe we could just refresh the feed component 
                            // but window.location.reload() is what was there.
                            window.location.reload()
                        }}
                    />
                )}
            </div>
        </div>
    )
}
