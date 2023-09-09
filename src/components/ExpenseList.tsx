import React, { useState } from 'react';
import EditExpenseForm from './EditExpenseForm.tsx';
import Expense from '../types/Expense.ts';

interface ExpenseListProps {
  expenses: Expense[];
  totalExpenses: number;
  onSaveExpense: (editedExpense: Expense) => void;
  onDeleteExpense: (expenseId: number) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  totalExpenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(null);

  const handleEdit = (expense: Expense) => {
    setIsEditing(true);
    setEditedExpense(expense);
  };

  const handleSave = (editedExpense: Expense) => {
    onSaveExpense(editedExpense);
    setIsEditing(false);
    setEditedExpense(null);
  };

  const handleDelete = (expenseId: number) => {
    onDeleteExpense(expenseId);
  };

  return (
    <div className="Expenses">
      <h2>Expenses</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.person1} owes {expense.person2}: {expense.description && `${expense.description} - `}
            ${expense.amount.toFixed(2)}
            <button onClick={() => handleEdit(expense)}>Edit</button>
          </li>
        ))}
      </ul>
      <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>

      {isEditing && editedExpense && (
        <EditExpenseForm
          expense={editedExpense}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {editedExpense && editedExpense.description && (
        <p>Description: {editedExpense.description}</p>
      )}
    </div>
  );
};

export default ExpenseList;
