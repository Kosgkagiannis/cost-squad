import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import QuickExpenseProps from "../../types/QuickExpenseTypes/PublicExpenseProps"
import { format } from "date-fns"

const QuickExpenseDetails: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>()
  const [expense, setExpense] = useState<QuickExpenseProps | null>(null)
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
            const expenseData = expenseSnapshot.data() as QuickExpenseProps

            if (expenseData.userId === userId) {
              setExpense({ id: expenseId, ...expenseData })
            } else {
              setExpense(null)
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
  }, [expenseId, navigate])

  const handleDeleteExpense = async () => {
    if (expense) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this expense?"
      )

      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, "expenses2", expense.id))
          navigate("/quick-expense")
        } catch (error) {
          console.error("Error deleting expense: ", error)
        }
      }
    }
  }

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
      <p>
        Date and Time:{" "}
        {format(expense.timestamp.toDate(), "do MMMM yyyy - HH:mm:ss")}
      </p>
      <button onClick={handleDeleteExpense}>Delete</button>
    </div>
  )
}

export default QuickExpenseDetails
