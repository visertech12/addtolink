'use client'
export const dynamic = "force-dynamic"; // ✅ prevent prerendering

import { Header } from '@/components/Header'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface UserResult {
  id: number
  full_name: string
  avatar_url?: string
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams?.get('query') || '' // ✅ safe optional chaining
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) return

    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        // ✅ guard localStorage (only in browser)
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('authToken')
          : null

        const res = await axios.get(`${API_URL}/searchUsers.php`, {
          params: { q: query },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (res.data.success) {
          setResults(res.data.users)
        } else {
          setResults([])
          setError('No results found.')
        }
      } catch (err) {
        console.error(err)
        setResults([])
        setError('Failed to fetch results.')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#f0f0e6' }}>
      <Header />

      <div style={{ padding: '80px 20px 20px 20px', maxWidth: '600px', margin: '0 auto', borderRadius: '8px' }}>
        <h1 style={{ color: '#000' }}>Search Users for "{query}"</h1>

        {loading && <p style={{ color: '#000' }}>Loading...</p>}
        {error && <p style={{ color: '#000' }}>{error}</p>}
        {!loading && results.length === 0 && !error && <p style={{ color: '#000' }}>No users found.</p>}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {results.map((user) => (
            <li
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '8px',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={
                    user.avatar_url ||
                    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                  }
                  alt={user.full_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ color: '#000' }}>{user.full_name}</span>
              </div>

              <button
                onClick={() => router.push(`/user/name/${user.id}`)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#5f462d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
