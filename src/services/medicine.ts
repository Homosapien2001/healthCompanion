export interface Medicine {
    id: string
    name: string
    genericName: string
    description: string
    sideEffects: string[]
    dosage: string
    warnings: string[]
}

const MEDICINES: Medicine[] = [
    {
        id: '1',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        description: 'Common pain reliever and fever reducer.',
        sideEffects: ['Nausea', 'Liver damage (high doses)', 'Rash'],
        dosage: '500mg-1000mg every 4-6 hours',
        warnings: ['Do not exceed 4g per day', 'Avoid alcohol']
    },
    {
        id: '2',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        description: 'Penicillin antibiotic used to treat bacterial infections.',
        sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Yeast infection'],
        dosage: '250mg-500mg every 8 hours',
        warnings: ['Finish full course', 'May reduce pill effectiveness']
    },
    {
        id: '3',
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        description: 'NSAID used for pain, fever, and inflammation.',
        sideEffects: ['Stomach pain', 'Heartburn', 'Dizziness'],
        dosage: '200mg-400mg every 4-6 hours',
        warnings: ['Take with food', 'Avoid if you have ulcers']
    },
    {
        id: '4',
        name: 'Cetirizine',
        genericName: 'Cetirizine Hydrochloride',
        description: 'Antihistamine used to relieve allergy symptoms.',
        sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
        dosage: '10mg once daily',
        warnings: ['May cause drowsiness', 'Avoid alcohol']
    },
    {
        id: '5',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        description: 'First-line medication for type 2 diabetes.',
        sideEffects: ['Nausea', 'Stomach upset', 'Metallic taste'],
        dosage: '500mg-1000mg twice daily with meals',
        warnings: ['Take with food', 'Monitor kidney function']
    },
    {
        id: '6',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        description: 'Statin used to lower cholesterol and reduce heart risk.',
        sideEffects: ['Muscle pain', 'Digestive problems', 'Liver issues'],
        dosage: '10mg-80mg once daily',
        warnings: ['Report muscle pain', 'Avoid grapefruit']
    },
    {
        id: '7',
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        description: 'Proton pump inhibitor (PPI) for acid reflux/GERD.',
        sideEffects: ['Headache', 'Abdominal pain', 'Gas'],
        dosage: '20mg-40mg once daily before breakfast',
        warnings: ['Take on empty stomach', 'Long term use risks']
    },
    {
        id: '8',
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        description: 'Pain reliever, anti-inflammatory, and blood thinner.',
        sideEffects: ['Stomach bleeding', 'Nausea', 'Tinnitus'],
        dosage: '81mg (low dose) or 325mg for pain',
        warnings: ['Risk of bleeding', 'Not for children (Reyes syndrome)']
    }
]

export const searchMedicine = async (query: string): Promise<Medicine[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!query) return []

    const lowerQuery = query.toLowerCase()
    return MEDICINES.filter(med =>
        med.name.toLowerCase().includes(lowerQuery) ||
        med.genericName.toLowerCase().includes(lowerQuery)
    )
}
