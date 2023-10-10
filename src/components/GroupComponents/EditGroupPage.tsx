import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  getDocs,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import { v4 as uuidv4 } from "uuid"
import { User, onAuthStateChanged } from "firebase/auth"
import GroupHeader from "./GroupHeader"
import GroupMemberList from "./GroupMemberList"
import GroupExpenseForm from "./GroupExpenseForm"
import DebtList from "./GroupDebtList"
import GroupDebtProps from "../../types/GroupTypes/GroupDebtProps"

const EditGroupPage = () => {
  const { groupId }: { groupId?: string } = useParams()
  const [newGroupName, setNewGroupName] = useState("")
  const [newMember, setNewMember] = useState("")
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [groupTitle, setGroupTitle] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [shared, setShared] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [groupExpenses, setGroupExpenses] = useState<any[]>([])
  const [debts, setDebts] = useState<GroupDebtProps[]>([])
  const navigate = useNavigate()

  const handleSelectedMemberChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedMemberId = e.target.value

    try {
      if (!groupId || !selectedMemberId) {
        console.error("groupId or selectedMemberId is undefined")
        return
      }

      const memberDocRef = doc(
        db,
        "groups",
        groupId,
        "members",
        selectedMemberId
      )
      const memberDocSnapshot = await getDoc(memberDocRef)

      if (memberDocSnapshot.exists()) {
        const memberData = memberDocSnapshot.data()
        setSelectedMemberId(memberData.memberId)
        setSelectedMember(memberData.name)
      } else {
        console.error("Selected member document does not exist.")
      }
    } catch (error) {
      console.error("Error fetching selected member:", error)
    }
  }

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value)
  }

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShared(e.target.checked)
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const expensesCollectionRef = collection(db, "expenses2")
        const expensesQuery = query(
          expensesCollectionRef,
          where("groupId", "==", groupId)
        )
        const querySnapshot = await getDocs(expensesQuery)

        const expensesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setGroupExpenses(expensesData)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      }
    }

    fetchExpenses()
  }, [groupId])

  const handleAddMember = async () => {
    if (newMember.trim() !== "") {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const memberId = uuidv4()

        const memberDocRef = await addDoc(
          collection(db, "groups", groupId, "members"),
          {
            memberId,
            name: newMember,
            profilePicture: "",
          }
        )

        const memberDocSnapshot = await getDoc(memberDocRef)
        if (memberDocSnapshot.exists()) {
          const memberData = memberDocSnapshot.data()
          setGroupMembers((prevMembers) => [
            ...prevMembers,
            { id: memberDocRef.id, ...memberData },
          ])
          setNewMember("")
        }
      } catch (error) {
        console.error("Error adding group member:", error)
      }
    }
  }

  useEffect(() => {
    const fetchExpensesAndDebts = async () => {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const expensesCollectionRef = collection(
          db,
          "groups",
          groupId,
          "expenses"
        )
        const expensesQuery = query(expensesCollectionRef)
        const querySnapshot = await getDocs(expensesQuery)
        const expensesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setGroupExpenses(expensesData)

        const allDebtsData = []

        for (const doc of querySnapshot.docs) {
          const debtsCollectionRef = collection(doc.ref, "debts")
          const debtsQuery = query(debtsCollectionRef)
          const debtsQuerySnapshot = await getDocs(debtsQuery)
          const debtsData = debtsQuerySnapshot.docs.map(
            (debtDoc) => debtDoc.data() as GroupDebtProps
          )
          allDebtsData.push(...debtsData)
        }

        setDebts(allDebtsData)
      } catch (error) {
        console.error("Error fetching expenses and debts:", error)
      }
    }

    fetchExpensesAndDebts()
  }, [groupId])

  useEffect(() => {
    if (groupId) {
      const fetchDebts = async () => {
        try {
          const expensesCollectionRef = collection(db, "expenses2")
          const expensesQuery = query(expensesCollectionRef)

          const querySnapshot = await getDocs(expensesQuery)

          const allDebtsData = []

          for (const doc of querySnapshot.docs) {
            const debtsCollectionRef = collection(
              db,
              "expenses2",
              doc.id,
              "debts"
            )

            const debtsQuery = query(debtsCollectionRef)
            const debtsQuerySnapshot = await getDocs(debtsQuery)

            const debtsData = debtsQuerySnapshot.docs.map(
              (debtDoc) => debtDoc.data() as GroupDebtProps
            )

            allDebtsData.push(...debtsData)
          }

          setDebts(allDebtsData)
        } catch (error) {
          console.error("Error fetching debts:", error)
        }
      }
      fetchDebts()
    }
  }, [groupId])

  const handleDeleteMember = async (memberId: string) => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const memberDocRef = doc(db, "groups", groupId, "members", memberId)
      await deleteDoc(memberDocRef)

      setGroupMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      )
    } catch (error) {
      console.error("Error deleting group member:", error)
    }
  }

  const handleUpdateGroupName = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const groupDocRef = doc(db, "groups", groupId)
      const groupDocSnapshot = await getDoc(groupDocRef)

      if (groupDocSnapshot.exists()) {
        const groupData = groupDocSnapshot.data()
        groupData.groupName = newGroupName

        await updateDoc(groupDocRef, groupData)
        setGroupTitle(newGroupName)
      } else {
        console.error("Group document does not exist.")
      }
    } catch (error) {
      console.error("Error updating group name:", error)
    }
  }

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const groupDocRef = doc(db, "groups", groupId)
      const groupDocSnapshot = await getDoc(groupDocRef)

      if (groupDocSnapshot.exists()) {
        const groupData = groupDocSnapshot.data()
        setGroupTitle(groupData.groupName)
      }

      const membersCollectionRef = collection(db, "groups", groupId, "members")
      const membersQuery = query(membersCollectionRef)

      try {
        const querySnapshot = await getDocs(membersQuery)
        const membersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setGroupMembers(membersData)
      } catch (error) {
        console.error("Error fetching group members:", error)
      }
    }

    fetchGroupMembers()
  }, [groupId])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserId(user.uid)
      } else {
        setUserId(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAddExpense = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const expenseId = uuidv4()

      const newExpenseData = {
        expenseId,
        description,
        amount: parseFloat(amount),
        timestamp: Timestamp.now(),
        userId: userId || "",
        payerId: selectedMemberId,
        payerName: selectedMember,
        shared,
      }

      const totalAmountExcludingPayer = shared
        ? newExpenseData.amount / groupMembers.length
        : newExpenseData.amount

      const debtsToAdd: GroupDebtProps[] = []

      groupMembers.forEach((member) => {
        if (member.id !== selectedMemberId) {
          const debt: GroupDebtProps = {
            debtorId: member.id,
            debtorName: member.name,
            creditorId: selectedMemberId,
            creditorName: selectedMember,
            amount: totalAmountExcludingPayer,
            expenseId,
          }

          debtsToAdd.push(debt)
        }
      })

      setDebts((prevDebts) => [...prevDebts, ...debtsToAdd])
      setGroupExpenses((prevExpenses) => [...prevExpenses, newExpenseData])

      const expensesCollectionRef = collection(
        db,
        "groups",
        groupId,
        "expenses"
      )
      const expenseDocRef = await addDoc(expensesCollectionRef, newExpenseData)

      const debtsCollectionRef = collection(expenseDocRef, "debts")

      for (const debt of debtsToAdd) {
        await addDoc(debtsCollectionRef, debt)
      }

      setDescription("")
      setAmount("")
      setShared(true)
      setSelectedMemberId("")
      setSelectedMember("")
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const onDeleteGroup = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this group?"
      )

      if (confirmed) {
        const groupDocRef = doc(db, "groups", groupId)
        await deleteDoc(groupDocRef)

        navigate("/create-group")
      }
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const expenseRef = doc(db, "groups", groupId, "expenses", expenseId)
      const debtsCollectionRef = collection(expenseRef, "debts")
      const debtsQuerySnapshot = await getDocs(debtsCollectionRef)

      const batch = writeBatch(db)

      debtsQuerySnapshot.forEach((debtDoc) => {
        batch.delete(debtDoc.ref)
      })

      await batch.commit()

      await deleteDoc(expenseRef)

      setGroupExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      )

      setDebts((prevDebts) =>
        prevDebts.filter((debt) => debt.expenseId !== expenseId)
      )
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  return (
    <div>
      <GroupHeader
        groupTitle={groupTitle}
        newGroupName={newGroupName}
        onGroupNameChange={handleGroupNameChange}
        handleUpdateGroupName={handleUpdateGroupName}
        onDeleteGroup={onDeleteGroup}
      />
      {groupId && (
        <GroupMemberList
          groupMembers={groupMembers}
          newMember={newMember}
          onMemberInputChange={handleMemberInputChange}
          handleAddMember={handleAddMember}
          handleDeleteMember={handleDeleteMember}
          groupId={groupId}
        />
      )}
      <GroupExpenseForm
        description={description}
        amount={amount}
        shared={shared}
        selectedMember={selectedMember}
        selectedMemberId={selectedMemberId}
        groupMembers={groupMembers}
        groupExpenses={groupExpenses}
        handleDescriptionChange={handleDescriptionChange}
        handleAmountChange={handleAmountChange}
        handleSharedChange={handleSharedChange}
        handleSelectedMemberChange={handleSelectedMemberChange}
        handleAddExpense={handleAddExpense}
        handleDeleteExpense={handleDeleteExpense}
        debts={debts}
      />
      <DebtList debts={debts} />
    </div>
  )
}

export default EditGroupPage
