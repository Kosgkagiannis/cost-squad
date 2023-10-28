import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import { useNavigate } from "react-router-dom"

interface Expense {
  id: string
  person1: string
  person2: string
  description: string
  amount: number
  currency: string
  userId: string
}

const QuickExpenseDetails: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userId = user.uid
        const expenseRef = doc(db, "expenses2", expenseId)

        try {
          const expenseSnapshot = await getDoc(expenseRef)

          if (expenseSnapshot.exists()) {
            const expenseData = expenseSnapshot.data() as Expense

            if (expenseData.userId === userId) {
              setExpense({ id: expenseId, ...expenseData })
            } else {
              setExpense(null) // Expense doesn't belong to the user
            }
          } else {
            setExpense(null)
          }
        } catch (error) {
          console.error("Error fetching expense: ", error)
          setExpense(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [expenseId])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!expense) {
    return <div>Expense not found or unauthorized</div>
  }

  return (
    <div>
      <h2>Expense Details</h2>
      <p>Person 1: {expense.person1}</p>
      <p>Person 2: {expense.person2}</p>
      {expense.description && <p>Description: {expense.description}</p>}
      <p>
        Amount: {expense.amount} {expense.currency}
      </p>
    </div>
  )
}

export default QuickExpenseDetails
