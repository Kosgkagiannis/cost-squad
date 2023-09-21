import React, { useEffect, useState } from 'react';
import './App.css';
import { User } from 'firebase/auth';
import { auth, db } from './config/firebase';
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query as firestoreQuery,
  where,
  DocumentData,
} from 'firebase/firestore';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';
import LoginRegister from './components/LoginRegister';
import publicExpenseProps from './types/PublicExpenseProps';

interface Expense {
  id: string;
  person1: string;
  person2: string;
  description: string;
  amount: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); 

  const handleUserLogin = async () => {
    setUser(auth.currentUser);
    await getExpenseList(); 
  };
  

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setExpenseList([]); 
      setTotalExpenses(0);
    } catch (err) {
      console.error(err);
    }
  };
  
  
  const getExpenseList = async () => {
    try {
      if (!user) {
        return;
      }
  
      const expensesCollectionRef = collection(db, 'expenses');
      const query = firestoreQuery(expensesCollectionRef, where('userId', '==', user.uid));
      const data = await getDocs(query);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
      })) as any[];
  
      setExpenseList(filteredData as Expense[]);
      const total = calculateTotalExpenses(filteredData as Expense[]);
      setTotalExpenses(total);
    } catch (err) {
      console.error(err);
    }
  };
  
  
  useEffect(() => {
    const fetchExpenseList = async () => {
      try {
        if (!user) {
          return;
        }
  
        const expensesCollectionRef = collection(db, 'expenses');
        const query = firestoreQuery(expensesCollectionRef, where('userId', '==', user.uid));
        const data = await getDocs(query);
        const filteredData = data.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Record<string, any>),
        })) as any[];
  
        setExpenseList(filteredData as Expense[]);
        const total = calculateTotalExpenses(filteredData as Expense[]);
        setTotalExpenses(total);
      } catch (err) {
        console.error(err);
      }
    };
  
    // Check if a user is already logged in
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchExpenseList();
      }
  
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, [user]);
  
  
  const handleAddExpense = async () => {
    try {
      
      if (!user) {
        return; 
      }

      const expensesCollectionRef = collection(db, 'expenses');
      await addDoc(expensesCollectionRef, {
        userId: user.uid,
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

  const handleEditExpense = async (editedExpense: publicExpenseProps) => {
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

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const expenseDocRef = doc(db, 'expenses', expenseId);
      await deleteDoc(expenseDocRef);
      getExpenseList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <Header />
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
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
      ) : (
        <LoginRegister onUserLogin={handleUserLogin} />
      )}
    </div>
  );
}

export default App;
