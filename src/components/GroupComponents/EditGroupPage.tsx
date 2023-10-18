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
  Timestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { User, onAuthStateChanged } from "firebase/auth"
import GroupHeader from "./GroupHeader"
import GroupMemberList from "./GroupMemberList"
import GroupExpenseForm from "./GroupExpenseForm"
import GroupDebtList from "./GroupDebtList"
import GroupDebtProps from "../../types/GroupTypes/GroupDebtProps"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"

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
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<null | File>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const storage = getStorage()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImageFileName(file.name)
        }
        reader.readAsDataURL(file)
      }

      setImageFile(file)
    }
  }

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
        setSelectedMemberId(memberDocSnapshot.id)
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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    const maxAmountLength = 11

    if (inputValue.length <= maxAmountLength) {
      setAmount(inputValue)
    }
  }

  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShared(e.target.checked)
  }

  const handleAddMember = async () => {
    if (newMember.trim() !== "") {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const memberId = uuidv4()
        let defaultProfilePictureUrl = ""

        // Get the download URL for the default profile picture
        const defaultProfilePictureRef = ref(
          storage,
          "avatars/default-avatar.png"
        )
        defaultProfilePictureUrl = await getDownloadURL(
          defaultProfilePictureRef
        )

        const memberDocRef = await addDoc(
          collection(db, "groups", groupId, "members"),
          {
            memberId,
            name: newMember,
            profilePicture: defaultProfilePictureUrl,
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
        setLoading(true)

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
        setLoading(false)
      } catch (error) {
        console.error("Error fetching expenses and debts:", error)
      }
    }

    fetchExpensesAndDebts()
  }, [groupId])

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
      setLoading(true)
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
        setLoading(false)
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

  useEffect(() => {
    if (!groupId) {
      return
    }

    const expensesCollectionRef = collection(db, "groups", groupId, "expenses")
    const unsubscribe = onSnapshot(expensesCollectionRef, (querySnapshot) => {
      const updatedExpenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setGroupExpenses(updatedExpenses)
    })

    return () => {
      unsubscribe()
    }
  }, [groupId])

  const handleAddExpense = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const expenseId = uuidv4()
      let imageUrls: string[] = []

      if (imageFile) {
        const storageRef = ref(
          storage,
          `expenses/${groupId}/${expenseId}/${imageFile.name}`
        )

        const imageSnapshot = await uploadBytes(storageRef, imageFile)
        imageUrls = [await getDownloadURL(imageSnapshot.ref)]
      } else {
        console.error("Image file doesn't exist")
      }

      const newExpenseData = {
        expenseId,
        description,
        amount: parseFloat(amount),
        timestamp: Timestamp.now(),
        userId: userId || "",
        payerId: selectedMemberId,
        payerName: selectedMember,
        shared,
        imageUrls: imageUrls,
      }

      // Calculate the share per member
      const sharePerMember = shared
        ? newExpenseData.amount / groupMembers.length
        : newExpenseData.amount

      const expensesCollectionRef = collection(
        db,
        "groups",
        groupId,
        "expenses"
      )

      const expenseDocRef = await addDoc(expensesCollectionRef, newExpenseData)

      // Calculate and update debts
      const updatedDebts = [...debts]

      groupMembers.forEach((member) => {
        if (member.id !== selectedMemberId) {
          const creditorId = selectedMemberId
          const debtorId = member.id

          // Check if a debt entryR already exists for this combination
          const existingDebtIndex = updatedDebts.findIndex(
            (debt) =>
              debt.creditorId === creditorId && debt.debtorId === debtorId
          )

          if (existingDebtIndex !== -1) {
            updatedDebts[existingDebtIndex].amount += sharePerMember
          } else {
            const debt: GroupDebtProps = {
              creditorId,
              creditorName: selectedMember,
              debtorId,
              debtorName: member.name,
              amount: sharePerMember,
              expenseId,
            }
            updatedDebts.push(debt)
          }

          // Update the debt in Firestore too
          const debtCollectionRef = collection(expenseDocRef, "debts")
          addDoc(debtCollectionRef, {
            creditorId,
            creditorName: selectedMember,
            debtorId,
            debtorName: member.name,
            amount: sharePerMember,
          })
        }
      })

      setDebts(updatedDebts)
      setDescription("")
      setAmount("")
      setShared(true)
      setSelectedMemberId("")
      setSelectedMember("")
      setImageFileName("")
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

        const expensesCollectionRef = collection(groupDocRef, "expenses")
        const expensesQuery = query(expensesCollectionRef)

        const membersCollectionRef = collection(groupDocRef, "members")
        const membersQuery = query(membersCollectionRef)

        const expensesQuerySnapshot = await getDocs(expensesQuery)
        expensesQuerySnapshot.forEach(async (expenseDoc) => {
          await deleteDoc(expenseDoc.ref)
        })

        const membersQuerySnapshot = await getDocs(membersQuery)
        membersQuerySnapshot.forEach(async (memberDoc) => {
          await deleteDoc(memberDoc.ref)
        })

        await deleteDoc(groupDocRef)

        navigate("/create-group")
      }
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    )
    if (confirmDelete) {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const expenseRef = doc(db, "groups", groupId, "expenses", expenseId)

        // Get the expense data to access imageUrls
        const expenseDocSnapshot = await getDoc(expenseRef)
        if (expenseDocSnapshot.exists()) {
          const expenseData = expenseDocSnapshot.data()

          // Delete associated images
          for (const imageUrlToDelete of expenseData.imageUrls) {
            const storage = getStorage()
            const imageRef = ref(storage, imageUrlToDelete)
            await deleteObject(imageRef)
          }
        }

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

        const updatedDebts: GroupDebtProps[] = []
        groupExpenses
          .filter((expense) => expense.id !== expenseId)
          .forEach((expense) => {
            const sharePerMember = expense.shared
              ? expense.amount / groupMembers.length
              : expense.amount

            groupMembers.forEach((member) => {
              if (member.id !== expense.payerId) {
                const creditorId = expense.payerId
                const debtorId = member.id

                const existingDebtIndex = updatedDebts.findIndex(
                  (debt) =>
                    debt.creditorId === creditorId && debt.debtorId === debtorId
                )

                if (existingDebtIndex !== -1) {
                  updatedDebts[existingDebtIndex].amount += sharePerMember
                } else {
                  const debt: GroupDebtProps = {
                    creditorId,
                    creditorName: expense.payerName,
                    debtorId,
                    debtorName: member.name,
                    amount: sharePerMember,
                    expenseId: expense.id,
                  }
                  updatedDebts.push(debt)
                }
              }
            })
          })

        setDebts(updatedDebts)
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
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
              groupId={groupId}
            />
          )}
          {groupId && (
            <GroupExpenseForm
              description={description}
              amount={amount}
              shared={shared}
              selectedMember={selectedMember}
              selectedMemberId={selectedMemberId}
              groupMembers={groupMembers}
              groupId={groupId}
              groupExpenses={groupExpenses}
              handleDescriptionChange={handleDescriptionChange}
              handleAmountChange={handleAmountChange}
              handleSharedChange={handleSharedChange}
              handleSelectedMemberChange={handleSelectedMemberChange}
              handleAddExpense={handleAddExpense}
              handleDeleteExpense={handleDeleteExpense}
              imageFile={imageFile}
              imageFileName={imageFileName}
              handleImageChange={handleImageChange}
              debts={debts}
            />
          )}
          <GroupDebtList groupId={groupId} debts={debts} />
        </>
      )}
    </div>
  )
}

export default EditGroupPage
