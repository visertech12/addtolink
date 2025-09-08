'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '@/styles/bookmark-manager.css'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'

export default function RegisterPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-login via token in query (from Google callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('authToken', token)
      router.push('/') // redirect to homepage
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/register.php`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })

      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        router.push('/')
      } else {
        setError(response.data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // --- Google Sign-in via backend ---
  const handleGoogleSignIn = () => {
    // Redirect to PHP backend Google OAuth endpoint
    window.location.href = `${API_URL}/google-auth.php`
  }

  return (
    <div className="bookmark-manager">
      {/* Header */}
      <header className="bookmark-header">
        <div className="header-container">
          <h1 className="bookmark-headerh1">Get started — Free</h1>
          <p className="bookmark-headerp">
            <i className="fa-regular fa-user"></i>
            Please fill in your details to create an account
            <i className="fa-regular fa-user"></i>
          </p>
        </div>
      </header>
      <Header />

      {/* Main */}
      <main className="main-wrapper">
        <div className="main-container">
          <form className="bookmark-inputs register-form" onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {/* Inputs */}
            {['firstName','lastName','email','password','confirmPassword'].map((id) => (
              <div className="modern-input-group" key={id}>
                <span className="input-icon">
                  <i className={`fa-regular fa-${id.includes('Name') ? 'id-badge' : id.includes('email') ? 'envelope' : 'lock'}`}></i>
                </span>
                <input
                  id={id}
                  type={id.includes('password') ? 'password' : 'text'}
                  className="modern-input form-control"
                  placeholder={id === 'confirmPassword' ? 'Confirm your password' : `Enter your ${id}`}
                  value={(formData as any)[id]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Continue'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '1.5rem 0', fontSize: '0.85rem', color: '#666' }}>
              <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
              <span style={{ margin: '0 0.75em' }}>OR</span>
              <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                margin: '0.5rem 0',
                borderRadius: '50px',
                border: '1px solid #ccc',
                background: '#fff',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              Sign up with Google
            </button>

            {/* Login Link */}
            <p className="mt-3 text-muted" style={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="btn-primary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none' }}
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
