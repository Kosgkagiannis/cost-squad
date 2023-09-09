import React, { useState } from 'react';
import './App.css'; 
import Header from './components/Header.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import GroupList from './components/GroupList.tsx';

interface Expense {
  id: number;
  description: string;
  amount: number;
}

const App: React.FC = () => {
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = () => {
    if (description.trim() === '' || amount === '') {
      return;
    }

    // Parse amount to a number
    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    if (isNaN(parsedAmount)) {
      return;
    }

    // Generate a unique ID for the new expense
    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: parsedAmount,
    };

    setExpenses([...expenses, newExpense]);

    setDescription('');
    setAmount('');
  };

  const handleSaveExpense = (editedExpense: Expense) => {
    const editedIndex = expenses.findIndex((expense) => expense.id === editedExpense.id);

    if (editedIndex !== -1) {
      const updatedExpenses = [...expenses];

      updatedExpenses[editedIndex] = editedExpense;

      setExpenses(updatedExpenses);
    }
  };

  const handleDeleteExpense = (expenseId: number) => {
    // Filter out the expense to be deleted
    const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId);

    setExpenses(updatedExpenses);
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="App">
      <Header />
      <ExpenseForm
        description={description}
        amount={amount}
        setDescription={setDescription}
        setAmount={setAmount}
        handleAddExpense={handleAddExpense}
      />
      <ExpenseList
        expenses={expenses}
        totalExpenses={totalExpenses}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense} 
      />
      <GroupList groups={[]} />
    </div>
  );
};

export default App;
