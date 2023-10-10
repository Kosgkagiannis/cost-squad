import React from "react"
import GroupDebtProps from "../../types/GroupTypes/GroupDebtProps"

interface DebtListProps {
  debts: GroupDebtProps[]
}

const DebtList: React.FC<DebtListProps> = ({ debts }) => {
  const filteredDebts = debts.filter(
    (debt) => debt.creditorName !== debt.debtorName
  )

  return (
    <div>
      <h2>Debts</h2>
      <ul>
        {filteredDebts.map((debt, index) => (
          <li key={index}>
            {debt.debtorName} owes {debt.creditorName} ${debt.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DebtList
