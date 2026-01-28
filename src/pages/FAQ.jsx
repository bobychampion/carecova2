import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Input from '../components/Input'
import { faqs, getFAQsByCategory, searchFAQs } from '../data/faqs'

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const categories = ['all', 'application', 'repayment', 'general']

  const filteredFAQs = searchQuery
    ? searchFAQs(searchQuery)
    : getFAQsByCategory(selectedCategory || null)

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about healthcare financing</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="faq-search-section">
              <Input
                label="Search FAQs"
                type="text"
                placeholder="Type your question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="faq-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`faq-filter-button ${selectedCategory === category || (!selectedCategory && category === 'all') ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category === 'all' ? '' : category)
                    setSearchQuery('')
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="faq-list">
              {filteredFAQs.length === 0 ? (
                <div className="empty-state">
                  <p>No FAQs found matching your search.</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`faq-item ${expandedId === faq.id ? 'faq-item--expanded' : ''}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-toggle">{expandedId === faq.id ? '−' : '+'}</span>
                    </button>
                    {expandedId === faq.id && (
                      <div className="faq-answer">{faq.answer}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
