import React, { useState } from "react"

const GroupUnequalExpenses = () => {
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [results, setResults] = useState([])
  const [debts, setDebts] = useState([])

  const handleAddMember = () => {
    setMembers([...members, { name: `Member ${members.length + 1}`, paid: 0 }])
  }

  const handleRemoveMember = (index) => {
    const updatedMembers = [...members]
    updatedMembers.splice(index, 1)
    setMembers(updatedMembers)
  }

  const handlePaymentChange = (index, amount) => {
    const updatedPayments = [...payments]
    updatedPayments[index] = parseFloat(amount)
    setPayments(updatedPayments)
  }

  const calculateOwes = () => {
    const totalPayments = payments.reduce((acc, payment) => acc + payment, 0)

    if (totalPayments != totalAmount) {
      alert(
        "Total payments exceed the total amount. Please adjust the payments."
      )
      return
    }

    const averageAmount = totalAmount / members.length
    const balance = Array(members.length).fill(averageAmount)

    payments.forEach((payment, index) => {
      balance[index] -= payment
    })

    const updatedDebts = [...debts]
    const newResults = []

    for (let i = 0; i < members.length; i++) {
      for (let j = 0; j < members.length; j++) {
        if (i !== j && balance[i] > 0 && balance[j] < 0) {
          const amount = Math.min(balance[i], -balance[j])
          //   console.log("TO AMOUNT: ", amount)
          newResults.push({
            from: members[i].name,
            to: members[j].name,
            amount: amount,
          })
          balance[i] -= amount
          balance[j] += amount
          //   console.log(
          //     "AMOUNT AFTER CALCULATION, balance[i], balance[j] ",
          //     amount,
          //     balance[i],
          //     balance[j]
          //   )
          // Update the debts
          const existingDebt = updatedDebts.find(
            (debt) =>
              debt.to === members[j].name && debt.from === members[i].name
          )
          const existingDebtPositive = updatedDebts.find(
            (debt) =>
              debt.from === members[j].name && debt.to === members[i].name
          )

          const existingDebtNegative = updatedDebts.find(
            (debt) =>
              debt.to === members[i].name && debt.from === members[j].name
          )

          if (existingDebt) {
            existingDebt.amount = Math.abs(existingDebt.amount + amount)
            existingDebt.to = members[j].name // Swap "from" and "to" names
            existingDebt.from = members[i].name // Swap "from" and "to" names
            // console.log("EXISTINGDEBT: ", existingDebt.amount)
          } else if (existingDebtNegative) {
            existingDebtNegative.amount = Math.abs(
              existingDebtNegative.amount - amount
            )
            console.log(
              "existingdebtnegative.amount ",
              existingDebtNegative.amount
            )
            console.log("amount ", amount)
            if (existingDebtNegative.amount > amount) {
              existingDebtNegative.from = members[j].name
              existingDebtNegative.to = members[i].name
              console.log("1")
              console.log("amount1", amount)
            } else if (existingDebtNegative.amount < amount) {
              existingDebtNegative.to = members[j].name
              existingDebtNegative.from = members[i].name
              console.log("2")
            }
          } else if (existingDebtPositive) {
            // Update the existing debt with swapped names
            existingDebtPositive.amount = Math.abs(
              existingDebtPositive.amount - amount
            )
            existingDebtPositive.to = members[j].name // Swap names
            existingDebtPositive.from = members[i].name
            console.log("3")
            // Swap names
            // console.log(
            //   "EXISTINGDEBT POSITIVE: ",
            //   existingDebtPositive.amount
            // )
          } else {
            // Create a new debt
            updatedDebts.push({
              from: members[i].name,
              to: members[j].name,
              amount: amount,
            })
          }
        }
      }
    }

    setResults(newResults)
    setDebts(updatedDebts)
  }

  return (
    <div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Total amount:</label>
        <input
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <button onClick={handleAddMember}>Add Member</button>
      </div>
      {members.map((member, index) => (
        <div key={index}>
          <label>{member.name} paid:</label>
          <input
            type="number"
            value={payments[index] || ""}
            onChange={(e) => handlePaymentChange(index, e.target.value)}
          />
          <button onClick={() => handleRemoveMember(index)}>Remove</button>
        </div>
      ))}
      <button onClick={calculateOwes}>Calculate</button>
      <div>
        <h2>Results:</h2>
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              {result.from} owes {result.to} ${result.amount}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Debts:</h2>
        <ul>
          {debts.map((debt, index) => (
            <li key={index}>
              {debt.amount < 0
                ? `${debt.to} owes ${debt.from} $${Math.abs(debt.amount)}`
                : `${debt.from} owes ${debt.to} $${debt.amount}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GroupUnequalExpenses

/*
First input:
    Total amount: 120
    m1 paid 100
    m2 paid 15
    m3 paid 5

    Correct result:
    m2 owes m1 25
    m3 owes m1 35

Second input:

    Total amount: 300
    m1 paid 20
    m2 paid 250
    m3 paid 30

    Correct result:
    m1 owes m2 $55
    m3 owes m1 $35
    m3 owes m2 $70


    ----
    Third input
    Total amount 3000
    m1 paid 800
    m2 paid 1200
    m3 paid 1000

    -

    Output:
    m1 owes m2 $255
    m3 owes m1 $35
    m3 owes m2 $70

    --

    Fourth Output:
    Total amount: 6000
    m1 paid 4000
    m2 paid 1000
    m3 paid 1000

    Expected output:
    m2 owes m1 745
    m3 owes m2 70
    m3 owes m1 1035

    Fifth output:
    TOtal amount 30
    m1 paid 5  (m1 owes m2 5)
    m2 paid 15
    m3 paid 10

    Expected output:
    m2 owes m1 740
    m3 owes m1 1035
    m3 owes m2 70

*/
