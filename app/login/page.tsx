'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '@/styles/bookmark-manager.css'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isForgotMode, setIsForgotMode] = useState(false) // <-- toggle forgot mode

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

  // Email/password login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/login.php`, {
        email: formData.email,
        password: formData.password
      })

      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user))
        router.push('/')
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password submit
  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/forgot_password.php`, {
        email: formData.email
      })

      if (response.data.success) {
        setSuccess('Password reset instructions sent to your email.')
      } else {
        setError(response.data.message || 'Failed to send reset email.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/google-auth.php`
  }

  return (
    
    <div className="bookmark-manager">
      <header className="bookmark-header">
        <div className="header-container">
          <h1 className="bookmark-headerh1">{isForgotMode ? 'Forgot Password' : 'Welcome back'}</h1>
          <p className="bookmark-headerp">
            <i className="fa-regular fa-user"></i>{' '}
            {isForgotMode ? 'Enter your email to reset password' : 'Please enter your credentials'}{' '}
            <i className="fa-regular fa-user"></i>
          </p>
        </div>
      </header>
      <Header />

      <main className="main-wrapper">
        <div className="main-container">
          {isForgotMode ? (
            <form className="bookmark-inputs login-form" onSubmit={handleForgotSubmit}>
              {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
              {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

              <div className="modern-input-group">
                <span className="input-icon"><i className="fa-regular fa-envelope"></i></span>
                <input
                  id="email"
                  type="email"
                  className="modern-input form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p
                style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: '#555' }}
                onClick={() => setIsForgotMode(false)}
              >
                Back to Login
              </p>
            </form>
          ) : (
            <form className="bookmark-inputs login-form" onSubmit={handleLoginSubmit}>
              {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

              {/* Email */}
              <div className="modern-input-group">
                <span className="input-icon"><i className="fa-regular fa-envelope"></i></span>
                <input
                  id="email"
                  type="email"
                  className="modern-input form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="modern-input-group">
                <span className="input-icon"><i className="fa-regular fa-lock"></i></span>
                <input
                  id="password"
                  type="password"
                  className="modern-input form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Forgot Password */}
              <p
                style={{ textAlign: 'center', marginTop: '0.75rem', cursor: 'pointer', color: '#555' }}
                onClick={() => setIsForgotMode(true)}
              >
                Forgot Password?
              </p>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '1.5rem 0', fontSize: '0.85rem', color: '#666' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
                <span style={{ margin: '0 0.75em' }}>OR</span>
                <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
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
                Sign in with Google
              </button>

              {/* Register Link */}
              <p className="mt-3 text-muted" style={{ textAlign: 'center' }}>
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="btn-primary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none' }}
                >
                  Register
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
