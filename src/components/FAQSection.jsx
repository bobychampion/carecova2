import { useState } from 'react'
import { faqs, getFAQsByCategory } from '../data/faqs'

export default function FAQSection({ category, limit = 3 }) {
  const [expandedId, setExpandedId] = useState(null)
  const categoryFAQs = getFAQsByCategory(category).slice(0, limit)

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (categoryFAQs.length === 0) return null

  return (
    <div className="faq-section-compact">
      <h3>Common Questions</h3>
      {categoryFAQs.map((faq) => (
        <div
          key={faq.id}
          className={`faq-item-compact ${expandedId === faq.id ? 'faq-item-compact--expanded' : ''}`}
        >
          <button
            className="faq-question-compact"
            onClick={() => toggleFAQ(faq.id)}
          >
            <span>{faq.question}</span>
            <span className="faq-toggle">{expandedId === faq.id ? '−' : '+'}</span>
          </button>
          {expandedId === faq.id && (
            <div className="faq-answer-compact">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  )
}
