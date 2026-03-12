const BASE_URL = `http://${window.location.hostname}:8000` // เชื่อมต่อกับ backend ที่รันอยู่บน port 8000 ของเครื่องเดียวกัน
// ฟังก์ชันช่วยเหลือในการดึง token จาก localStorage และสร้าง headers สำหรับการเรียก API ที่ต้องการการยืนยันตัวตน
function getToken() {
  return localStorage.getItem('token') || ''
}
// สร้าง headers สำหรับการเรียก API ที่ต้องการการยืนยันตัวตน โดยรวม token ใน Authorization header
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}
// ฟังก์ชัน API สำหรับการเข้าสู่ระบบ การดึงรายการธุรกรรม การเพิ่ม แก้ไข และลบรายการธุรกรรม
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}
// ดึงรายการธุรกรรมทั้งหมดของผู้ใช้ที่เข้าสู่ระบบอยู่ โดยส่ง token ไปใน headers เพื่อยืนยันตัวตน
export async function apiGetTransactions() {
  const res = await fetch(`${BASE_URL}/transactions.php`, {
    headers: authHeaders(),
  })
  return res.json()
}
// เพิ่มรายการธุรกรรมใหม่ โดยส่งข้อมูล(ฝากหรือถอน) ไปที่ backend และรับข้อมูลรที่เพิ่มเข้ามาและแสดงเงินคงเหลือใหม่
export async function apiAddTransaction(amount, type) {
  const res = await fetch(`${BASE_URL}/transactions.php`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount, type }),
  })
  return res.json()
}
// แก้ไขรายการธุรกรรมที่มีอยู่ โดยส่งข้อมูลจำนวนเงินใหม่ไปที่ backend พร้อมกับ id ของรายการที่ต้องการแก้ไข และรับข้อมูลยอดเงินคงเหลือใหม่
export async function apiEditTransaction(id, amount) {
  const res = await fetch(`${BASE_URL}/transactions.php?id=${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  })
  return res.json()
}
// ลบรายการธุรกรรมที่มีอยู่ โดยส่ง id ของรายการที่ต้องการลบไปที่ backend และรับข้อมูลยอดเงินคงเหลือใหม่
export async function apiDeleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions.php?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return res.json()
}
