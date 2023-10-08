import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  getDocs,
} from "firebase/firestore"
import { db } from "../config/firebase"
import { v4 as uuidv4 } from "uuid"

const EditGroupPage = () => {
  const { groupId }: { groupId?: string } = useParams()
  const [newGroupName, setNewGroupName] = useState("")
  const [newMember, setNewMember] = useState("")
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [groupTitle, setGroupTitle] = useState<string | null>(null)

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value)
  }

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember(e.target.value)
  }

  const handleAddMember = async () => {
    if (newMember.trim() !== "") {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const memberDocRef = await addDoc(
          collection(db, "groups", groupId, "members"),
          {
            memberId: uuidv4(),
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

  const isButtonDisabled = newGroupName.trim() === ""
  const isMemberButtonDisabled = newMember.trim() === ""

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
              <button onClick={() => handleDeleteMember(member.id)}>
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default EditGroupPage
