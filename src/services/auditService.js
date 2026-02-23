/**
 * Audit Service — records every admin action with who, what, when, and why.
 */

const AUDIT_KEY = 'carecova_audit_log'

function getLog() {
    try {
        const stored = localStorage.getItem(AUDIT_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveLog(log) {
    try {
        localStorage.setItem(AUDIT_KEY, JSON.stringify(log))
    } catch (e) {
        console.error('Error saving audit log:', e)
    }
}

export const auditService = {
    /**
     * Record an admin action
     * @param {string} action - e.g. 'approve', 'reject', 'modify_offer', 'request_info', 'record_payment', 'login', 'update_config'
     * @param {Object} details - contextual data
     */
    record(action, details = {}) {
        const log = getLog()
        const entry = {
            id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            action,
            adminName: details.adminName || 'admin',
            loanId: details.loanId || null,
            timestamp: new Date().toISOString(),
            details: details.message || details.reason || JSON.stringify(details),
        }
        log.unshift(entry) // newest first
        // Keep max 500 entries
        if (log.length > 500) log.length = 500
        saveLog(log)
        return entry
    },

    /**
     * Get all audit entries, newest first
     * @param {Object} filters - { action, loanId, adminName, fromDate, toDate }
     */
    getAll(filters = {}) {
        let log = getLog()

        if (filters.action) {
            log = log.filter(e => e.action === filters.action)
        }
        if (filters.loanId) {
            log = log.filter(e => e.loanId === filters.loanId)
        }
        if (filters.adminName) {
            log = log.filter(e => e.adminName === filters.adminName)
        }
        if (filters.fromDate) {
            log = log.filter(e => new Date(e.timestamp) >= new Date(filters.fromDate))
        }
        if (filters.toDate) {
            log = log.filter(e => new Date(e.timestamp) <= new Date(filters.toDate))
        }

        return log
    },

    /**
     * Get entries for a specific loan
     */
    getForLoan(loanId) {
        return getLog().filter(e => e.loanId === loanId)
    },

    /**
     * Clear all audit entries (dev only)
     */
    clear() {
        localStorage.removeItem(AUDIT_KEY)
    },
}
