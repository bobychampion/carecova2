import { hospitals } from '../data/hospitals'

export const hospitalService = {
  getAllHospitals: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(hospitals)
      }, 300)
    })
  },

  getHospitalById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const hospital = hospitals.find((h) => h.id === id)
        if (hospital) {
          resolve(hospital)
        } else {
          reject(new Error('Hospital not found'))
        }
      }, 300)
    })
  },

  searchHospitals: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase()
        const filtered = hospitals.filter(
          (h) =>
            h.name.toLowerCase().includes(lowerQuery) ||
            h.location.toLowerCase().includes(lowerQuery) ||
            h.specialties.some((s) => s.toLowerCase().includes(lowerQuery))
        )
        resolve(filtered)
      }, 300)
    })
  },
}
