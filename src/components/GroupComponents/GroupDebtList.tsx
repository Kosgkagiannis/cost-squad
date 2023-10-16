import React, { useEffect, useState } from "react"
import GroupDebtProps from "../../types/GroupTypes/GroupDebtProps"
import { db } from "../../config/firebase"
import { collection, getDocs } from "firebase/firestore"

interface DebtListProps {
  debts: GroupDebtProps[]
  groupId: string
}

const GroupDebtList: React.FC<DebtListProps> = ({ debts, groupId }) => {
  const [members, setMembers] = useState<{ [key: string]: string }>({})

  // Fetch and store member profile pictures
  useEffect(() => {
    const fetchMembers = async () => {
      const memberCollectionRef = collection(db, "groups", groupId, "members")
      const memberQuerySnapshot = await getDocs(memberCollectionRef)

      const memberData: { [key: string]: string } = {}

      memberQuerySnapshot.forEach((doc) => {
        const data = doc.data()
        memberData[data.name] = data.profilePicture
      })

      setMembers(memberData)
    }

    fetchMembers()
  }, [groupId])

  const netDebtsMap = new Map<string, number>()

  // Calculate net debts (if 2 people owe each other we should calculate the net)
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
          const formattedAmountNumber = parseFloat(formattedAmount)

          const debtorProfileImage = members[debtor] || ""
          const creditorProfileImage = members[creditor] || ""

          return (
            <li key={index}>
              {direction ? (
                <>
                  <img
                    src={creditorProfileImage}
                    alt={`${creditor}'s Profile`}
                    className="member-profile-image"
                  />
                  {`${creditor} owes ${debtor} `}
                  <img
                    src={debtorProfileImage}
                    alt={`${debtor}'s Profile`}
                    className="member-profile-image"
                  />
                  {"->"} ${Math.abs(formattedAmountNumber)}
                </>
              ) : (
                <>
                  <img
                    src={debtorProfileImage}
                    alt={`${debtor}'s Profile`}
                    className="member-profile-image"
                  />
                  {`${debtor} owes ${creditor} `}
                  <img
                    src={creditorProfileImage}
                    alt={`${creditor}'s Profile`}
                    className="member-profile-image"
                  />
                  {"->"} ${Math.abs(formattedAmountNumber)}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default GroupDebtList
