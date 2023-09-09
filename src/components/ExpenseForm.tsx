import React from 'react';

interface ExpenseFormProps {
  description: string;
  amount: number | '';
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setAmount: React.Dispatch<React.SetStateAction<number | ''>>;
  handleAddExpense: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  description,
  amount,
  setDescription,
  setAmount,
  handleAddExpense,
}) => {
  return (
    <div>
      <p>Description:</p>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <p>Amount:</p>
      <input
        type="number"
        placeholder="Amount"
        value={amount === '' ? '' : amount.toString()}
        onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
      />
      <button onClick={handleAddExpense}>Add Expense</button>
    </div>
  );
};

export default ExpenseForm;