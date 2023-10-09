import React, { useState, useEffect } from "react"
import PublicExpenseProps from "../../types/PublicExpenseProps"

interface EditExpenseFormProps {
  expense: PublicExpenseProps | null
  onSave: (editedExpense: PublicExpenseProps) => void
  onCancel: () => void
  onDelete?: (expenseId: string) => void
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({
  expense,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [editedPerson1, setEditedPerson1] = useState<string>("")
  const [editedPerson2, setEditedPerson2] = useState<string>("")
  const [editedAmount, setEditedAmount] = useState<number | "">("")
  const [editedDescription, setEditedDescription] = useState<
    string | undefined
  >("")

  useEffect(() => {
    if (expense) {
      setEditedPerson1(expense.person1)
      setEditedPerson2(expense.person2)
      setEditedAmount(expense.amount)
      setEditedDescription(expense.description || "")
    } else {
      setEditedPerson1("")
      setEditedPerson2("")
      setEditedAmount("")
      setEditedDescription("")
    }
  }, [expense])

  const handleSave = () => {
    if (
      editedPerson1.trim() === "" ||
      editedPerson2.trim() === "" ||
      isNaN(parseFloat(editedAmount as string)) ||
      editedDescription === undefined
    ) {
      return
    }

    const editedExpense: PublicExpenseProps = {
      id: expense ? expense.id : "",
      person1: editedPerson1,
      person2: editedPerson2,
      amount: parseFloat(editedAmount as string),
      description: editedDescription,
    }

    onSave(editedExpense)
  }

  const handleDelete = () => {
    if (expense && onDelete) {
      onDelete(expense.id.toString())
      onCancel()
    }
  }

  return (
    <div>
      <p>Person 1:</p>
      <input
        type="text"
        placeholder="Person 1"
        value={editedPerson1}
        onChange={(e) => setEditedPerson1(e.target.value)}
      />
      <p>Person 2:</p>
      <input
        type="text"
        placeholder="Person 2"
        value={editedPerson2}
        onChange={(e) => setEditedPerson2(e.target.value)}
      />
      <p>Description (optional):</p>
      <input
        type="text"
        placeholder="Description"
        value={editedDescription}
        onChange={(e) => setEditedDescription(e.target.value)}
      />
      <p>Amount:</p>
      <input
        type="number"
        placeholder="Amount"
        value={editedAmount === "" ? "" : editedAmount.toString()}
        onChange={(e) =>
          setEditedAmount(
            e.target.value === "" ? "" : parseFloat(e.target.value)
          )
        }
      />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  )
}

export default EditExpenseForm
