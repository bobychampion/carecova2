const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzfybnlw3'
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET ||
  'Carecova'

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`

export async function uploadFileToCloudinary(file, options = {}) {
  if (!file) {
    throw new Error('No file selected')
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary upload preset is missing. Set VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  if (options.folder) {
    formData.append('folder', options.folder)
  }

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  const body = await response.json()
  if (!response.ok) {
    const message = body?.error?.message || 'Cloudinary upload failed'
    throw new Error(message)
  }

  return {
    url: body.secure_url,
    storageKey: body.public_id,
    fileName: file.name,
    fileSize: body.bytes ?? file.size,
    mimeType: file.type || undefined,
  }
}
