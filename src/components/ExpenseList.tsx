import React, { useState } from "react";
import EditExpenseForm from "./EditExpenseForm.tsx";
import PublicExpenseProps from "../types/PublicExpenseProps.ts";

interface ExpenseListProps {
  expenses: PublicExpenseProps[];
  totalExpenses: number;
  onSaveExpense: (editedExpense: PublicExpenseProps) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  totalExpenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState<PublicExpenseProps | null>(
    null
  );

  const handleEdit = (expense: PublicExpenseProps) => {
    setIsEditing(true);
    setEditedExpense(expense);
  };

  const handleSave = (editedExpense: PublicExpenseProps) => {
    onSaveExpense(editedExpense);
    setIsEditing(false);
    setEditedExpense(null);
  };

  const handleDelete = (expenseId: string) => {
    onDeleteExpense(expenseId);
  };

  // Helper function to calculate net expenses
  const calculateNetExpenses = (expenses: PublicExpenseProps[]) => {
    const netExpenses: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const person1 = formatName(expense.person1);
      const person2 = formatName(expense.person2);
      const key = `${person1}-${person2}`;
      if (!(key in netExpenses)) {
        netExpenses[key] = 0;
      }

      if (person1 === person2) {
        netExpenses[key] += expense.amount;
      } else {
        netExpenses[key] += expense.amount;
        const reverseKey = `${person2}-${person1}`;
        if (reverseKey in netExpenses) {
          netExpenses[key] -= netExpenses[reverseKey];
          delete netExpenses[reverseKey];
        }
      }
    });

    return netExpenses;
  };

  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const netExpenses = calculateNetExpenses(expenses);

  return (
    <div className="Expenses">
      <h2>Expenses</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            <p>
              {formatName(expense.person1)} owes {formatName(expense.person2)}:
              ${expense.amount} - {expense.description || ""}
            </p>
            <button onClick={() => handleEdit(expense)}>Edit</button>
            <button onClick={() => onDeleteExpense(expense.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <p>
        Total Expenses: $
        {typeof totalExpenses === "number" ? totalExpenses.toFixed(2) : "N/A"}
      </p>

      {isEditing && editedExpense && (
        <EditExpenseForm
          expense={editedExpense}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <h2>Net Expenses</h2>
      <ul>
        {Object.entries(netExpenses).map(([key, netAmount]) => {
          const [person1, person2] = key.split("-");
          const isOwed = netAmount < 0;
          const displayAmount = Math.abs(netAmount).toFixed(2);

          return (
            <li key={key}>
              <p>
                {isOwed ? formatName(person2) : formatName(person1)} owes{" "}
                {isOwed ? formatName(person1) : formatName(person2)}: $
                {displayAmount}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExpenseList;
