#!/usr/bin/env node
/**
 * Seed the CareCova backend with demo loan applications.
 * Usage: node scripts/seed/seed-backend.js
 *        API_BASE_URL=http://localhost:3000 node scripts/seed/seed-backend.js
 *
 * Requires Node 18+ (for fetch). API_BASE_URL defaults to https://care-cova-api.onrender.com
 */

const fs = require('fs')
const path = require('path')

const API_BASE_URL = (process.env.API_BASE_URL || 'https://care-cova-api.onrender.com').replace(/\/$/, '')
const API_ROOT = `${API_BASE_URL}/api`

const seedPath = path.join(__dirname, 'loan-applications.json')
const payloads = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

async function seed() {
  console.log(`Seeding ${payloads.length} loan application(s) to ${API_ROOT}/loan-applications\n`)
  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i]
    const name = payload.fullName || payload.patientName || `Application ${i + 1}`
    try {
      const res = await fetch(`${API_ROOT}/loan-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      const id = body.id || body._id || body.data?.id
      if (res.ok) {
        console.log(`  ✓ ${name} → id: ${id || '(no id in response)'}`)
      } else {
        console.log(`  ✗ ${name} → ${res.status} ${body.message || body.error || res.statusText}`)
      }
    } catch (err) {
      console.log(`  ✗ ${name} → Error: ${err.message}`)
    }
  }
  console.log('\nDone.')
}

seed()
