// Comunicación con la API (guitarsla-api)
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
    errors: string[]

    constructor(errors: string[]) {
        super(errors.join(', '))
        this.errors = errors
    }
}

// La API devuelve errores como [{ msg: "..." }] (express-validator)
function getMessages(json: { errors?: Array<string | { msg: string }> }, fallback: string): string[] {
    if (!Array.isArray(json.errors) || json.errors.length === 0) return [fallback]
    return json.errors.map((e) => (typeof e === 'string' ? e : e.msg))
}

// GET /api/guitars
export async function getGuitars(): Promise<Guitar[]> {
    const response = await fetch(`${API_URL}/guitars`)
    if (!response.ok) {
        throw new ApiError(['No se pudo cargar el catálogo'])
    }
    const json = await response.json()
    return json.data
}

// POST /api/guitars
export async function createGuitar(guitar: GuitarInput): Promise<Guitar> {
    const response = await fetch(`${API_URL}/guitars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guitar)
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new ApiError(getMessages(json, 'No se pudo guardar la guitarra'))
    }
    return json.data
}
