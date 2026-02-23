import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Partners from './pages/Partners'
import Apply from './pages/Apply'
import Track from './pages/Track'
import Offer from './pages/Offer'
import Calculator from './pages/Calculator'
import ResumeApplication from './pages/ResumeApplication'
import EligibilityCheck from './pages/EligibilityCheck'
import PrivacyPolicy from './pages/PrivacyPolicy'
import MakePayment from './pages/MakePayment'
import PaymentConfirmation from './pages/PaymentConfirmation'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Applications from './pages/admin/Applications'
import ApplicationDetail from './pages/admin/ApplicationDetail'
import ActiveLoans from './pages/admin/ActiveLoans'
import Repayments from './pages/admin/Repayments'
import RulesConfig from './pages/admin/RulesConfig'
import AuditLog from './pages/admin/AuditLog'
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
        <Route path="/offer/:applicationId" element={<Offer />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/make-payment" element={<MakePayment />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="loans" element={<ActiveLoans />} />
          <Route path="repayments" element={<Repayments />} />
          <Route path="rules" element={<RulesConfig />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
