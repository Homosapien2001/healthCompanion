import { type UserProfile } from "../store/useAppStore"

export function calculateBMR(user: UserProfile): number {
    // Mifflin-St Jeor Equation
    // Men: 10W + 6.25H - 5A + 5
    // Women: 10W + 6.25H - 5A - 161
    const s = user.gender === 'male' ? 5 : -161
    return (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + s
}

export function calculateTDEE(user: UserProfile): number {
    const bmr = calculateBMR(user)

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        athlete: 1.9
    }

    // Default to moderate if not set
    const multiplier = activityMultipliers[user.activityLevel || 'moderate']
    return Math.round(bmr * multiplier)
}
