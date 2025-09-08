'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sidebarRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchUser() {
      try {
        const res = await axios.get(`${API_URL}/me.php`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data.success) {
          setUser(res.data.user)
        } else {
          localStorage.removeItem('authToken')
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem('authToken')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    router.push('/login')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Close sidebar/profile/search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) setSidebarOpen(false)
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '60px',
        backgroundColor: '#5f462d',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 1rem',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        {/* Left: Logo + Sidebar toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ fontSize: '1.5rem', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <Link href="/" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'inherit', textDecoration: 'none' }}>
            <i className="fa-solid fa-bookmark"></i> Ideana
          </Link>
        </div>

        {/* Right: Search + Profile/Login */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            {/* Search icon */}
            {user && (
              <button onClick={() => setSearchOpen(true)} style={{ fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            )}

            {/* Search overlay */}
            {searchOpen && (
              <div ref={searchRef} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '60px',
                background: '#5f462d',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                zIndex: 1100
              }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%' }}>
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc' }} autoFocus />
                  <button type="submit" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#fff', color: '#5f462d', fontWeight: 600, cursor: 'pointer' }}>Go</button>
                  <button type="button" onClick={() => setSearchOpen(false)} style={{ marginLeft: '0.5rem', padding: '0.5rem', border: 'none', background: 'transparent', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </form>
              </div>
            )}

            {/* User profile dropdown or Login button */}
            {user ? (
              <div ref={profileRef} style={{ position: 'relative' }}>
                <img src={user.avatarUrl || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}
                  alt="User Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #fff', cursor: 'pointer' }}
                  onClick={() => setProfileOpen(!profileOpen)}
                />
                {profileOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
                    background: '#fff',
                    color: '#000',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #eee', fontWeight: 500 }}>
                      {user.firstName} {user.lastName} <br />
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>{user.membership} Member</span>
                    </div>
                    <Link href="/profile" style={{ display: 'block', padding: '0.5rem 1rem', borderBottom: '1px solid #eee', color: '#000', textDecoration: 'none' }}>Profile</Link>
                    <button onClick={logout} style={{ width: '100%', padding: '0.5rem 1rem', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#000' }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#fff', color: '#5f462d', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}

      {/* Sidebar */}
      <div ref={sidebarRef} style={{
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : '-260px',
        width: '250px',
        maxWidth: '80%',
        height: '100%',
        background: '#5f462d',
        color: '#fff',
        padding: '1rem',
        transition: 'left 0.3s ease',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button onClick={() => setSidebarOpen(false)} style={{ alignSelf: 'flex-end', fontSize: '1.2rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h3 style={{ marginBottom: '1rem' }}>Menu</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
          <Link href="/bookmarks" style={{ textDecoration: 'none', color: pathname === '/bookmarks' ? 'yellow' : '#fff' }}>Bookmarks</Link>
          <Link href="/membership" style={{ textDecoration: 'none', color: pathname === '/membership' ? 'yellow' : '#fff' }}>Membership</Link>
          {user && <Link href="/profile" style={{ textDecoration: 'none', color: pathname === '/profile' ? 'yellow' : '#fff' }}>Profile</Link>}
        </nav>
      </div>
    </>
  )
}
