import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import Modal from './Modal'
//ส่วนของการทำงาน
export default function DepositWithdraw() {
  const { balance, addTransaction, fetchTransactions } = useStore()
  const [amount, setAmount] = useState('')
  const [modal, setModal]   = useState(null)
  const [error, setError]   = useState('')

  useEffect(() => { fetchTransactions() }, [])
// input จำนวนเงิน
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (Number(val) > 100000) { setError('ไม่เกิน 100,000 บาท'); setAmount('100000') }
    else { setError(''); setAmount(val) }
  }

  const handleAction = (type) => {
    if (!amount || Number(amount) <= 0) { setError('กรุณากรอกจำนวนเงิน'); return }
    setModal({ type })
  }

  const handleConfirm = async () => {
    const num = Number(amount)
    if (modal.type === 'ถอน' && num > balance) { setError('ยอดเงินไม่เพียงพอ'); setModal(null); return }
    await addTransaction(num, modal.type)
    setAmount('')
    setModal(null)
  }
// ส่วนแสดง UI
  return (
    <div className="page-content">
      <div className="balance-text">
        จำนวนเงินคงเหลือ <strong>{balance.toLocaleString('th-TH')} บาท</strong>
      </div>
{/* input */} 
      <div className="form-group">
        <label>จำนวนเงิน *</label>
        <input
          className={error ? 'input-error' : ''}
          type="text" inputMode="numeric"
          placeholder="กรอกจำนวนเงิน"
          value={amount} onChange={handleAmountChange}
        />
        {error && <p className="error-msg">{error}</p>}
      </div>

      <div className="btn-group">
        <button className="btn-deposit"  onClick={() => handleAction('ฝาก')}>ฝาก</button>
        <button className="btn-withdraw" onClick={() => handleAction('ถอน')}>ถอน</button>
      </div>

      {modal && (
        <Modal title="ยืนยันการฝาก-ถอน" onConfirm={handleConfirm} onCancel={() => setModal(null)}>
          <p>จำนวนเงิน <strong>{Number(amount).toLocaleString('th-TH')} บาท</strong></p>
        </Modal>
      )}
    </div>
  )
}