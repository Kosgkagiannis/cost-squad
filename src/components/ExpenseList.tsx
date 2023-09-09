import React, { useState } from 'react';
import EditExpenseForm from './EditExpenseForm.tsx';
import publicExpenseProps from '../types/PublicExpenseProps.ts';

interface ExpenseListProps {
  expenses: publicExpenseProps[];
  totalExpenses: number;
  onSaveExpense: (editedExpense: publicExpenseProps) => void;
  onDeleteExpense: (expenseId: number) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  totalExpenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState<publicExpenseProps | null>(null);

  const handleEdit = (expense: publicExpenseProps) => {
    setIsEditing(true);
    setEditedExpense(expense);
  };

  const handleSave = (editedExpense: publicExpenseProps) => {
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
    </div>
  );
};

export default ExpenseList;
