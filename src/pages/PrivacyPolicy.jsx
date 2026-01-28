import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Privacy Policy</h1>
            <p>How we protect and use your personal information</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="privacy-content">
              <div className="privacy-section">
                <h2>Data Collection</h2>
                <p>
                  We collect information necessary to process your healthcare financing application,
                  including personal details, contact information, and medical treatment estimates.
                </p>
              </div>

              <div className="privacy-section">
                <h2>Data Usage</h2>
                <p>
                  Your data is used solely for:
                </p>
                <ul>
                  <li>Processing your loan application</li>
                  <li>Communicating about your application status</li>
                  <li>Managing repayments</li>
                  <li>Providing customer support</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h2>Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your personal
                  information. All data is encrypted in transit and at rest.
                </p>
              </div>

              <div className="privacy-section">
                <h2>Data Sharing</h2>
                <p>
                  We do not sell your data. We may share information with:
                </p>
                <ul>
                  <li>Partner hospitals (for treatment coordination)</li>
                  <li>Payment processors (for transaction processing)</li>
                  <li>Legal authorities (when required by law)</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request data deletion</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h2>Contact Us</h2>
                <p>
                  For privacy-related questions, contact us at:{' '}
                  <a href="mailto:privacy@carecova.com">privacy@carecova.com</a>
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
