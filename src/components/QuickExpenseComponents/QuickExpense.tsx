import React, { useState, useEffect, useCallback } from "react"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { allCurrencies } from "../GlobalComponents/currencies"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import LoadingAnimation from "../../images/loading2.gif"
import QuickExpenseProps from "../../types/QuickExpenseTypes/PublicExpenseProps"

const QuickExpense: React.FC = () => {
  const [expenses, setExpenses] = useState<QuickExpenseProps[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [person1, setPerson1] = useState<string>("")
  const [debtList, setDebtList] = useState<string[]>([])
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

  const handleAddExpense = useCallback(async () => {
    setPerson1Error("")
    setPerson2Error("")
    setAmountError("")
    setErrorMessage("")
    setCurrencyError("")

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
      const formattedPerson1 = capitalizeName(person1)
      const formattedPerson2 = capitalizeName(person2)

      const matchingExpenses = expenses.filter((expense) => {
        const storedPerson1 = capitalizeName(expense.person1)
        const storedPerson2 = capitalizeName(expense.person2)

        const match1 =
          formattedPerson1 === storedPerson1 &&
          formattedPerson2 === storedPerson2
        const match2 =
          formattedPerson1 === storedPerson2 &&
          formattedPerson2 === storedPerson1

        return match1 || match2
      })

      if (matchingExpenses.length > 0) {
        const previousCurrency = matchingExpenses[0].currency

        if (previousCurrency !== currency) {
          setErrorMessage(
            "Currency not the same as the one used in the previous expense!"
          )
          return
        }
      }
      setIsLoading(true)

      const newExpense: QuickExpenseProps = {
        person1: formattedPerson1,
        person2: formattedPerson2,
        description,
        amount,
        currency,
        userId: user.uid,
        timestamp: Timestamp.now(),
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
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [person1, person2, description, amount, currency, expenses])

  const fetchExpensesAndCalculateDebts = async (userId: string) => {
    const user = auth.currentUser
    if (user) {
      const userId = user.uid
      const q = query(expensesCollection, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const expensesData: QuickExpenseProps[] = []
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
  const calculateNetDebts = (expensesData: QuickExpenseProps[]) => {
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

  const updateNetDebtsUI = (
    netDebts: Record<string, { amount: number; currency: string }>
  ) => {
    const newDebtList = []

    for (const key in netDebts) {
      if (netDebts[key].amount !== 0) {
        const [person1, person2] = key.split("-")
        const amount = netDebts[key].amount
        const currency = netDebts[key].currency
        const debtDescription =
          amount > 0
            ? `${person1} owes ${person2} → ${amount} ${currency}`
            : `${person2} owes ${person1} → ${-amount} ${currency}`
        newDebtList.push(debtDescription)
      }
    }

    setDebtList(newDebtList)

    const netDebtsElement = document.getElementById("netDebts")
    if (netDebtsElement) {
      const ulClass = "styled-list"
      const liClass = "styled-list-item"
      netDebtsElement.innerHTML = newDebtList.length
        ? `<ul class="${ulClass}">${newDebtList
            .map(
              (debt, index) =>
                `<li class="${liClass}" key=${index}>${debt}</li>`
            )
            .join("")}</ul>`
        : "No debts between people"
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchExpensesAndCalculateDebts(user.uid).then(() =>
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
  }, [auth.currentUser])

  useEffect(() => {
    const user = auth.currentUser

    if (user) {
      fetchExpensesAndCalculateDebts(user.uid)
    }
  }, [])

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div>
            <br />
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                justifyContent: "center",
                marginBlock: "2rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label htmlFor="person1">Person 1:</label>
                <input
                  type="text"
                  id="person1"
                  value={person1}
                  onChange={(e) => setPerson1(e.target.value)}
                  required
                  maxLength={20}
                />
                {person1Error && (
                  <p className="error-message">{person1Error}</p>
                )}
              </div>
              <span
                style={{
                  display: "flex",
                  marginBlockStart: "1rem",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                owes
                <div className="custom-arrow"></div>{" "}
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label htmlFor="person2">Person 2:</label>
                <input
                  type="text"
                  id="person2"
                  value={person2}
                  onChange={(e) => setPerson2(e.target.value)}
                  required
                  maxLength={20}
                />
                {person2Error && (
                  <p className="error-message">{person2Error}</p>
                )}
              </div>
            </div>
            <label htmlFor="description">Description (optional):</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={40}
            />
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              value={amount.toString()}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
            {amountError && <p className="error-message">{amountError}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {currencyError && (
              <p className="error-message">{currencyError}</p>
            )}{" "}
            <div style={{ marginBlock: "1rem" }}>
              <label style={{ marginRight: "10px" }} htmlFor="currency">
                Currency:
              </label>
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
            </div>
            <button
              type="button"
              onClick={handleAddExpense}
              disabled={isLoading}
            >
              Add Expense
            </button>
          </div>
          {expenses.length > 0 && (
            <>
              {isLoading ? (
                <img
                  src={LoadingAnimation}
                  width={48}
                  height={48}
                  alt="Loading"
                />
              ) : (
                <>
                  <div className="divider" />

                  <div>
                    <h2>Net Debts</h2>
                    <div style={{ color: "#ffffffed", fontSize: "14px" }}>
                      {debtList.length ? (
                        <ul className="styled-list">
                          {debtList.map((debt, index) => (
                            <li key={index} className="styled-list-item">
                              {debt}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No debts between people"
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="divider" />

                    <h2>Expenses History</h2>
                    <ul className="styled-list">
                      {expenses.map((expense, index) => (
                        <li
                          key={index}
                          style={{ height: "auto" }}
                          className="styled-list-item"
                        >
                          <span>
                            <p style={{ wordBreak: "break-word" }}>
                              {expense.person1} owes {expense.person2} →{" "}
                              {expense.amount}
                              {expense.currency}
                              {expense.description
                                ? " for " + expense.description
                                : " "}
                            </p>
                            <button
                              onClick={() =>
                                navigate(`/quick-expense/${expense.id}`)
                              }
                            >
                              Details
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default QuickExpense
