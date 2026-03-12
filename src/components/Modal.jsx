export default function Modal({ title, children, onConfirm, onCancel, confirmLabel = 'ยืนยัน' }) { 
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn-cancel"  onClick={onCancel}>ยกเลิก</button>
        </div>
      </div>
    </div>
  )
}