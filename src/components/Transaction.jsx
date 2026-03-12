import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import Modal from './Modal'
// ส่วนของการทำงานในระบบ
export default function Transaction() {
  const { transactions, editTransaction, deleteTransaction, fetchTransactions, loading } = useStore()
  const [editModal,   setEditModal]   = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editAmount,  setEditAmount]  = useState('')
  const [editError,   setEditError]   = useState('')

  useEffect(() => { fetchTransactions() }, [])

  const openEdit = (tx) => { setEditAmount(String(tx.amount)); setEditError(''); setEditModal({ tx }) }

  const handleEditChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (Number(val) > 100000) { setEditError('ไม่เกิน 100,000 บาท'); setEditAmount('100000') }
    else { setEditError(''); setEditAmount(val) }
  }

  const confirmEdit = async () => {
    if (!editAmount || Number(editAmount) <= 0) { setEditError('กรุณากรอกจำนวนเงิน'); return }
    await editTransaction(editModal.tx.id, Number(editAmount))
    setEditModal(null)
  }

  const confirmDelete = async () => {
    await deleteTransaction(deleteModal.tx.id)
    setDeleteModal(null)
  }
// ส่วนแสดง UI
  return (
    <div>
      <h2 className="section-title">ประวัติรายการฝากถอน</h2>
      {/* ตารางประวัติรายการ */}
      <div className="table-wrapper"> 
        <table className="tx-table">
          <thead>
            <tr>
              {['Datetime', 'Amount', 'Status', 'Email', 'Action'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="no-data">กำลังโหลด...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="no-data">ยังไม่มีรายการ</td></tr>
            ) : transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.datetime}</td>
                <td>{Number(tx.amount).toLocaleString('th-TH')}</td>
                <td>
                  <span className={tx.type === 'ฝาก' ? 'badge-deposit' : 'badge-withdraw'}>
                    {tx.type}
                  </span>
                </td>
                <td>{tx.email}</td>
                <td className="action-cell">
                  {tx.type === 'ฝาก'
                    ? <button className="btn-edit"   onClick={() => openEdit(tx)}>Edit</button>
                    : <button className="btn-delete" onClick={() => setDeleteModal({ tx })}>Delete</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <p className="record-count">
          แสดง 1 ถึง {transactions.length} จาก {transactions.length} รายการ
        </p>
      )}

      {/* Edit Modal */}
      {editModal && (
        <Modal title={`แก้ไขจำนวนเงิน${editModal.tx.type}`} onConfirm={confirmEdit} onCancel={() => setEditModal(null)}>
          <p>ของวันที่ {editModal.tx.datetime}</p>
          <p>จากอีเมล {editModal.tx.email}</p>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>จำนวนเงิน *</label>
            <input
              className={editError ? 'input-error' : ''}
              type="text" inputMode="numeric"
              value={editAmount} onChange={handleEditChange}
            />
            {editError && <p className="error-msg">{editError}</p>}
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal title="ยืนยันการลบ" onConfirm={confirmDelete} onCancel={() => setDeleteModal(null)}>
          <p>จำนวนเงิน{deleteModal.tx.type} <strong>{Number(deleteModal.tx.amount).toLocaleString('th-TH')} บาท</strong></p>
          <p>ของวันที่ {deleteModal.tx.datetime}</p>
          <p>จากอีเมล {deleteModal.tx.email}</p>
        </Modal>
      )}
    </div>
  )
}