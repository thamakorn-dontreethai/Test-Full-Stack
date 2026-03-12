import { useState } from 'react'
import { apiLogin } from '../api'

// ส่วนของการทำงาน 
export default function Login({ onLogin }) { 
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    const errs = {}
    if (!email) errs.email = 'กรุณากรอกอีเมล'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'รูปแบบอีเมลไม่ถูกต้อง' // ตรวจสอบรูปแบบอีเมล
    if (!password) errs.password = 'กรุณากรอกรหัสผ่าน'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('session', JSON.stringify({ email: data.email }))
        onLogin(data.email)
      } else {
        setErrors({ general: data.message })
      }
    } catch {
      setErrors({ general: 'ไม่สามารถเชื่อมต่อ Server ได้' }) // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อกับ backend
    }
    setLoading(false)
  }
// ui หน้า login
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {errors.general && <p className="error-msg" style={{ marginBottom: 12 }}>{errors.general}</p>}

        <div className="form-group">
          <label>Email *</label>
          <input
            className={errors.email ? 'input-error' : ''}
            type="text" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            className={errors.password ? 'input-error' : ''}
            type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        <button className="btn-login" onClick={handleSubmit} disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
        </button>
      </div>
    </div>
  )
}