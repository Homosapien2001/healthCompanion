// Splash screen showing the logo

export default function Splash() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-50">
            {/* Animated Background */}
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-400 to-orange-500 animate-gradient-xy"></div>

            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[60%] w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-2 rounded-3xl animate-bounce-slight w-32 h-32 flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Health Companion Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="mt-8 text-3xl font-extrabold text-white tracking-tight animate-fade-in drop-shadow-sm">
                    Health Companion
                </h1>
                <p className="mt-3 text-orange-50 font-medium text-lg animate-fade-in-up">
                    Your Daily Health Tracker
                </p>
            </div>
        </div>
    );
}
