export interface Medicine {
    id: string
    name: string
    genericName: string
    description: string
    sideEffects: string[]
    dosage: string
    warnings: string[]
}

// OpenFDA Response Types (Subset)
interface OpenFDAResponse {
    results: Array<{
        openfda: {
            brand_name?: string[]
            generic_name?: string[]
            product_ndc?: string[]
        }
        description?: string[]
        indications_and_usage?: string[]
        dosage_and_administration?: string[]
        warnings?: string[]
        adverse_reactions?: string[]
    }>
}

// Helper to safely extract string from array or string
const getString = (val: string[] | string | undefined): string => {
    if (!val) return ''
    if (Array.isArray(val)) return val[0]
    return val
}

export const searchMedicine = async (query: string): Promise<Medicine[]> => {
    if (!query) return []

    try {
        const trimmed = query.trim()
        if (!trimmed) return []

        // Create search query: Brand Name OR Generic Name
        // OpenFDA: Space matches OR.
        // If single word, use wildcard * for partial match (autocomplete feel).
        // If multiple words, use quotes for phrase match.
        const isSingleWord = !trimmed.includes(' ')
        const encoded = encodeURIComponent(trimmed)
        const term = isSingleWord ? `${encoded}*` : `"${encoded}"`

        const searchQuery = `openfda.brand_name:${term} openfda.generic_name:${term}`

        const response = await fetch(`https://api.fda.gov/drug/label.json?search=${searchQuery}&limit=20`)

        if (!response.ok) {
            if (response.status === 404) return [] // No results found
            throw new Error('API request failed')
        }

        const data: OpenFDAResponse = await response.json()

        return data.results.map(item => {
            const openfda = item.openfda || {}

            // Prefer Description, fallback to Indications
            const descriptionRaw = getString(item.description || item.indications_and_usage)
            // Clean up description (often contains HTML or long headers)
            const description = descriptionRaw.substring(0, 300) + (descriptionRaw.length > 300 ? '...' : '')

            const sideEffectsRaw = getString(item.adverse_reactions)
            // split by periods or newlines to make a list, verify length
            const sideEffects = sideEffectsRaw
                ? sideEffectsRaw.split('. ').slice(0, 5).map(s => s.trim()).filter(s => s.length > 0)
                : []

            const warningsRaw = getString(item.warnings)
            const warnings = warningsRaw
                ? warningsRaw.split('. ').slice(0, 5).map(s => s.trim()).filter(s => s.length > 0)
                : []

            return {
                id: getString(openfda.product_ndc) || Math.random().toString(36).substring(7),
                name: getString(openfda.brand_name) || query,
                genericName: getString(openfda.generic_name),
                description: description || 'No description available.',
                sideEffects: sideEffects.length > 0 ? sideEffects : ['Consult your doctor for side effects.'],
                dosage: getString(item.dosage_and_administration).substring(0, 200) + '...',
                warnings: warnings.length > 0 ? warnings : ['Consult your doctor.']
            }
        })

    } catch (error) {
        console.error("OpenFDA Search Error:", error)
        return []
    }
}
