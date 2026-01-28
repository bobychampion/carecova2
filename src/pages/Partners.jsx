import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { hospitalService } from '../services/hospitalService'
import Input from '../components/Input'
import Select from '../components/Select'
import HospitalCard from '../components/HospitalCard'

export default function Partners() {
  const [hospitals, setHospitals] = useState([])
  const [filteredHospitals, setFilteredHospitals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const cities = ['All Cities', ...new Set(hospitals.map((h) => h.city).filter(Boolean))]

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
            <div className="partners-filters">
              <div className="filter-group">
                <Input
                  label="Search hospitals"
                  type="text"
                  placeholder="Search by name, location, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <Select
                  label="Filter by City"
                  options={cities.map((city) => ({ value: city, label: city }))}
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading hospitals...</div>
            ) : filteredHospitals.length === 0 ? (
              <div className="empty-state">
                <p>No hospitals found matching your search.</p>
              </div>
            ) : (
              <div className="hospitals-grid-enhanced">
                {filteredHospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
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
