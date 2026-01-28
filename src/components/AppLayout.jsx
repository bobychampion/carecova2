import { useLocation } from 'react-router-dom'
import SupportButton from './SupportButton'

export default function AppLayout({ children }) {
  const location = useLocation()
  const hideSupport = location.pathname.startsWith('/admin')

  return (
    <>
      {children}
      {!hideSupport && <SupportButton />}
    </>
  )
}
