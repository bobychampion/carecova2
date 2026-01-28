export default function HospitalCard({ hospital }) {
  return (
    <article className="hospital-card-enhanced">
      {hospital.logo && (
        <div className="hospital-logo">
          <img src={hospital.logo} alt={`${hospital.name} logo`} onError={(e) => {
            e.target.style.display = 'none'
          }} />
        </div>
      )}
      <div className="hospital-card-content">
        <h3>{hospital.name}</h3>
        <p className="hospital-location">{hospital.location}</p>
        {hospital.tier && (
          <span className={`hospital-tier hospital-tier--${hospital.tier}`}>
            {hospital.tier === 'premium' ? 'Premium Partner' : 'Standard Partner'}
          </span>
        )}
        <div className="hospital-specialties">
          <strong>Specialties:</strong>
          <div className="specialty-badges">
            {hospital.specialties.map((specialty, index) => (
              <span key={index} className="specialty-badge">{specialty}</span>
            ))}
          </div>
        </div>
        <div className="hospital-contact">
          <strong>Contact:</strong>
          <a href={`tel:${hospital.contact.replace(/\s/g, '')}`} className="hospital-phone">
            {hospital.contact}
          </a>
        </div>
      </div>
    </article>
  )
}
