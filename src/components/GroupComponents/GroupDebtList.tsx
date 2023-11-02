import React, { useEffect, useState } from "react"
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from "victory"
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

  // calculate total debt for each member after filtering
  const memberDebts = new Map<string, number>()

  filteredNetDebts.forEach(([debtKey, amount]) => {
    const [debtor, creditor] = debtKey.split("-")
    const isCreditor = amount > 0
    const member = isCreditor ? creditor : debtor

    if (memberDebts.has(member)) {
      memberDebts.set(member, memberDebts.get(member)! + Math.abs(amount))
    } else {
      memberDebts.set(member, Math.abs(amount))
    }
  })

  const memberDebtsArray = Array.from(memberDebts).map(
    ([member, totalDebt]) => ({
      member,
      totalDebt,
    })
  )

  // need the member names for the X axis
  const memberNames = Object.keys(members)
  memberNames.unshift("")

  return (
    <>
      {memberDebtsArray.length > 0 ? (
        <div>
          <h2>Debts</h2>
          <VictoryChart
            domainPadding={20}
            width={600}
            height={400}
            padding={{ left: 100, top: 55, right: 45, bottom: 105 }}
          >
            <VictoryBar
              data={memberDebtsArray}
              x="member"
              y="totalDebt"
              labels={({ datum }) => {
                const label = `$${
                  datum.totalDebt % 1 === 0
                    ? datum.totalDebt.toFixed(0)
                    : datum.totalDebt.toFixed(2)
                }`
                const maxLabelLength = 8
                return label.length > maxLabelLength
                  ? label.substring(0, maxLabelLength) +
                      "\n" +
                      label.substring(maxLabelLength)
                  : label
              }}
              style={{
                data: {
                  fill: "#007bff",
                  fillOpacity: 0.6,
                  strokeWidth: 2,
                },
                labels: {
                  fontSize: "12px",
                  fill: "black",
                  angle: -45,
                  textAnchor: "start",
                  padding: 8,
                },
              }}
              barWidth={40}
            />
            <VictoryAxis
              tickValues={memberNames}
              label=""
              style={{
                axis: { stroke: "#ccc", strokeWidth: 2 },
                axisLabel: { padding: 35, fontWeight: "bold" },
                tickLabels: {
                  fontSize: 12,
                  angle: -45,
                  textAnchor: "end",
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              label="Total Debt"
              style={{
                axis: { stroke: "#ccc", strokeWidth: 2 },
                axisLabel: { padding: 5, fontWeight: "bold" },
                tickLabels: {
                  fontWeight: "",
                  padding: 30,
                  fontSize: 11,
                },
              }}
            />
          </VictoryChart>
          <ul className="styled-list">
            {filteredNetDebts.map(([debtKey, amount], index) => {
              const [debtor, creditor] = debtKey.split("-")
              const formattedAmount = amount.toFixed(2)

              const direction = amount > 0 ? true : false
              const formattedAmountNumber = parseFloat(formattedAmount)
              const debtorProfileImage = members[debtor] || ""
              const creditorProfileImage = members[creditor] || ""

              return (
                <li key={index} className="styled-list-item">
                  {direction ? (
                    <>
                      <div className="image-container">
                        <img
                          src={creditorProfileImage}
                          alt={`${creditor}'s Profile`}
                          className="member-profile-image"
                        />
                        {creditor}
                      </div>
                      <div className="text-debt-container">owes</div>
                      <div className="image-container">
                        <img
                          src={debtorProfileImage}
                          alt={`${debtor}'s Profile`}
                          className="member-profile-image"
                        />
                        {debtor}
                      </div>
                      <div className="text-debt-container">
                        <div className="custom-arrow"></div> $
                        {Math.abs(formattedAmountNumber)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="image-container">
                        <img
                          src={debtorProfileImage}
                          alt={`${debtor}'s Profile`}
                          className="member-profile-image"
                        />
                        {debtor}
                      </div>
                      <div className="text-debt-container">owes</div>
                      <div className="image-container">
                        <img
                          src={creditorProfileImage}
                          alt={`${creditor}'s Profile`}
                          className="member-profile-image"
                        />
                        {creditor}
                      </div>
                      <div className="text-debt-container">
                        <div className="custom-arrow"></div>$
                        {Math.abs(formattedAmountNumber)}
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </>
  )
}

export default GroupDebtList
/*
e2 owes e3 10
e1 owes e1 10
-
300 by e1
e3 owes e1 90
e2 owes e3 10
e2 owes e1 100
-
3000 by e2
e3 owes e2 990
e3 owes e1 90
e1 owes e2 900
/graph 1080 e3,e1 900
-
30 by e3
e3 owes e2 980
e3 owes e1 80
e1 owes e2 900
*/