import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import LoanDetailModal from '../components/LoanDetailModal'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, loading: authLoading } = useAuth()
  const [loans, setLoans] = useState([])
  const [filteredLoans, setFilteredLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      loadLoans()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterLoans()
  }, [loans, statusFilter, searchQuery])

  const loadLoans = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllLoans()
      setLoans(data)
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLoans = () => {
    let filtered = [...loans]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (loan) =>
          loan.id.toLowerCase().includes(query) ||
          loan.patientName.toLowerCase().includes(query) ||
          loan.email.toLowerCase().includes(query) ||
          loan.hospital.toLowerCase().includes(query)
      )
    }

    setFilteredLoans(filtered)
  }

  const handleApprove = async (loanId, terms) => {
    try {
      await adminService.approveLoan(loanId, terms)
      await loadLoans()
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error approving loan:', error)
      alert('Error approving loan: ' + error.message)
    }
  }

  const handleReject = async (loanId, reason) => {
    try {
      await adminService.rejectLoan(loanId, reason)
      await loadLoans()
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error rejecting loan:', error)
      alert('Error rejecting loan: ' + error.message)
    }
  }

  const handleRecordPayment = async (loanId, amount, paymentDate) => {
    try {
      await adminService.recordPayment(loanId, amount, paymentDate)
      await loadLoans()
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Error recording payment: ' + error.message)
    }
  }

  const calculateMetrics = () => {
    const total = loans.length
    const pending = loans.filter((l) => l.status === 'pending').length
    const active = loans.filter((l) => l.status === 'active').length
    const totalFinanced = loans
      .filter((l) => l.status === 'approved' || l.status === 'active')
      .reduce((sum, l) => sum + (l.approvedAmount || l.estimatedCost || 0), 0)

    return { total, pending, active, totalFinanced }
  }

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  const metrics = calculateMetrics()

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          <section className="metrics-section">
            <div className="metric-card">
              <h3>Total Applications</h3>
              <p className="metric-value">{metrics.total}</p>
            </div>
            <div className="metric-card">
              <h3>Pending Approvals</h3>
              <p className="metric-value">{metrics.pending}</p>
            </div>
            <div className="metric-card">
              <h3>Active Loans</h3>
              <p className="metric-value">{metrics.active}</p>
            </div>
            <div className="metric-card">
              <h3>Total Financed</h3>
              <p className="metric-value">₦{metrics.totalFinanced.toLocaleString()}</p>
            </div>
          </section>

          <section className="filters-section">
            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="text"
                placeholder="Search by ID, name, email, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </section>

          <section className="loans-section">
            <h2>Loan Applications</h2>
            {filteredLoans.length === 0 ? (
              <div className="empty-state">No loans found</div>
            ) : (
              <table className="loans-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Hospital</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.patientName}</td>
                      <td>{loan.hospital}</td>
                      <td>₦{loan.estimatedCost.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={loan.status} />
                      </td>
                      <td>{new Date(loan.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedLoan(loan)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>

      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onRecordPayment={handleRecordPayment}
        />
      )}
    </div>
  )
}
