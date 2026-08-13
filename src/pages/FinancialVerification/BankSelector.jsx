import { useState, useMemo } from 'react'
import { allBanks, bankCategories } from '../../data/bankConfig'

function BankAvatar({ name }) {
  return (
    <span className="vfp__bank-avatar">
      {name.slice(0, 2)}
    </span>
  )
}

export default function BankSelector({ onSelect }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return allBanks.filter((b) => b.name.toLowerCase().includes(q))
  }, [query])

  const renderBank = (bank) => (
    <button
      key={bank.id}
      className="vfp__bank-row"
      onClick={() => onSelect(bank)}
    >
      <BankAvatar name={bank.name} />
      <span className="vfp__bank-name">{bank.name}</span>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>›</span>
    </button>
  )

  return (
    <>
      <div className="vfp__step-tag">Select Your Bank</div>
      <h1 className="vfp__heading">Which bank do you receive your income through?</h1>
      <p className="vfp__subheading">
        Select the bank account you normally use to receive your income. This should preferably
        be your primary account.
      </p>

      <div className="vfp__search-wrap">
        <span className="vfp__search-icon">🔍</span>
        <input
          className="vfp__search-input"
          type="text"
          placeholder="Search for your bank…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      {filtered !== null ? (
        filtered.length === 0 ? (
          <div className="vfp__no-results">
            <p style={{ marginBottom: 4 }}>No bank found for "{query}"</p>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              Contact CareCova support if your bank is not listed.
            </p>
          </div>
        ) : (
          <div className="vfp__bank-list">
            {filtered.map(renderBank)}
          </div>
        )
      ) : (
        bankCategories.map((cat) => (
          <div className="vfp__bank-category" key={cat.label}>
            <p className="vfp__bank-category-label">{cat.label}</p>
            <div className="vfp__bank-list">
              {cat.banks.map((id) => {
                const bank = allBanks.find((b) => b.id === id)
                return bank ? renderBank(bank) : null
              })}
            </div>
          </div>
        ))
      )}

      <div style={{ height: 24 }} />
      <div className="vfp__security-notice">
        <span className="vfp__security-notice-icon">🔒</span>
        <p className="vfp__security-notice-text">
          Your login credentials are entered securely through Mono's connection process and are
          never shared with CareCova.
        </p>
      </div>
    </>
  )
}
