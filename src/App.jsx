import { useState} from 'react'
import Login from './components/Login'
import DepositWithdraw from './components/DepositWithdraw'
import Transaction from './components/Transaction'

export default function App() {
  const [session, setSession] = useState(() => {
  const saved = localStorage.getItem('session')
  return saved ? JSON.parse(saved) : null
})
  const [activeMenu, setActiveMenu] = useState('deposit')
  const [menuOpen, setMenuOpen]   = useState(false)


  const handleLogin  = (email) => setSession({ email })
  const handleLogout = () => {
    localStorage.removeItem('session')
    localStorage.removeItem('token')
    setSession(null)
  }

  if (!session) return <Login onLogin={handleLogin} />
// ส่วนของการแสดงผลเมื่อเข้าสู่ระบบแล้ว
  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <span className="logo">Clicknext</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </header>

      <div className="main-container">
        {/* Sidebar overlay*/}
        {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          {[
            { key: 'deposit',     label: 'Deposit / Withdraw' },
            { key: 'transaction', label: 'Transaction' },
          ].map(m => (
            <button
              key={m.key}
              className={`menu-item ${activeMenu === m.key ? 'active' : ''}`}
              onClick={() => { setActiveMenu(m.key); setMenuOpen(false) }}
            >
              {m.label}
            </button>
          ))}
          {/* Close */}
   <button
    className="btn-close-sidebar"
    style={{ marginTop: 'auto', color: '#050505' }}
    onClick={() => setMenuOpen(false)}
   >Close
    </button>
   </aside>

        {/* Content */}
        <main className="content">
          {activeMenu === 'deposit'
            ? <DepositWithdraw email={session.email} />
            : <Transaction />}
        </main>
      </div>
    </div>
  )
}

