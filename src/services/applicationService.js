const DRAFT_STORAGE_KEY = 'carecova_drafts'
const DRAFT_EXPIRY_DAYS = 30

const generateDraftId = () => {
  return `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const getDrafts = () => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading drafts from localStorage:', error)
    return []
  }
}

const saveDrafts = (drafts) => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.error('Error saving drafts to localStorage:', error)
  }
}

const isDraftExpired = (draft) => {
  if (!draft.expiresAt) return false
  return new Date(draft.expiresAt) < new Date()
}

export const applicationService = {
  /**
   * Save a draft application
   * @param {Object} draftData - The draft application data
   * @param {string} draftData.userId - User identifier (phone or email)
   * @param {number} draftData.step - Current step number
   * @param {Object} draftData.data - Form data
   * @returns {Promise<Object>} Saved draft object
   */
  saveDraft: async (draftData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = getDrafts()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + DRAFT_EXPIRY_DAYS)

        const draft = {
          id: draftData.id || generateDraftId(),
          userId: draftData.userId,
          step: draftData.step,
          data: draftData.data,
          savedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        }

        // Remove existing draft with same ID or same userId and step
        const filteredDrafts = drafts.filter(
          (d) => d.id !== draft.id && !(d.userId === draft.userId && d.step === draft.step)
        )

        filteredDrafts.push(draft)
        saveDrafts(filteredDrafts)

        resolve(draft)
      }, 100)
    })
  },

  /**
   * Get all drafts for a user
   * @param {string} userId - User identifier (phone or email)
   * @returns {Promise<Array>} Array of draft objects
   */
  getDrafts: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = getDrafts()
        const userDrafts = drafts
          .filter((d) => d.userId === userId && !isDraftExpired(d))
          .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))

        resolve(userDrafts)
      }, 100)
    })
  },

  /**
   * Get a specific draft by ID
   * @param {string} draftId - Draft ID
   * @returns {Promise<Object|null>} Draft object or null if not found
   */
  getDraft: async (draftId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = getDrafts()
        const draft = drafts.find((d) => d.id === draftId && !isDraftExpired(d))
        resolve(draft || null)
      }, 100)
    })
  },

  /**
   * Delete a draft
   * @param {string} draftId - Draft ID
   * @returns {Promise<void>}
   */
  deleteDraft: async (draftId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts = getDrafts()
        const filteredDrafts = drafts.filter((d) => d.id !== draftId)
        saveDrafts(filteredDrafts)
        resolve()
      }, 100)
    })
  },

  /**
   * Auto-save draft on step change
   * @param {Object} formData - Current form data
   * @param {number} currentStep - Current step number
   * @param {string} userId - User identifier
   * @returns {Promise<void>}
   */
  autoSaveDraft: async (formData, currentStep, userId) => {
    if (!userId) return

    try {
      await applicationService.saveDraft({
        userId,
        step: currentStep,
        data: formData,
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  },
}
