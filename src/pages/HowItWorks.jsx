import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function HowItWorks() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>How CareNow Works</h1>
            <p>Four simple steps to bridge the gap between treatment and cash.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="steps-detailed">
              <div className="step-detailed">
                <div className="step-number-large">01</div>
                <div className="step-content">
                  <h2>Apply</h2>
                  <h3>Securely upload your treatment estimate or hospital bill.</h3>
                  <p>
                    Fill out our simple application form with your personal details,
                    select your partner hospital, choose your treatment category, and
                    provide the estimated cost. The entire process takes just a few
                    minutes.
                  </p>
                  <Link to="/apply">
                    <Button variant="primary">Start Application</Button>
                  </Link>
                </div>
              </div>

              <div className="step-detailed">
                <div className="step-number-large">02</div>
                <div className="step-content">
                  <h2>Review</h2>
                  <h3>Get a fast decision based on smart affordability checks.</h3>
                  <p>
                    Our team reviews your application and performs affordability
                    assessments. We aim to provide a decision within 24-48 hours.
                    Once approved, we'll notify you via SMS or email with your loan
                    terms and repayment schedule.
                  </p>
                </div>
              </div>

              <div className="step-detailed">
                <div className="step-number-large">03</div>
                <div className="step-content">
                  <h2>Treated</h2>
                  <h3>Focus on your health while we settle the bill directly.</h3>
                  <p>
                    Once your loan is approved, CareCova pays your partner hospital
                    directly. No cash handling needed. You can focus entirely on your
                    treatment and recovery without worrying about upfront payments.
                  </p>
                </div>
              </div>

              <div className="step-detailed">
                <div className="step-number-large">04</div>
                <div className="step-content">
                  <h2>Repay</h2>
                  <h3>Split the cost into clear, interest-fair installments.</h3>
                  <p>
                    Repay your treatment cost in small, manageable monthly
                    installments over 3, 6, or 12 months. You'll receive clear
                    repayment schedules and reminders. Track your payments and
                    outstanding balance anytime through your application portal.
                  </p>
                  <Link to="/track">
                    <Button variant="secondary">Track Your Loan</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-accent">
          <div className="container">
            <div className="panel">
              <h2>Our Commitment</h2>
              <p className="quote">
                "CareCova exists to remove financial fear from medical choices.
                Because no parent should delay care. No couple should postpone hope.
                And no family should ever compromise health for cash flow."
              </p>
              <div className="commitment-features">
                <div>
                  <span className="feature-icon">✓</span>
                  <span>No collateral required</span>
                </div>
                <div>
                  <span className="feature-icon">✓</span>
                  <span>Transparent repayment schedules</span>
                </div>
                <div>
                  <span className="feature-icon">✓</span>
                  <span>Supporting salaried & business owners</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
