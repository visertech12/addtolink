'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Header } from '@/components/Header'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function UserPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken') // Get your token from localStorage or cookies
    if (!token) {
      setError('No auth token found.')
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`${API_URL}/getUser.php`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.data.success && res.data.user) {
          setUser(res.data.user)
        } else {
          setError(res.data.message || 'User not found.')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch user.')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <div
      style={{
        backgroundColor: '#f0f0e6',
        minHeight: '100vh',
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // centers horizontally
        justifyContent: 'center', // centers vertically
        gap: '20px',
      }}
    >
      <Header />
      <div
        style={{
          maxWidth: '400px',
          width: '90%',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // centers avatar and text
          textAlign: 'center',
        }}
      >
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {user && (
          <>
            <img
              src={
                user.avatarUrl ||
                'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
              }
              alt={`${user.firstName} ${user.lastName}` || 'User Avatar'}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
                border: '2px solid #ccc',
              }}
            />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {user.firstName} {user.lastName}
            </h2>
            <p style={{ color: '#555', marginBottom: '0.5rem' }}>Email: {user.email}</p>
            <p style={{ color: '#555', marginBottom: '0.5rem' }}>Membership: {user.membership}</p>
          </>
        )}
      </div>
    </div>
  )
}
