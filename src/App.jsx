import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Partners from './pages/Partners'
import Apply from './pages/Apply'
import Track from './pages/Track'
import Calculator from './pages/Calculator'
import ResumeApplication from './pages/ResumeApplication'
import EligibilityCheck from './pages/EligibilityCheck'
import PrivacyPolicy from './pages/PrivacyPolicy'
import MakePayment from './pages/MakePayment'
import PaymentConfirmation from './pages/PaymentConfirmation'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { useAuth } from './hooks/useAuth'
import './App.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/admin" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/partners" element={<Navigate to="/" replace />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/resume" element={<ResumeApplication />} />
        <Route path="/eligibility" element={<EligibilityCheck />} />
        <Route path="/track" element={<Track />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/make-payment" element={<MakePayment />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
