import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import ProfileAccessModal from '../components/ProfileAccessModal'
import SkeletonLoader from '../components/SkeletonLoader'
import { profileService } from '../services/profileService'
import { loanService } from '../services/loanService'
import {
  User,
  ClipboardList,
  Pencil,
  Phone,
  Mail,
  Briefcase,
  BarChart2,
  Plus,
  FileText,
  CreditCard,
  Building,
  Coins,
  Calendar
} from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    employmentType: '',
  })

  const loadProfileData = async (userId) => {
    try {
      const profileData = await profileService.getProfile(userId)
      setProfile(profileData)
      setFormData({
        phone: profileData.phone || '',
        email: profileData.email || '',
        employmentType: profileData.employmentType || '',
      })

      const userLoans = await loanService.getAllApplications()
      const userLoanHistory = userLoans.filter(
        (loan) => loan.phone === userId || loan.email === userId
      )
      setLoans(userLoanHistory)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      // Get user identifier from URL or localStorage
      const userId = new URLSearchParams(window.location.search).get('userId') ||
        localStorage.getItem('carecova_user_id')

      if (!userId) {
        setLoading(false)
        setShowAccessModal(true)
        return
      }

      await loadProfileData(userId)
    }
    loadProfile()
  }, [])

  const handleAccessSubmit = async (userId) => {
    localStorage.setItem('carecova_user_id', userId)
    setShowAccessModal(false)
    setLoading(true)
    await loadProfileData(userId)
  }

  const handleSave = async () => {
    try {
      await profileService.updateProfile(profile.id, formData)
      setProfile({ ...profile, ...formData })
      setEditing(false)
      alert('Profile updated successfully')
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const handleQuickApply = () => {
    if (profile) {
      const params = new URLSearchParams({
        phone: profile.phone,
        email: profile.email,
        employmentType: profile.employmentType,
      })
      navigate(`/apply?${params.toString()}`)
    }
  }

  return (
    <>
      <Header />
      <main>
        <ProfileAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          onSubmit={handleAccessSubmit}
        />

        {loading ? (
          <section className="section">
            <div className="container" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)' }}>
              <SkeletonLoader type="card" count={1} />
              <SkeletonLoader type="card" count={2} />
            </div>
          </section>
        ) : !profile ? (
          <section className="section">
            <div className="container">
              <div className="profile-empty-state">
                <div className="profile-empty-icon"><User size={48} /></div>
                <h2>Welcome to Your Profile</h2>
                <p>Enter your phone number or email to access your profile and view your loan history</p>
                <Button variant="primary" onClick={() => setShowAccessModal(true)}>
                  Access Profile
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="page-hero profile-hero">
              <div className="container">
                <div className="profile-hero-content">
                  <div className="profile-avatar">
                    <span className="profile-avatar-icon"><User size={48} /></span>
                  </div>
                  <div className="profile-hero-text">
                    <h1>My Profile</h1>
                    <p>Manage your account and view your loan history</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <div className="profile-container">
                  <div className="profile-section profile-section--personal">
                    <div className="profile-section-header">
                      <div className="profile-section-title">
                        <span className="profile-section-icon"><ClipboardList size={24} /></span>
                        <h2>Personal Information</h2>
                      </div>
                      {!editing && (
                        <Button variant="ghost" onClick={() => setEditing(true)}>
                          <Pencil size={16} className="mr-2" /> Edit
                        </Button>
                      )}
                    </div>

                    {editing ? (
                      <div className="profile-edit-form">
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Select
                          label="Employment Type"
                          options={[
                            { value: '', label: 'Select Employment Type' },
                            { value: 'employed', label: 'Employed' },
                            { value: 'self-employed', label: 'Self-Employed' },
                            { value: 'business-owner', label: 'Business Owner' },
                            { value: 'unemployed', label: 'Unemployed' },
                          ]}
                          value={formData.employmentType}
                          onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                        />
                        <div className="profile-edit-actions">
                          <Button variant="primary" onClick={handleSave}>
                            Save Changes
                          </Button>
                          <Button variant="ghost" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="profile-info">
                        <div className="profile-info-card glass-card">
                          <div className="profile-info-icon"><Phone size={24} color="white" /></div>
                          <div className="profile-info-content">
                            <span className="profile-info-label">Phone Number</span>
                            <span className="profile-info-value">{profile.phone || 'Not provided'}</span>
                          </div>
                        </div>
                        <div className="profile-info-card glass-card">
                          <div className="profile-info-icon"><Mail size={24} color="white" /></div>
                          <div className="profile-info-content">
                            <span className="profile-info-label">Email Address</span>
                            <span className="profile-info-value">{profile.email || 'Not provided'}</span>
                          </div>
                        </div>
                        {profile.employmentType && (
                          <div className="profile-info-card glass-card">
                            <div className="profile-info-icon"><Briefcase size={24} color="white" /></div>
                            <div className="profile-info-content">
                              <span className="profile-info-label">Employment Type</span>
                              <span className="profile-info-value">{profile.employmentType}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="profile-section profile-section--loans">
                    <div className="profile-section-header">
                      <div className="profile-section-title">
                        <span className="profile-section-icon"><BarChart2 size={24} /></span>
                        <h2>Loan History</h2>
                        {loans.length > 0 && (
                          <span className="profile-section-badge">{loans.length}</span>
                        )}
                      </div>
                      {loans.length > 0 && (
                        <Button variant="primary" onClick={handleQuickApply}>
                          <Plus size={16} className="mr-2" /> Apply Again
                        </Button>
                      )}
                    </div>
                    {loans.length === 0 ? (
                      <div className="profile-empty-loans">
                        <div className="profile-empty-loans-icon"><FileText size={48} /></div>
                        <p>No loan applications yet.</p>
                        <Button variant="primary" onClick={() => navigate('/apply')}>
                          Start Your First Application
                        </Button>
                      </div>
                    ) : (
                      <div className="loan-history-list">
                        {loans.map((loan) => (
                          <div key={loan.id} className="loan-history-card glass-card">
                            <div className="loan-history-card-header">
                              <div className="loan-history-id-section">
                                <span className="loan-history-icon"><CreditCard size={20} /></span>
                                <span className="loan-history-id">{loan.id}</span>
                              </div>
                              <span className={`status-badge status-badge--${loan.status}`}>
                                {loan.status}
                              </span>
                            </div>
                            <div className="loan-history-card-body">
                              <div className="loan-history-detail-item">
                                <span className="loan-history-detail-label"><Building size={14} className="mr-1" /> Hospital</span>
                                <span className="loan-history-detail-value">{loan.hospital}</span>
                              </div>
                              <div className="loan-history-detail-item">
                                <span className="loan-history-detail-label"><Coins size={14} className="mr-1" /> Amount</span>
                                <span className="loan-history-detail-value loan-history-detail-value--amount">
                                  ₦{loan.estimatedCost?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              <div className="loan-history-detail-item">
                                <span className="loan-history-detail-label"><Calendar size={14} className="mr-1" /> Submitted</span>
                                <span className="loan-history-detail-value">
                                  {new Date(loan.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="loan-history-card-footer">
                              <Button
                                variant="ghost"
                                onClick={() => navigate(`/track?loanId=${loan.id}`)}
                              >
                                View Details →
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
