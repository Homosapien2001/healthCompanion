import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { toast } from 'sonner' // Import toast

export default function NotificationManager() {
    const reminders = useAppStore(state => state.reminders)

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const notifiedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const checkReminders = () => {
            // Debug visual: Check if we enter the loop.
            // We allow checking even if permission not granted yet, so debugging works via toast/console.

            const hasPermission = Notification.permission === "granted";

            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;
            const dateKey = now.getDate(); // Simple day key

            reminders.forEach(reminder => {
                if (!reminder.enabled) return;

                const [rHours, rMinutes] = reminder.time.split(':').map(Number);
                const reminderTimeInMinutes = rHours * 60 + rMinutes;

                const diffMinutes = reminderTimeInMinutes - currentTimeInMinutes;

                // Logic for "Upcoming" (15 mins before to 1 min before)
                if (diffMinutes > 0 && diffMinutes <= 15) {
                    const tag = `med-pre-${reminder.id}-${dateKey}`;
                    if (!notifiedRef.current.has(tag)) {
                        console.log("Triggering Upcoming Notif:", reminder.medicineName, diffMinutes);

                        if (hasPermission) {
                            new Notification(`Upcoming Medicine: ${reminder.medicineName}`, {
                                body: `Take in ${diffMinutes} mins (at ${reminder.time}). ${reminder.notes || ''}`,
                                icon: '/pwa-192x192.png',
                                tag: tag
                            });
                        }

                        // ALWAYS show toast as fallback
                        toast.info(`Upcoming: ${reminder.medicineName}`, {
                            description: `Take in ${diffMinutes} mins (at ${reminder.time})`
                        });

                        notifiedRef.current.add(tag);
                    }
                }

                // Logic for "Now" (0 mins to -5 mins, catch up if just missed)
                if (diffMinutes <= 0 && diffMinutes >= -5) {
                    const tag = `med-now-${reminder.id}-${dateKey}`;
                    if (!notifiedRef.current.has(tag)) {
                        console.log("Triggering NOW Notif:", reminder.medicineName, diffMinutes);

                        if (hasPermission) {
                            new Notification(`TIME TO TAKE: ${reminder.medicineName}`, {
                                body: `It is ${reminder.time}. ${reminder.notes || ''}`,
                                icon: '/pwa-192x192.png',
                                tag: tag
                            });
                        }

                        // ALWAYS show toast
                        toast.success(`TIME TO TAKE: ${reminder.medicineName}`, {
                            description: `It is time! (${reminder.notes || ''})`,
                            duration: 10000
                        });

                        notifiedRef.current.add(tag);
                    }
                }
            });
        }

        const intervalId = setInterval(checkReminders, 10 * 1000); // Check every 10 seconds
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [reminders]);

    return null; // Headless component
}
