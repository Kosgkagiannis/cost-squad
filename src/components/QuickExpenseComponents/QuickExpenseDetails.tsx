import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, doc, getDoc } from "firebase/firestore"
import { db } from "../../config/firebase"

interface Expense {
  id: string
  person1: string
  person2: string
  description: string
  amount: number
  currency: string
}

const QuickExpenseDetails: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>()
  const [expense, setExpense] = useState<Expense | null>(null)

  // Fetch the expense data based on the ID
  useEffect(() => {
    const fetchExpense = async () => {
      const expenseRef = doc(db, "expenses2", expenseId)

      try {
        const expenseSnapshot = await getDoc(expenseRef)

        if (expenseSnapshot.exists()) {
          const expenseData = expenseSnapshot.data() as Expense
          setExpense({ id: expenseId, ...expenseData })
        } else {
          setExpense(null)
        }
      } catch (error) {
        console.error("Error fetching expense: ", error)
        setExpense(null)
      }
    }

    fetchExpense()
  }, [expenseId])

  if (!expense) {
    return <div>Expense not found</div>
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
