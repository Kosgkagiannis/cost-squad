import React, { useState } from 'react';
import EditExpenseForm from './EditExpenseForm.tsx';

interface Expense {
  id: number;
  description: string;
  amount: number;
}

interface ExpenseListProps {
  expenses: Expense[];
  totalExpenses: number;
  onSaveExpense: (editedExpense: Expense) => void; 
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, totalExpenses, onSaveExpense }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(null);

  const handleEdit = (expense: Expense) => {
    setIsEditing(true);
    setEditedExpense(expense);
  };

  const handleSave = (editedExpense: Expense) => {
    // Update the expense in the expenses array
    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === editedExpense.id) {
        return editedExpense;
      }
      return expense;
    });

    onSaveExpense(editedExpense); // Call the onSaveExpense prop to update the parent component's state
    setIsEditing(false);
    setEditedExpense(null);
  };

  return (
    <div className="Expenses">
      <h2>Expenses</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.description}: ${expense.amount.toFixed(2)}
            <button onClick={() => handleEdit(expense)}>Edit</button>
          </li>
        ))}
      </ul>
      <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>

      {isEditing && editedExpense && (
        <EditExpenseForm
          expense={editedExpense}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
