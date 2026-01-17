import { Outlet, useLocation, Navigate } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { useAppStore } from "../store/useAppStore"
import MedicineMode from "../pages/MedicineMode"
import NotificationManager from "./NotificationManager" // Import this!

import { Toaster } from 'sonner'

export default function Layout() {
    const location = useLocation();
    const user = useAppStore((state) => state.user);
    const medicineMode = useAppStore((state) => state.medicineMode);

    // Auth Check
    if (!user.isAuthenticated && location.pathname !== "/auth") {
        return <Navigate to="/auth" replace />;
    }

    if (medicineMode) {
        return (
            <>
                <NotificationManager />
                <MedicineMode />
                <Toaster
                    position="top-center"
                    richColors
                    toastOptions={{
                        classNames: {
                            toast: 'rounded-2xl border-none shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md font-medium text-slate-900 dark:text-slate-100',
                            title: 'text-base',
                            description: 'text-slate-500 dark:text-slate-400',
                            actionButton: 'bg-blue-500',
                            cancelButton: 'bg-slate-200 dark:bg-slate-800',
                        },
                        style: {
                            borderRadius: '16px',
                            padding: '16px',
                        }
                    }}
                />
            </>
        )
    }

    const isSplash = location.pathname === '/splash';
    const isAuth = location.pathname === '/auth';

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-[90px] transition-colors duration-300">
            <NotificationManager />
            <div className="flex-1 w-full max-w-md mx-auto">
                <Outlet />
            </div>
            {!isSplash && !isAuth && <BottomNav />}
            <Toaster
                position="top-center"
                richColors
                toastOptions={{
                    classNames: {
                        toast: 'rounded-2xl border-none shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md font-medium text-slate-900 dark:text-slate-100',
                        title: 'text-base',
                        description: 'text-slate-500 dark:text-slate-400',
                        actionButton: 'bg-blue-500',
                        cancelButton: 'bg-slate-200 dark:bg-slate-800',
                    },
                    style: {
                        borderRadius: '16px',
                        padding: '16px',
                    }
                }}
            />
        </div>
    )
}
