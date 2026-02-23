import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import { applicationService } from '../services/applicationService'

export default function ResumeApplication() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')

    if (!userId.trim()) {
      setError('Please enter your phone number or email')
      return
    }

    setLoading(true)
    try {
      const userDrafts = await applicationService.getDrafts(userId.trim())
      setDrafts(userDrafts)
      if (userDrafts.length === 0) {
        setError('No saved applications found for this phone/email')
      }
    } catch (err) {
      setError('Failed to load saved applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResume = (draftId) => {
    navigate(`/apply?draftId=${draftId}`)
  }

  const handleDelete = async (draftId) => {
    if (confirm('Are you sure you want to delete this saved application?')) {
      try {
        await applicationService.deleteDraft(draftId)
        setDrafts(drafts.filter((d) => d.id !== draftId))
      } catch (err) {
        alert('Failed to delete draft. Please try again.')
      }
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Resume Your Application</h1>
            <p>Continue where you left off</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="resume-search-card">
              <form onSubmit={handleSearch} className="resume-search-form">
                <Input
                  label="Phone Number or Email"
                  type="text"
                  placeholder="Enter phone or email used in your application"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  error={error}
                  required
                />
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Searching...' : 'Find Saved Applications'}
                </Button>
              </form>
            </div>

            {drafts.length > 0 && (
              <div className="drafts-list">
                <h2>Your Saved Applications</h2>
                {drafts.map((draft) => (
                  <div key={draft.id} className="draft-card">
                    <div className="draft-info">
                      <div className="draft-header">
                        <h3>Application Draft</h3>
                        <span className="draft-step">Step {draft.step} of 4</span>
                      </div>
                      <div className="draft-details">
                        <p>
                          <strong>Saved:</strong>{' '}
                          {new Date(draft.savedAt).toLocaleDateString()}
                        </p>
                        {(draft.data.fullName || draft.data.patientName) && (
                          <p>
                            <strong>Name:</strong> {draft.data.fullName || draft.data.patientName}
                          </p>
                        )}
                        {(draft.data.hospital || (draft.data.hospitalPreference === 'have_hospital' && draft.data.hospitalName)) && (
                          <p>
                            <strong>Hospital:</strong> {draft.data.hospitalPreference === 'have_hospital' ? draft.data.hospitalName : draft.data.hospital}
                          </p>
                        )}
                        {(draft.data.requestedAmount || draft.data.estimatedCost) && (
                          <p>
                            <strong>Amount:</strong> ₦
                            {parseFloat(draft.data.requestedAmount || draft.data.estimatedCost).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="draft-actions">
                      <Button
                        variant="primary"
                        onClick={() => handleResume(draft.id)}
                      >
                        Continue Application
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(draft.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
