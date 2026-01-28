/**
 * Profile Service
 * Manages user profiles
 * 
 * Future API endpoint: GET /api/profile/:userId
 */

const PROFILE_STORAGE_KEY = 'carecova_profiles'

const getProfiles = () => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading profiles from localStorage:', error)
    return []
  }
}

const saveProfiles = (profiles) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles))
  } catch (error) {
    console.error('Error saving profiles to localStorage:', error)
  }
}

export const profileService = {
  /**
   * Get or create profile for a user
   * @param {string} userId - User identifier (phone or email)
   * @returns {Promise<Object>} User profile
   */
  getProfile: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profiles = getProfiles()
        let profile = profiles.find((p) => p.id === userId)

        if (!profile) {
          // Create new profile from loan data if available
          const loans = JSON.parse(localStorage.getItem('carecova_loans') || '[]')
          const userLoan = loans.find(
            (l) => l.phone === userId || l.email === userId
          )

          profile = {
            id: userId,
            phone: userLoan?.phone || (userId.includes('@') ? '' : userId),
            email: userLoan?.email || (userId.includes('@') ? userId : ''),
            employmentType: '',
            documents: [],
            loanHistory: [],
            preferences: {},
            createdAt: new Date().toISOString(),
          }

          profiles.push(profile)
          saveProfiles(profiles)
        }

        resolve(profile)
      }, 300)
    })
  },

  /**
   * Update profile
   * @param {string} userId - User identifier
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (userId, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profiles = getProfiles()
        const profileIndex = profiles.findIndex((p) => p.id === userId)

        if (profileIndex !== -1) {
          profiles[profileIndex] = {
            ...profiles[profileIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          saveProfiles(profiles)
          resolve(profiles[profileIndex])
        } else {
          resolve(null)
        }
      }, 300)
    })
  },
}
