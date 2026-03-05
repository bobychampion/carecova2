/**
 * Demo customers for customer portal login.
 * In production, customers are created on first application (phone + email + name).
 */

export const mockCustomers = [
  {
    id: 'cust-demo',
    phone: '08031234567',
    email: 'chioma.eze@example.com',
    fullName: 'Chioma Eze',
    createdAt: new Date('2026-02-01T09:00:00').toISOString(),
  },
  {
    id: 'cust-001',
    phone: '08012345678',
    email: 'adekunle@example.com',
    fullName: 'Adekunle Johnson',
    createdAt: new Date('2026-02-18T09:00:00').toISOString(),
  },
]
