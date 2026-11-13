import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ApiError, createGuitar } from "../services/guitarService"
import "./GuitarForm.css"


const IMAGES = Array.from({ length: 12 }, (_, i) => `guitarra_${String(i + 1).padStart(2, '0')}`)

type FormValues = {
    name: string
    image: string
    description: string
    price: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const emptyForm: FormValues = { name: '', image: '', description: '', price: '' }

function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {}

    if (!values.name.trim()) {
        errors.name = 'El nombre es obligatorio'
    } else if (values.name.trim().length > 100) {
        errors.name = 'El nombre no puede pasar de 100 caracteres'
    }

    if (!values.image) {
        errors.image = 'Selecciona una imagen'
    }

    if (!values.description.trim()) {
        errors.description = 'La descripción es obligatoria'
    }

    if (values.price.trim() === '') {
        errors.price = 'El precio es obligatorio'
    } else {
        const price = Number(values.price)
        if (Number.isNaN(price)) {
            errors.price = 'El precio debe ser un número'
        } else if (price <= 0) {
            errors.price = 'El precio debe ser mayor que 0'
        }
    }

    return errors
}

type GuitarFormProps = {
    onCreated: () => void
}

export default function GuitarForm({ onCreated }: GuitarFormProps) {
    const [values, setValues] = useState<FormValues>(emptyForm)
    const [errors, setErrors] = useState<FormErrors>({})
    const [serverErrors, setServerErrors] = useState<string[]>([])
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
        setErrors({ ...errors, [name]: undefined })
        setSuccess(false)
        setServerErrors([])
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSuccess(false)
        setServerErrors([])

        // Validación en el cliente antes de llamar a la API
        const newErrors = validate(values)
        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        setSubmitting(true)
        try {
            await createGuitar({
                name: values.name.trim(),
                image: values.image,
                description: values.description.trim(),
                price: Number(values.price)
            })
            setValues(emptyForm)
            setSuccess(true)
            onCreated() // recarga el catálogo
        } catch (error) {
            if (error instanceof ApiError) {
                setServerErrors(error.errors)
            } else {
                setServerErrors(['No se pudo conectar con el servidor'])
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form className="guitar-form" onSubmit={handleSubmit} noValidate>
            {success && (
                <div className="alert alert-success">Guitarra registrada correctamente</div>
            )}
            {serverErrors.length > 0 && (
                <div className="alert alert-danger">
                    <ul className="mb-0">
                        {serverErrors.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold">Nombre</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={values.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="image" className="form-label fw-bold">Imagen</label>
                <select
                    id="image"
                    name="image"
                    className={`form-select ${errors.image ? 'is-invalid' : ''}`}
                    value={values.image}
                    onChange={handleChange}
                >
                    <option value="">-- Selecciona --</option>
                    {IMAGES.map((image) => (
                        <option key={image} value={image}>{image}</option>
                    ))}
                </select>
                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                {values.image && (
                    <img
                        className="img-fluid mt-2"
                        style={{ maxHeight: 120 }}
                        src={`/img/${values.image}.jpg`}
                        alt="vista previa"
                    />
                )}
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label fw-bold">Descripción</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    value={values.description}
                    onChange={handleChange}
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="price" className="form-label fw-bold">Precio</label>
                <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    value={values.price}
                    onChange={handleChange}
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>

            <button type="submit" className="btn btn-dark w-100" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Registrar guitarra'}
            </button>
        </form>
    )
}
