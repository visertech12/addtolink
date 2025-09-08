'use client'
import Link from 'next/link'
import '@/styles/bookmark-manager.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Header } from '@/components/Header' // ✅ Add Header

interface User {
  firstName: string
  lastName: string
  email: string
  membership: string
  avatarUrl?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState('https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg')

  // Check auth & fetch user
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    async function fetchUser() {
      try {
        const res = await axios.get(`${API_URL}/me.php`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setUser(res.data.user)
          if (res.data.user.avatarUrl) setAvatarPreview(res.data.user.avatarUrl)
        } else {
          // Invalid token, redirect to login
          localStorage.removeItem('authToken')
          router.push('/login')
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem('authToken')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarPreview(URL.createObjectURL(e.target.files[0]))
      // TODO: upload new avatar to server
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</p>
  if (!user) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>User not found.</p>

  return (
    <div className="bookmark-manager">
      {/* Header */}      <Header />

      <header className="bookmark-header">
        <div className="header-container">
          <h1 className="bookmark-headerh1">Profile</h1>
          <p className="bookmark-headerp">
            <i className="fa-regular fa-user"></i>
            Welcome back, {user.firstName}!
            <i className="fa-regular fa-user"></i>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-wrapper">
        <div className="main-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="bookmark-inputs profile-info" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            
            {/* Profile Image */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--main-color)'
                  }}
                />
                <label
                  htmlFor="avatarUpload"
                  style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    background: 'var(--main-color)',
                    color: 'var(--secondary-color)',
                    borderRadius: '20px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  Change
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Name */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-id-badge"></i></span>
              <input
                type="text"
                className="modern-input form-control"
                value={`${user.firstName} ${user.lastName}`}
                readOnly
              />
            </div>

            {/* Email */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-envelope"></i></span>
              <input
                type="email"
                className="modern-input form-control"
                value={user.email}
                readOnly
              />
            </div>

            {/* Membership */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-star"></i></span>
              <input
                type="text"
                className="modern-input form-control"
                value={`Membership: ${user.membership}`}
                readOnly
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <Link href="/profile/edit" className="submit-btn">Edit Profile</Link>
              <button className="submit-btn" style={{ background: '#dc3545' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
