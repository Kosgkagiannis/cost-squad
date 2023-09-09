import React, { useState } from 'react';

interface Expense {
  id: number;
  description: string;
  amount: number;
}

interface EditExpenseFormProps {
  expense: Expense | null;
  onSave: (editedExpense: Expense) => void;
  onCancel: () => void;
  onDelete: (expenseId: number) => void;
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({
  expense,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [editedDescription, setEditedDescription] = useState<string>(expense?.description || '');
  const [editedAmount, setEditedAmount] = useState<number | ''>(expense?.amount || '');

  const handleSave = () => {
    // Validate and save the edited expense
    if (editedDescription.trim() === '' || editedAmount === '') {
      return;
    }

    const editedExpense: Expense = {
      id: expense?.id || 0,
      description: editedDescription,
      amount: typeof editedAmount === 'number' ? editedAmount : parseFloat(editedAmount),
    };

    onSave(editedExpense);
  };

  const handleDelete = () => {
    if (expense) {
      onDelete(expense.id);
      onCancel();
    }
  };

  return (
    <div>
      <p>Description:</p>
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
        value={editedAmount === '' ? '' : editedAmount.toString()}
        onChange={(e) => setEditedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
      />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default EditExpenseForm;
