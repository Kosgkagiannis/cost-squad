import React, { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { allCurrencies } from "../GlobalComponents/currencies"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"

interface Expense {
  id?: string
  person1: string
  person2: string
  description: string
  amount: number
  currency: string
  userId: string
}

const QuickExpense: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [person1, setPerson1] = useState<string>("")
  const [person2, setPerson2] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("")
  const [person1Error, setPerson1Error] = useState<string>("")
  const [person2Error, setPerson2Error] = useState<string>("")
  const [amountError, setAmountError] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [currencyError, setCurrencyError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const expensesCollection = collection(db, "expenses2")

  const handleAddExpense = async () => {
    setPerson1Error("")
    setPerson2Error("")
    setAmountError("")
    setErrorMessage("")

    if (!person1) {
      setPerson1Error("Please enter a name for person 1")
    }

    if (!person2) {
      setPerson2Error("Please enter a name for person 2")
    }

    if (!amount || amount <= 0) {
      setAmountError("Please enter a valid amount")
    }

    if (!person1 || !person2 || !amount || amount <= 0) {
      return
    }

    if (!currency) {
      setCurrencyError("Please select a currency")
      return
    }

    const user = auth.currentUser
    if (user) {
      // Check if the currency matches for previous expenses between the same people
      const matchingExpenses = expenses.filter(
        (expense) =>
          (expense.person1 === person1 && expense.person2 === person2) ||
          (expense.person1 === person2 && expense.person2 === person1)
      )

      if (
        matchingExpenses.length > 0 &&
        matchingExpenses[0].currency !== currency
      ) {
        setErrorMessage(
          "Currency not the same as the one used in the previous expense!"
        )
        return
      }

      const newExpense: Expense = {
        person1,
        person2,
        description,
        amount,
        currency,
        userId: user.uid,
      }

      try {
        const docRef = await addDoc(expensesCollection, newExpense)
        setExpenses([...expenses, { id: docRef.id, ...newExpense }])
        setPerson1("")
        setPerson2("")
        setDescription("")
        setAmount(0)
        setErrorMessage("")
        setCurrencyError("")
        fetchExpensesAndCalculateDebts(user.uid)
      } catch (error) {
        console.error("Error adding expense: ", error)
      }
    }
  }

  const fetchExpensesAndCalculateDebts = async () => {
    const user = auth.currentUser
    if (user) {
      const userId = user.uid
      const q = query(expensesCollection, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const expensesData: Expense[] = []
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() })
      })

      setExpenses(expensesData)
      const netDebts = calculateNetDebts(expensesData)
      updateNetDebtsUI(netDebts)
    }
  }

  function capitalizeName(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  const calculateNetDebts = (expensesData: Expense[]) => {
    const netDebts: Record<string, { amount: number; currency: string }> = {}

    expensesData.forEach((expense) => {
      const person1 = capitalizeName(expense.person1)
      const person2 = capitalizeName(expense.person2)
      const key1 = `${person1}-${person2}`
      const key2 = `${person2}-${person1}`
      const currency = expense.currency

      if (netDebts[key1]) {
        netDebts[key1].amount += expense.amount
      } else if (netDebts[key2]) {
        netDebts[key2].amount -= expense.amount
      } else {
        netDebts[key1] = { amount: expense.amount, currency }
      }
    })

    return netDebts
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteDoc(doc(expensesCollection, expenseId))
      setExpenses(expenses.filter((expense) => expense.id !== expenseId))
      fetchExpensesAndCalculateDebts()
    } catch (error) {
      console.error("Error deleting expense: ", error)
    }
  }

  const updateNetDebtsUI = (
    netDebts: Record<string, { amount: number; currency: string }>
  ) => {
    const debtList = []

    for (const key in netDebts) {
      if (netDebts[key].amount !== 0) {
        const [person1, person2] = key.split("-")
        const amount = netDebts[key].amount
        const currency = netDebts[key].currency
        const debtDescription =
          amount > 0
            ? `${person1} owes ${amount} ${currency} to ${person2}`
            : `${person2} owes ${-amount} ${currency} to ${person1}`
        debtList.push(debtDescription)
      }
    }

    const netDebtsElement = document.getElementById("netDebts")
    if (netDebtsElement) {
      netDebtsElement.innerHTML = debtList.length
        ? `<ul>${debtList
            .map((debt, index) => `<li key=${index}>${debt}</li>`)
            .join("")}</ul>`
        : "No debts between people"
    }
  }
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchExpensesAndCalculateDebts().then(() =>
          setTimeout(() => {
            setLoading(false)
          }, 500)
        )
      } else {
        console.error("User is not signed in.")
        navigate("/")
      }
    })

    return () => unsubscribe()
  })

  useEffect(() => {
    const user = auth.currentUser

    if (user) {
      fetchExpensesAndCalculateDebts()
    }
  })

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div>
            <br></br>
            <label htmlFor="person1">Person 1:</label>
            <input
              type="text"
              id="person1"
              value={person1}
              onChange={(e) => setPerson1(e.target.value)}
              required
            />
            {person1Error && <p className="error-message">{person1Error}</p>}
            <label htmlFor="person2">Person 2:</label>
            <input
              type="text"
              id="person2"
              value={person2}
              onChange={(e) => setPerson2(e.target.value)}
              required
            />
            {person2Error && <p className="error-message">{person2Error}</p>}
            <label htmlFor="description">Description (optional):</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
            {amountError && <p className="error-message">{amountError}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {currencyError && (
              <p className="error-message">{currencyError}</p>
            )}{" "}
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>Select a currency</option>
              {allCurrencies.map((currencyOption, index) => (
                <option key={index} value={currencyOption.code}>
                  {currencyOption.code} ({currencyOption.symbol})
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddExpense}>
              Add Expense
            </button>
          </div>

          <div>
            <h2>Net Debts</h2>
            <div id="netDebts"></div>
          </div>

          <div>
            <h2>Expenses History</h2>
            <ul>
              {expenses.map((expense, index) => (
                <li key={index}>
                  {expense.person1} owes {expense.amount}
                  {expense.currency} to {expense.person2}{" "}
                  {expense.description ? "for" + expense.description : ""}
                  <button
                    onClick={() => navigate(`/quick-expense/${expense.id}`)}
                  >
                    Details
                  </button>
                  <button onClick={() => handleDeleteExpense(expense.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default QuickExpense
