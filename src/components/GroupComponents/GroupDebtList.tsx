import React from "react"
import GroupDebtProps from "../../types/GroupTypes/GroupDebtProps"

interface DebtListProps {
  debts: GroupDebtProps[]
}

const DebtList: React.FC<DebtListProps> = ({ debts }) => {
  const netDebtsMap = new Map<string, number>()

  // Calculate net debts(if 2 people owe each other we should calculate the net)
  debts.forEach((debt) => {
    const creditorKey = `${debt.creditorName}-${debt.debtorName}`
    const debtorKey = `${debt.debtorName}-${debt.creditorName}`

    // Exclude entries where the creditor and debtor are the same person
    if (debt.creditorName === debt.debtorName) {
      return
    }

    if (netDebtsMap.has(creditorKey)) {
      netDebtsMap.set(creditorKey, netDebtsMap.get(creditorKey)! + debt.amount)
    } else if (netDebtsMap.has(debtorKey)) {
      netDebtsMap.set(debtorKey, netDebtsMap.get(debtorKey)! - debt.amount)
    } else {
      netDebtsMap.set(creditorKey, debt.amount)
    }
  })

  // Filter out zero net debts
  const filteredNetDebts = Array.from(netDebtsMap).filter(
    ([, amount]) => amount !== 0
  )

  return (
    <div>
      <h2>Debts</h2>
      <ul>
        {filteredNetDebts.map(([debtKey, amount], index) => {
          const [debtor, creditor] = debtKey.split("-")
          const formattedAmount = amount.toFixed(2)

          const direction = amount > 0 ? true : false

          return (
            <li key={index}>
              {!direction
                ? `${debtor} owes ${creditor} $${Math.abs(formattedAmount)}`
                : `${creditor} owes ${debtor} $${Math.abs(formattedAmount)}`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default DebtList
