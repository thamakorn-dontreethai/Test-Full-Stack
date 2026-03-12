import { create } from 'zustand' 
import {
  apiGetTransactions,
  apiAddTransaction,
  apiEditTransaction,
  apiDeleteTransaction,
} from '../api' // นำเข้า API ฟังก์ชันสำหรับการจัดการธุรกรรมจากไฟล์ api.js

const useStore = create((set) => ({
  balance: 1000000,  
  transactions: [],
  loading: false,
//โหลดข้อมูลจาก backend php มาแสดงในหน้า Transaction
  fetchTransactions: async () => {
    set({ loading: true })
    const data = await apiGetTransactions()
    if (data.success) {
      set({ transactions: data.transactions, //รายการ ฝาก ถอน 
            balance: data.balance,  //ยอดเงินคงเหลือ
            loading: false })
    } else {
      set({ loading: false })
    }
  },
//เพิ่มรายการ ฝาก ถอน โดยส่งข้อมูลไปที่ backend php และอัพเดตข้อมูลใน store
  addTransaction: async (amount, type) => {
    const data = await apiAddTransaction(amount, type)
    if (data.success) {
      set(state => ({
        transactions: [data.transaction, ...state.transactions],
        balance: data.balance, //อัพเดตยอดเงินคงเหลือหลังจากเพิ่มรายการใหม่
      }))
    }
    return data
  },
//ส่วนแก้ไขรายการ ฝาก ถอน โดยส่งข้อมูลไปที่ backend php และอัพเดตข้อมูลใน store
  editTransaction: async (id, newAmount) => {
    const data = await apiEditTransaction(id, newAmount)
    if (data.success) {
      set(state => ({
        transactions: state.transactions.map(tx =>
          tx.id === id ? { ...tx, amount: newAmount } : tx
        ),
        balance: data.balance, //อัพเดตยอดเงินคงเหลือหลังจากแก้ไขรายการ
      }))
    }
    return data
  },
  //ส่วนลบรายการ ฝาก ถอน โดยส่งข้อมูลไปที่ backend php และอัพเดตข้อมูลใน store
  deleteTransaction: async (id) => {
    const data = await apiDeleteTransaction(id)
    if (data.success) {
      set(state => ({
        transactions: state.transactions.filter(tx => tx.id !== id),
        balance: data.balance, //อัพเดตยอดเงินคงเหลือหลังจากลบรายการ
      }))
    }
    return data
  },
}))

export default useStore
