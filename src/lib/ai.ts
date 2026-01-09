import { useAppStore, type MealEntry } from "../store/useAppStore"

// We'll use the Gemini 1.5 Flash API via REST to avoid package installation issues
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

const sanitizeJSON = (text: string) => {
    return text.replace(/```json|```/g, "").trim();
};

export async function analyzeImage(file: File): Promise<Omit<MealEntry, 'id' | 'timestamp' | 'mealType'>> {
    const state = useAppStore.getState();
    const hardcodedKey = "AIzaSyDlFRtoObY9hxqQvI5tcTWi9nwOr7ly5MU";
    const apiKey = hardcodedKey || localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || state.sharedApiKey;

    if (!apiKey) {
        console.warn("No Gemini API key found (Personal or Shared). Falling back to mock data.");
        return getMockResult(file.name);
    }

    try {
        const base64Image = await fileToBase64(file);

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify the food in this image and estimate its nutritional values. Return ONLY a JSON object with this exact structure: {\"name\": \"food name\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}. Use grams for macros. If there are multiple items, estimate the total." },
                        {
                            inline_data: {
                                mime_type: file.type,
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            console.error("Gemini API Error Raw:", errorText);
            let errorMsg = `API error: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMsg = errorData.error?.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        const result = await response.json();

        if (!result.candidates || result.candidates.length === 0) {
            throw new Error("Gemini returned no results. The image might be unclear or unsupported.");
        }

        const content = result.candidates[0].content.parts[0].text;
        const data = JSON.parse(sanitizeJSON(content));

        return {
            name: data.name || "Unknown Food",
            calories: Math.round(data.calories || 0),
            protein: Math.round(data.protein || 0),
            carbs: Math.round(data.carbs || 0),
            fat: Math.round(data.fat || 0)
        };

    } catch (error: any) {
        console.error("Gemini Scan failed:", error);
        // If it's a JSON parse error or specifically an API error, we should probably tell the user
        throw error;
    }
}

// Fallback Mock Logic (Original logic preserved as fallback)
function getMockResult(filename: string) {
    const FOOD_DATABASE = [
        { keywords: ['avocado', 'toast', 'bread'], data: { name: "Avocado Toast", calories: 350, protein: 12, carbs: 45, fat: 18 } },
        { keywords: ['salad', 'chicken', 'greens', 'lettuce'], data: { name: "Grilled Chicken Salad", calories: 420, protein: 45, carbs: 12, fat: 20 } },
        { keywords: ['oat', 'porridge', 'berry', 'berries'], data: { name: "Oatmeal with Berries", calories: 280, protein: 8, carbs: 54, fat: 6 } },
        { keywords: ['burger', 'beef', 'cheeseburger', 'bun'], data: { name: "Double Cheeseburger", calories: 850, protein: 50, carbs: 40, fat: 55 } },
        { keywords: ['salmon', 'fish', 'rice', 'sushi'], data: { name: "Salmon and Rice", calories: 550, protein: 40, carbs: 60, fat: 15 } },
    ];

    const match = FOOD_DATABASE.find(item =>
        item.keywords.some(keyword => filename.toLowerCase().includes(keyword))
    );

    return match ? match.data : {
        name: "Identified Food",
        calories: 300,
        protein: 15,
        carbs: 35,
        fat: 10
    };
}

export async function getAIHealthInsights(weeklyData: any[], userProfile: any): Promise<string> {
    const state = useAppStore.getState();
    const hardcodedKey = "AIzaSyDlFRtoObY9hxqQvI5tcTWi9nwOr7ly5MU";
    const apiKey = hardcodedKey || localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || state.sharedApiKey;
    if (!apiKey) return "Log your meals daily to unlock personalized AI health insights and coaching.";

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as a professional nutritionist. Analyze this user's weekly health data:
                        Weekly Data: ${JSON.stringify(weeklyData)}
                        User Goal: ${userProfile.goal}
                        Keep the advice concise, encouraging, and highly actionable (max 3 short sentences). Focus on calories and macros.`
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error("API call failed");
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
    } catch (e) {
        return "You're consistently tracking your progress—that's the first step to success! Keep it up.";
    }
}

export async function generateMealPlan(userProfile: any): Promise<Omit<MealEntry, 'id' | 'timestamp'>[]> {
    const state = useAppStore.getState();
    const hardcodedKey = "AIzaSyDlFRtoObY9hxqQvI5tcTWi9nwOr7ly5MU";
    const apiKey = hardcodedKey || localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || state.sharedApiKey;
    if (!apiKey) throw new Error("Feature unavailable");

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as a professional meal planner. Generate a daily meal plan for a user with these stats:
                        Goal: ${userProfile.goal}, Height: ${userProfile.height}cm, Weight: ${userProfile.weight}kg, Age: ${userProfile.age}.
                        Return ONLY a JSON array of 4 meal objects (breakfast, lunch, dinner, snack).
                        Structure: [{"mealType": "breakfast"|"lunch"|"dinner"|"snack", "name": "meal name", "calories": number, "protein": number, "carbs": number, "fat": number}]`
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error("Meal planning generation failed");
        const result = await response.json();
        const content = result.candidates[0].content.parts[0].text;
        return JSON.parse(sanitizeJSON(content));
    } catch (e) {
        console.error("Meal planning failed:", e);
        throw e;
    }
}
