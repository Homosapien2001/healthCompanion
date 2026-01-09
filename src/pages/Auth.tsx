import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Eye, EyeOff, ArrowRight, Activity, Calendar, User as UserIcon } from "lucide-react";

import { toast } from "sonner";
import { auth } from "../lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { useAppStore, type UserProfile } from "../store/useAppStore";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [signupStep, setSignupStep] = useState(1); // 1 = Auth, 2 = Profile
    const [showPassword, setShowPassword] = useState(false);

    // Auth State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // Profile State
    const [gender, setGender] = useState<UserProfile['gender']>('male');
    const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
    const [age, setAge] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [goal, setGoal] = useState<UserProfile['goal']>('maintain');

    const navigate = useNavigate();
    const setUser = useAppStore(state => state.setUser);

    // Motivational Quotes
    const quotes = [
        "Health is the greatest wealth. 🏃‍♂️",
        "Small steps every day. 🌱",
        "Invest in yourself. ✨",
        "Your body hears everything your mind says. 🧠",
        "Eat better, not less. 🍎",
        "Progress, not perfection. 🚀"
    ];
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const login = async () => {
        if (!email || !password) {
            toast.error("Missing Info", {
                description: "Please enter both email and password 🥺"
            });
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setUser({ isAuthenticated: true, email: email });
            toast.success("Welcome back! 👋", {
                description: "It's great to see you again!",
                duration: 2000,
            });
            navigate("/");
        } catch (error: any) {
            console.error("Login error:", error);
            let message = "Something went wrong during login.";
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                message = "Invalid email or password. Please try again.";
            }
            toast.error("Oops!", {
                description: message
            });
        }
    };

    const signup = async () => {
        if (!fullName || !email || !password) {
            toast.error("Hold up!", {
                description: "We need all your details to get started ✨"
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            // Advance to profile step instead of navigating immediately
            setSignupStep(2);
            toast.success("Account Created! 🎉", {
                description: "Now let's set up your profile for better tracking."
            });

        } catch (error: any) {
            console.error("Signup error:", error);
            let message = "Something went wrong during signup.";
            if (error.code === "auth/email-already-in-use") {
                message = "This email is already registered.";
            } else if (error.code === "auth/weak-password") {
                message = "Password should be at least 6 characters.";
            }
            toast.error("Signup Failed", {
                description: message
            });
        }
    };

    const handleProfileComplete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!age || !height || !weight) {
            toast.error("Missing Details", {
                description: "Please fill in all fields so we can personalize your plan."
            });
            return;
        }

        const profile: Partial<UserProfile> = {
            isAuthenticated: true,
            email: email,
            name: fullName,
            age: Number(age),
            height: Number(height),
            weight: Number(weight),
            gender: gender,
            activityLevel: activityLevel,
            goal: goal,
            onboardingCompleted: true
        };

        // Save complete profile to store and Firestore (via setUser sync)
        try {
            await setUser(profile);
            toast.success("You're all set! 🚀", {
                description: "Welcome to your new health journey!"
            });
            navigate("/");
        } catch (error) {
            console.error("Profile save error:", error);
            toast.error("Cloud Sync Error", {
                description: "Account created but couldn't sync profile to cloud. We'll try again later."
            });
            navigate("/"); // Continue anyway
        }
    };

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            login();
        } else {
            signup();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-slate-50">
            {/* Animated Background (Matching Splash) */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-400 to-orange-500 animate-gradient-xy"></div>

            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 flex items-center justify-center mb-6 animate-bounce-slight overflow-hidden">
                        <img src="/logo.png" alt="Health Companion Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                        {isLogin ? "Welcome Back" : signupStep === 1 ? "Create Account" : "Tell Us About You"}
                    </h2>
                    <p className="mt-2 text-orange-50 font-medium">
                        {isLogin
                            ? "Enter your details to access your account"
                            : signupStep === 1
                                ? "Start your journey to better health today"
                                : "Help us personalize your health plan"
                        }
                    </p>

                    {/* Rotating Quote */}
                    <div className="mt-6 h-8 flex items-center justify-center overflow-hidden">
                        <p key={currentQuote} className="text-white/90 text-sm font-medium italic animate-fade-in-up">
                            "{quotes[currentQuote]}"
                        </p>
                    </div>
                </div>

                <Card className="p-6 md:p-8 shadow-2xl border-white/40 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl">
                    {/* Toggle - Only show on Step 1 */}
                    {signupStep === 1 && (
                        <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-8 relative">
                            <div
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${isLogin ? "left-1" : "left-[calc(50%)]"
                                    }`}
                            />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 ${isLogin ? "text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                                    }`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 ${!isLogin ? "text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {signupStep === 1 ? (
                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex justify-end">
                                    <Link
                                        to="#"
                                        className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-4 text-base font-bold shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 border-none"
                                fullWidth
                            >
                                {isLogin ? "Log In" : "Create Account"}
                            </Button>
                        </form>
                    ) : (
                        // Step 2: Profile Setup
                        <form onSubmit={handleProfileComplete} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Age
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="25"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Gender
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value as any)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium appearance-none text-slate-900 dark:text-white"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="175"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="70"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                    Activity Level
                                </label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                    <select
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value as any)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium appearance-none text-slate-900 dark:text-white"
                                    >
                                        <option value="sedentary">Sedentary (Little to no exercise)</option>
                                        <option value="light">Light (Exercise 1-3 times/week)</option>
                                        <option value="moderate">Moderate (Exercise 3-5 times/week)</option>
                                        <option value="active">Active (Daily exercise)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                    Goal
                                </label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium appearance-none text-slate-900 dark:text-white"
                                >
                                    <option value="lose">Lose Weight</option>
                                    <option value="maintain">Maintain Weight</option>
                                    <option value="gain">Gain Muscle</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-4 text-base font-bold shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 border-none flex items-center justify-center gap-2"
                                fullWidth
                            >
                                Complete Profile <ArrowRight size={18} />
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
