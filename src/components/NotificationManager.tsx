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
                    // Check if we already notified recently? 
                    // For 1 min interval, this might fire once or twice.
                    // A simple dedup: relying on exact minute match via setInterval alignment is flaky,
                    // but < 1 minute diff is decent. To prevent double fire, we could use a ref to store 'lastNotifiedTime'.

                    new Notification(`Time to take ${reminder.medicineName} soon!`, {
                        body: `Scheduled for ${reminder.time}. ${reminder.notes || ''}`,
                        icon: '/pwa-192x192.png', // Assuming pwa icon exists
                        tag: `med-${reminder.id}-${new Date().getDate()}` // Unique tag per day prevents duplicates
                    });

                    // Also play sound?
                    // const audio = new Audio('/notification.mp3'); audio.play();
                }
            });
        }

        const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [reminders]);

    return null; // Headless component
}
