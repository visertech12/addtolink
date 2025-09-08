// app/profile/edit/page.tsx
'use client'
import Link from 'next/link'
import '@/styles/bookmark-manager.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface User {
  firstName: string
  lastName: string
  email: string
  membership: string
  avatarUrl?: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('/default-avatar.png')
  const [formData, setFormData] = useState({ firstName: '', lastName: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch user
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
          setFormData({ firstName: res.data.user.firstName, lastName: res.data.user.lastName })
          if (res.data.user.avatarUrl) setAvatarPreview(res.data.user.avatarUrl)
        } else {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')
    const token = localStorage.getItem('authToken')
    const payload = new FormData()
    payload.append('first_name', formData.firstName)
    payload.append('last_name', formData.lastName)
    if ((document.getElementById('avatarUpload') as HTMLInputElement).files?.[0]) {
      payload.append('avatar', (document.getElementById('avatarUpload') as HTMLInputElement).files[0])
    }

    try {
      const res = await axios.post(`${API_URL}/update_profile.php`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        setSuccess('Profile updated successfully')
        router.refresh() // optional: refresh profile page
      } else {
        setError(res.data.message || 'Update failed')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
  if (!user) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>User not found.</p>

  return (
    <div className="bookmark-manager">
      <header className="bookmark-header">
        <div className="header-container">
          <h1 className="bookmark-headerh1">Edit Profile</h1>
          <p className="bookmark-headerp">
            <i className="fa-regular fa-user"></i>
            Update your profile information
            <i className="fa-regular fa-user"></i>
          </p>
        </div>
      </header>

      <main className="main-wrapper">
        <div className="main-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <form className="bookmark-inputs profile-info" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }} onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* Avatar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--main-color)' }}
                />
                <label
                  htmlFor="avatarUpload"
                  style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', background: 'var(--main-color)', color: 'var(--secondary-color)', borderRadius: '20px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: '500' }}
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

            {/* First Name */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-id-badge"></i></span>
              <input type="text" id="firstName" className="modern-input form-control" value={formData.firstName} onChange={handleChange} required />
            </div>

            {/* Last Name */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-id-badge"></i></span>
              <input type="text" id="lastName" className="modern-input form-control" value={formData.lastName} onChange={handleChange} required />
            </div>

            {/* Email (readonly) */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-envelope"></i></span>
              <input type="email" className="modern-input form-control" value={user.email} readOnly />
            </div>

            {/* Membership (readonly) */}
            <div className="modern-input-group">
              <span className="input-icon"><i className="fa-regular fa-star"></i></span>
              <input type="text" className="modern-input form-control" value={`Membership: ${user.membership}`} readOnly />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button className="submit-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <Link href="/profile" className="submit-btn" style={{ background: '#6c757d' }}>Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
