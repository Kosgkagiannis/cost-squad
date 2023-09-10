import React, { useEffect, useState } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { db, auth, storage } from './config/firebase';
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import publicExpenseProps from './types/PublicExpenseProps';
import Header from './components/Header';

interface Expense {
  id: number;
  person1: string;
  person2: string;
  description?: string;
  amount: number;
}

function App() {
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0); 

  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const expensesCollectionRef = collection(db, 'expenses');

  const getExpenseList = async () => {
    try {
      const data = await getDocs(expensesCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      setExpenseList(filteredData as Expense[]);
      const total = calculateTotalExpenses(filteredData as Expense[]);
      setTotalExpenses(total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getExpenseList();
  }, []);

  const handleAddExpense = async () => {
    try {
      await addDoc(expensesCollectionRef, {
        person1,
        person2,
        description,
        amount,
        timestamp: new Date().toISOString(),
      });
      getExpenseList();
      setPerson1('');
      setPerson2('');
      setDescription('');
      setAmount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditExpense = async (editedExpense: Expense) => {
    try {
      const expenseDocRef = doc(db, 'expenses', editedExpense.id.toString());
      await updateDoc(expenseDocRef, editedExpense as DocumentData);
      getExpenseList();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotalExpenses = (expenses: Expense[]) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      const expenseDocRef = doc(db, 'expenses', expenseId.toString());
      await deleteDoc(expenseDocRef);
      getExpenseList(); 
    } catch (err) {
      console.error(err);
    }
  };

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

      <div>
        <ExpenseList
          expenses={expenseList}
          totalExpenses={totalExpenses}
          onSaveExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense} 
        />
      </div>
    </div>
  );
}

export default App;
