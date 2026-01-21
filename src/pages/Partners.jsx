import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { hospitalService } from '../services/hospitalService'
import Input from '../components/Input'

export default function Partners() {
  const [hospitals, setHospitals] = useState([])
  const [filteredHospitals, setFilteredHospitals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await hospitalService.getAllHospitals()
        setHospitals(data)
        setFilteredHospitals(data)
      } catch (error) {
        console.error('Error loading hospitals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHospitals()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHospitals(hospitals)
    } else {
      const filtered = hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.specialties.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      setFilteredHospitals(filtered)
    }
  }, [searchQuery, hospitals])

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Partner Hospitals</h1>
            <p>
              We partner with trusted hospitals and clinics across Nigeria to
              provide you with quality healthcare financing.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="search-section">
              <Input
                label="Search hospitals"
                type="text"
                placeholder="Search by name, location, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="loading">Loading hospitals...</div>
            ) : filteredHospitals.length === 0 ? (
              <div className="empty-state">
                <p>No hospitals found matching your search.</p>
              </div>
            ) : (
              <div className="hospitals-grid">
                {filteredHospitals.map((hospital) => (
                  <article key={hospital.id} className="hospital-card">
                    <h3>{hospital.name}</h3>
                    <p className="hospital-location">{hospital.location}</p>
                    <div className="hospital-specialties">
                      <strong>Specialties:</strong>
                      <ul>
                        {hospital.specialties.map((specialty, index) => (
                          <li key={index}>{specialty}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="hospital-contact">
                      <strong>Contact:</strong>
                      <p>{hospital.contact}</p>
                    </div>
                  </article>
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
