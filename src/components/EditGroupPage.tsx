import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
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
} from "firebase/firestore"
import { db, auth } from "../config/firebase"
import { v4 as uuidv4 } from "uuid"
import { User, onAuthStateChanged } from "firebase/auth"

const EditGroupPage = () => {
  const { groupId }: { groupId?: string } = useParams()
  const [newGroupName, setNewGroupName] = useState("")
  const [newMember, setNewMember] = useState("")
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [groupTitle, setGroupTitle] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [shared, setShared] = useState(true)
  const [expenses, setExpenses] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [addedMemberId, setAddedMemberId] = useState<string>("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [addedExpense, setAddedExpense] = useState<any | null>(null)
  const [groupExpenses, setGroupExpenses] = useState<any[]>([])

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

      setExpenses(expensesData)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

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
          setAddedMemberId(memberId)
        }
      } catch (error) {
        console.error("Error adding group member:", error)
      }
    }
  }

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

  // Fetch group members when we load the page
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
    fetchExpenses()
  }, [groupId, groupExpenses])

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
        groupId,
        timestamp: Timestamp.now(),
        userId: userId || "",
        payerId: selectedMemberId,
        payerName: selectedMember,
        shared,
      }

      setGroupExpenses((prevExpenses) => [...prevExpenses, newExpenseData])

      await addDoc(collection(db, "expenses2"), newExpenseData)

      fetchExpenses()

      setDescription("")
      setAmount("")
      setShared(true)
      setSelectedMemberId("")
      setSelectedMember("")
      setAddedExpense(newExpenseData)
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  // Disable buttons if no input is given
  const isButtonDisabled = newGroupName.trim() === ""
  const isMemberButtonDisabled = newMember.trim() === ""

  return (
    <div>
      <h1>{groupTitle || "Group Name"}</h1>
      <h2>Edit Group Name</h2>
      <input
        type="text"
        placeholder="Enter New Group Name"
        value={newGroupName}
        onChange={handleGroupNameChange}
      />
      <button onClick={handleUpdateGroupName} disabled={isButtonDisabled}>
        Update Group Name
      </button>
      <h2>Add Members</h2>
      <input
        type="text"
        placeholder="Enter Member's Name"
        value={newMember}
        onChange={handleMemberInputChange}
      />
      <button onClick={handleAddMember} disabled={isMemberButtonDisabled}>
        Add Member
      </button>
      <h2>Members</h2>
      <ul>
        {groupMembers
          .filter((member) => member.name && member.name.trim() !== "")
          .map((member) => (
            <li key={member.id}>
              {member.name}
              <Link
                className="edit-button"
                to={`/edit-member/${groupId}/${member.id}`}
              >
                Edit
              </Link>
              <button onClick={() => handleDeleteMember(member.id)}>
                Delete
              </button>
            </li>
          ))}
      </ul>
      <h2>Add Expense</h2>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={handleAmountChange}
      />
      <label>
        Shared:
        <input type="checkbox" checked={shared} onChange={handleSharedChange} />
      </label>
      <div>
        <label style={{ marginRight: "10px" }}>Paid By: {selectedMember}</label>
        <select value={selectedMemberId} onChange={handleSelectedMemberChange}>
          <option value=""></option>
          {groupMembers
            .filter((member) => member.name && member.name.trim() !== "")
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
        </select>
      </div>
      <button
        disabled={
          description.trim() === "" ||
          amount.trim() === "" ||
          selectedMemberId === ""
        }
        onClick={handleAddExpense}
      >
        Add Expense
      </button>
      <div>
        <h2>Group Expenses</h2>
        <ul>
          {groupExpenses.map((expense) => (
            <li key={expense.id}>
              <p>Description: {expense.description}</p>
              <p>Amount: {expense.amount}</p>
              <p>Timestamp: {expense.timestamp.toDate().toLocaleString()}</p>
              <p>Paid By: {expense.payerName}</p>
              <p>Shared: {expense.shared ? "Yes" : "No"}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default EditGroupPage
