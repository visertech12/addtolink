'use client'
import '@/styles/bookmark-manager.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Header } from '@/components/Header'

interface User {
  user_id?: number
  firstName: string
  lastName: string
  email: string
  membership: string
  avatarUrl?: string | null
}

interface Plan {
  id: number
  name: string
  price_monthly?: number | null
  price_yearly?: number | null
  features: string[]
  button: string
  highlight: boolean
  [key: string]: any
}

export default function MembershipPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [showYearly, setShowYearly] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // User's current subscribed plan
  const [userPlanId, setUserPlanId] = useState<number | null>(null)

  // Check auth & fetch user
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }
    setAuthToken(token)

    async function fetchUser() {
      try {
        const res = await axios.get(`${API_URL}/me.php`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setUser(res.data.user)
        } else {
          localStorage.removeItem('authToken')
          router.push('/login')
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem('authToken')
        router.push('/login')
      } finally {
        setIsAuthChecked(true)
      }
    }

    fetchUser()
  }, [])

  // Fetch plans
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await axios.get(`${API_URL}/plan.php`)
        if (Array.isArray(res.data)) setPlans(res.data)
        else setError('Invalid API response')
      } catch (err: any) {
        console.error(err)
        setError('Failed to load plans')
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [API_URL])

  // Fetch user's subscribed plan
  useEffect(() => {
    if (!user || !authToken) return

    async function fetchUserPlan() {
      try {
        const res = await axios.get(`${API_URL}/user_plans.php?user_id=${user.user_id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        if (Array.isArray(res.data) && res.data.length > 0) {
          setUserPlanId(res.data[0].plan_id) // assume 1 active plan per user
        } else {
          setUserPlanId(null)
        }
      } catch (err) {
        console.error('Failed to fetch user plan:', err)
      }
    }

    fetchUserPlan()
  }, [user, authToken, API_URL])

  if (!isAuthChecked) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading user info...</p>
  if (error) return <p className="error">{error}</p>

  const formatPrice = (price: number | null, period: 'mo' | 'yr') => {
    if (!price) return 'Free'
    return `£${price}${period === 'mo' ? '/mo' : '/yr'}`
  }

  const subscribePlan = async (planId: number, cycle: 'monthly' | 'yearly') => {
    if (!authToken || !user) {
      router.push('/login')
      return
    }

    const payload = {
      plan_id: planId,
      billing_cycle: cycle,
      user_id: user.user_id || null,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      membership: user.membership,
    }

    try {
      const res = await axios.post(
        'https://backend.trade-x-pro.com/stripe/stripe.php',
        payload,
        { headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' } }
      )

      if (res.data.success && res.data.url) {
        window.location.href = res.data.url
      } else {
        alert(res.data.error || 'Failed to create Stripe session')
        console.error(res.data)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.error || 'Something went wrong')
    } finally {
      setShowModal(false)
      setSelectedPlan(null)
    }
  }

  const handlePlanClick = (plan: Plan) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (userPlanId === plan.id) {
      alert('You are already subscribed to this plan.')
      return
    }

    if (!plan.price_monthly && !plan.price_yearly) {
      subscribePlan(plan.id, 'monthly')
    } else {
      setSelectedPlan(plan)
      setBillingCycle(showYearly ? 'yearly' : 'monthly')
      setShowModal(true)
    }
  }

  return (
    <div className="bookmark-manager">
      <Header />

      <header className="bookmark-header" style={{ paddingTop: '80px' }}>
        <div className="header-container">
          <h1 className="bookmark-headerh1">Pricing</h1>
          <p className="bookmark-headerp">✨ Pick your plan ✨</p>
        </div>
      </header>

      <main className="main-wrapper">
        <div style={{ textAlign: 'center', margin: '1rem' }}>
          <button
            onClick={() => setShowYearly(!showYearly)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
          >
            {showYearly ? 'Show Monthly Prices' : 'Show Yearly Prices'}
          </button>
        </div>

        <div className="plans-grid">
          {loadingPlans ? (
            <p className="loading">Loading plans...</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className={`plan-card ${plan.highlight ? 'highlight' : ''}`}>
                <h2 className="plan-name">{plan.name}</h2>
                <p className="plan-price">
                  {plan.price_monthly && plan.price_yearly
                    ? showYearly
                      ? formatPrice(plan.price_yearly, 'yr')
                      : formatPrice(plan.price_monthly, 'mo')
                    : plan.price_monthly
                    ? formatPrice(plan.price_monthly, 'mo')
                    : plan.price_yearly
                    ? formatPrice(plan.price_yearly, 'yr')
                    : 'Free'}
                </p>

                <ul className="plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>✅ {f}</li>
                  ))}
                  {Object.entries(plan).map(([key, value]) => {
                    if (['id', 'name', 'price_monthly', 'price_yearly', 'features', 'button', 'highlight'].includes(key)) return null
                    if (value !== null && value !== undefined) {
                      const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      return (
                        <li key={key}>
                          📌 {displayKey}: {value}
                        </li>
                      )
                    }
                  })}
                </ul>

                <button
                  className="plan-btn"
                  onClick={() => handlePlanClick(plan)}
                  disabled={userPlanId === plan.id}
                >
                  {userPlanId === plan.id
                    ? 'Subscribed'
                    : user
                      ? plan.price_monthly && plan.price_yearly
                        ? `${plan.button} (${showYearly ? 'Yearly' : 'Monthly'})`
                        : plan.button
                      : 'Create Account & Upgrade'}
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Confirm Subscription</h2>
            <p>
              Plan: <strong>{selectedPlan.name}</strong>
            </p>
            <p>
              Billing: <strong>{billingCycle}</strong>
            </p>
            <p>
              Price:{' '}
              <strong>
                {billingCycle === 'monthly'
                  ? formatPrice(selectedPlan.price_monthly || 0, 'mo')
                  : formatPrice(selectedPlan.price_yearly || 0, 'yr')}
              </strong>
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button
                style={{
                  background: 'var(--main-color)',
                  color: '#fff',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                onClick={() => subscribePlan(selectedPlan.id, billingCycle)}
              >
                Confirm & Pay
              </button>
              <button
                style={{
                  background: '#ccc',
                  color: '#000',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginLeft: '0.5rem',
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading,
        .error {
          text-align: center;
          margin-top: 2rem;
        }
        .error {
          color: red;
        }
        .plans-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        .plan-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        .plan-card.highlight {
          border: 2px solid var(--main-color);
          background: linear-gradient(135deg, #fff, #fdf7ff);
          box-shadow: 0 6px 18px rgba(150, 0, 200, 0.15);
        }
        .plan-name {
          font-size: 1.6rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text-dark);
        }
        .plan-card.highlight .plan-name {
          color: var(--main-color);
        }
        .plan-price {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #444;
        }
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          text-align: left;
          color: #333;
        }
        .plan-features li {
          margin-bottom: 0.6rem;
          font-size: 0.95rem;
        }
        .plan-btn {
          display: inline-block;
          background: var(--main-color);
          color: #fff;
          font-weight: 500;
          padding: 0.7rem 1.5rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .plan-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .plan-btn:hover:not(:disabled) {
          background: var(--main-color-dark, #6b21a8);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
