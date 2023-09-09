import React from 'react';

interface ExpenseFormProps {
  person1: string;
  person2: string;
  description: string; 
  amount: number | '';
  setPerson1: React.Dispatch<React.SetStateAction<string>>;
  setPerson2: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>; 
  setAmount: React.Dispatch<React.SetStateAction<number | ''>>;
  handleAddExpense: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  person1,
  person2,
  description,
  amount,
  setPerson1,
  setPerson2,
  setDescription,
  setAmount,
  handleAddExpense,
}) => {
  return (
    <div>
      <p>Person 1:</p>
      <input
        type="text"
        placeholder="Person 1"
        value={person1}
        onChange={(e) => setPerson1(e.target.value)}
      />
      <p>Person 2:</p>
      <input
        type="text"
        placeholder="Person 2"
        value={person2}
        onChange={(e) => setPerson2(e.target.value)}
      />
      <p>Description (optional):</p>
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
        onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
      />
      <button onClick={handleAddExpense}>Add Expense</button>
    </div>
  );
};

export default ExpenseForm;
