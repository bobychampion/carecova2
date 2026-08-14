import { useState, useRef, useEffect } from 'react'

const API_BASE = ((import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')) + '/api'

const SUGGESTED_QUESTIONS = [
  'Who is actually paying this person based on their transactions?',
  'Does their stated income match their bank deposits?',
  'Are there any hidden loan repayments not declared on the form?',
  'Is this a salary account? Explain the pattern.',
  'What are the top 3 risk flags for this application?',
  'Can they realistically afford the requested repayment?',
]

function Message({ role, content }) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
      marginBottom: '14px',
      flexDirection: role === 'user' ? 'row-reverse' : 'row',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: role === 'user' ? '#1d4ed8' : '#059669',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, color: '#fff',
      }}>
        {role === 'user' ? 'You' : 'AI'}
      </div>
      <div style={{
        maxWidth: '85%',
        background: role === 'user' ? '#eff6ff' : '#f0fdf4',
        border: `1px solid ${role === 'user' ? '#bfdbfe' : '#bbf7d0'}`,
        borderRadius: role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        padding: '10px 14px',
        fontSize: '0.875rem',
        lineHeight: '1.55',
        color: '#1f2937',
        whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
    </div>
  )
}

export default function AiChatPanel({ loan }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (question) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setError('')

    const newMessages = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const session = JSON.parse(localStorage.getItem('carecova_admin_session') || '{}')
      const token = session?.token || session?.accessToken || ''

      const res = await fetch(`${API_BASE}/admin/loan-applications/${loan.id || loan._id}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: q,
          history: newMessages.slice(-8).slice(0, -1), // exclude the question we just added
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'AI request failed')

      setMessages([...newMessages, { role: 'assistant', content: data.answer }])
    } catch (err) {
      setError(err.message || 'AI request failed')
      setMessages(newMessages) // keep user message, remove pending
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #059669, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>AI Underwriter</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
            Ask anything about {loan.fullName || loan.patientName || 'this applicant'}
          </p>
        </div>
      </div>

      {/* Suggested questions (shown when empty) */}
      {messages.length === 0 && (
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Suggested questions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={loading}
                style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px',
                  padding: '5px 12px', fontSize: '0.8rem', color: '#065f46', cursor: 'pointer',
                  fontWeight: 500, textAlign: 'left',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div style={{ padding: '16px 18px', minHeight: '180px', maxHeight: '420px', overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>AI</div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px 12px 12px 12px', padding: '10px 16px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }} />
                ))}
              </span>
            </div>
          </div>
        )}
        {error && (
          <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.8125rem', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about employer, income, debt, risk..."
          disabled={loading}
          style={{
            flex: 1, padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
            fontSize: '0.875rem', outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#059669' }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '8px 16px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            opacity: (loading || !input.trim()) ? 0.5 : 1,
          }}
        >
          Send
        </button>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => { setMessages([]); setError('') }}
            style={{ background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: '#6b7280', fontSize: '0.8rem' }}
            title="Clear chat"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  )
}
