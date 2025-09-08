'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Header } from '@/components/Header'

interface Plan {
  id: number
  name: string
  price_monthly?: number
  price_yearly?: number
  features?: string[]
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const planId = searchParams.get('planId')
  const billing = (searchParams.get('billing') as 'monthly' | 'yearly') || 'monthly'

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showGateway, setShowGateway] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) router.push('/login')
  }, [router])

  useEffect(() => {
    if (!planId) {
      setMessage('Invalid plan selected')
      setLoading(false)
      return
    }

    async function fetchPlan() {
      try {
        const res = await axios.get(`${API_URL}/plan.php`)
        const plans: Plan[] = res.data
        const selected = plans.find((p) => p.id === Number(planId))
        if (!selected) setMessage('Plan not found')
        else setPlan(selected)
      } catch (err) {
        console.error(err)
        setMessage('Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [API_URL, planId])

  const handleStartPayment = () => {
    setShowGateway(true)
  }

  const handleCompletePayment = () => {
    if (!cardNumber || !expiry || !cvc) {
      alert('Please fill in all card details (demo)')
      return
    }
    setPaymentDone(true)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading plan...</div>
  if (message) return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{message}</p>
  if (!plan) return null

  return (
    <div className="bookmark-manager">
      <Header />

      <div style={{ marginTop: '3.5rem' }}>
        <header className="bookmark-header">
          <div className="header-container">
            <h1>Payment Details</h1>
            <p>
              <i className="fa-regular fa-credit-card"></i>
              Review your plan & complete payment
              <i className="fa-regular fa-credit-card"></i>
            </p>
          </div>
        </header>
      </div>

      <main style={{ textAlign: 'center', marginTop: '2rem' }}>
        {!showGateway && !paymentDone && (
          <div
            style={{
              display: 'inline-block',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h2 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.5rem' }}>{plan.name}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#555' }}>
              Duration: <strong>{billing === 'yearly' ? '1 Year' : '1 Month'}</strong>
            </p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              £{billing === 'yearly' ? plan.price_yearly : plan.price_monthly}/
              {billing === 'yearly' ? 'yr' : 'mo'}
            </p>

            {plan.features && plan.features.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    ✅ {f}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={handleStartPayment}
              style={{
                padding: '0.8rem 2rem',
                borderRadius: '12px',
                backgroundColor: 'var(--main-color)',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
              }}
            >
              Pay Now (Demo)
            </button>
          </div>
        )}

        {showGateway && !paymentDone && (
          <div
            style={{
              display: 'inline-block',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>💳 Payment Gateway (Demo)</h2>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              style={{ width: '48%', padding: '0.5rem', marginRight: '4%', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              style={{ width: '48%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleCompletePayment}
              style={{
                padding: '0.8rem 2rem',
                borderRadius: '12px',
                backgroundColor: 'var(--main-color)',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Complete Payment
            </button>
          </div>
        )}

        {paymentDone && (
          <div
            style={{
              display: 'inline-block',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
              maxWidth: '400px',
              width: '100%',
              color: '#155724',
              fontWeight: 500,
            }}
          >
            🎉 Payment Successful! <br />
            You are now subscribed to <strong>{plan.name}</strong> for{' '}
            <strong>{billing === 'yearly' ? '1 Year' : '1 Month'}</strong>.
          </div>
        )}
      </main>
    </div>
  )
}
