import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import GroupList from './components/GroupList.tsx';

interface Expense {
  id: number;
  person1: string;
  person2: string;
  description?: string; 
  amount: number;
}

const App: React.FC = () => {
  const [person1, setPerson1] = useState<string>('');
  const [person2, setPerson2] = useState<string>('');
  const [description, setDescription] = useState<string>(''); 
  const [amount, setAmount] = useState<number | ''>('');

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = () => {
    if (person1.trim() === '' || person2.trim() === '' || amount === '') {
      return;
    }

    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    if (isNaN(parsedAmount)) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      person1,
      person2,
      description,
      amount: parsedAmount,
    };

    setExpenses([...expenses, newExpense]);

    setPerson1('');
    setPerson2('');
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
    const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId);

    setExpenses(updatedExpenses);
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="App">
      <Header />
      <ExpenseForm
        person1={person1}
        person2={person2}
        description={description} 
        amount={amount}
        setPerson1={setPerson1}
        setPerson2={setPerson2}
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
