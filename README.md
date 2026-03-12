เครื่องมือที่ใช้ติดตั้ง:

 node.js v22.19.0
 PHP 8.0.30

Framework:

 React

How to run Project:

npm install,
npm install zustand

run Terminal backend:

new Terminal,
 cd backend,
 php -S localhost:8000 or php -S 0.0.0.0:8000 

run Terminal Frontend:

new Terminal,
 npm run dev

Open Browser:

 http://localhost:5173 
** run Terminal ให้ทำงานทั้ง2 

Login:

email - กรอกemail อะไรก็ได้ครับแต่ต้องมี @ .  e.g. email@ku.com
password - กรอกรหัสเข้าครั้งแรกจะเป็นการตั้งรหัส 
  *ถ้าจะloginเข้าemailเดิมอีกครั้ง ต้องใช้รหัสที่กรอกตอนเข้าครั้งแรกครับ


Structure:

Backend:
 config.php - CORS + สร้าง Database.db ,DB table users,Transactions
 login.php - จัดการเกี่ยวกับการlogin ,ส่งToken ไปให้ React
 transactions.php - GET(ดึงรายการประวัติข้อมูลฝาก ถอน) POST(บันทึกรายการฝาก ถอน ลง DB) PUT(แก้ไขจำนวนเงิน) DELETE(ลบข้อมูลออกจาก DB) ระบบฝากถอน
 database.db - SQLite

store:
 useStore.js - Zustand Store คลังเก็บข้อมูลต่างๆ        Componentsทุกตัวดึงข้อมูลจากไฟล์นี้

Frontend:
 Components:
  DepositWithdraw.jsx - input จำนวนเงิน ,ฝาก/ถอน, แสดงเงินคงเหลือ
  Login.jsx - หน้า login
  Modal.jsx - popup กลางใช้ร่วมกันทุกที่
  Transaction.jsx - แสดงประวัติรายการ ฝาก/ถอน ,แก้ไขจำนวนเงินฝากและลบรายการการถอนเงิน

api.js - ตัวกลางระหว่าง React กับ PHP, เรียกPHP api
app.jsx - Sidebar Layout Session Routing






