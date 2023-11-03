import { Timestamp } from "firebase/firestore"
export default interface QuickExpenseProps {
  id?: string
  person1: string
  person2: string
  description: string
  amount: number
  currency: string
  userId: string
  timestamp: Timestamp
}
