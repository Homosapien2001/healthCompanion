import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

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

    useEffect(() => {
        const checkReminders = () => {
            if (Notification.permission !== "granted") return;

            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;

            reminders.forEach(reminder => {
                if (!reminder.enabled) return;

                const [rHours, rMinutes] = reminder.time.split(':').map(Number);
                const reminderTimeInMinutes = rHours * 60 + rMinutes;

                // 15 Minutes before
                const notifyTimeInMinutes = reminderTimeInMinutes - 15;

                // Normalize for day wrap around (e.g. 00:10 -> -5 -> 23:55) - simpler to mostly ignore for now unless needed

                if (Math.abs(currentTimeInMinutes - notifyTimeInMinutes) < 1) {
                    new Notification(`Upcoming Medicine: ${reminder.medicineName}`, {
                        body: `Take in 15 mins (at ${reminder.time}). ${reminder.notes || ''}`,
                        icon: '/pwa-192x192.png',
                        tag: `med-pre-${reminder.id}-${new Date().getDate()}`
                    });
                }

                // Notify AT the time
                if (Math.abs(currentTimeInMinutes - reminderTimeInMinutes) < 1) {
                    new Notification(`TIME TO TAKE: ${reminder.medicineName}`, {
                        body: `It is ${reminder.time}. ${reminder.notes || ''}`,
                        icon: '/pwa-192x192.png',
                        tag: `med-now-${reminder.id}-${new Date().getDate()}`
                    });
                }
            });
        }

        const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [reminders]);

    return null; // Headless component
}
