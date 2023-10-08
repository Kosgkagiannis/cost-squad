import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"

const EditGroupPage = () => {
  const { groupId }: { groupId?: string } = useParams()
  const [newGroupName, setNewGroupName] = useState("")
  const [newMember, setNewMember] = useState("")
  const [groupMembers, setGroupMembers] = useState<string[]>([])

  const navigate = useNavigate()

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value)
  }

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember(e.target.value)
  }

  const handleAddMember = async () => {
    if (newMember.trim() !== "") {
      const updatedMembers = [...groupMembers, newMember]

      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const groupDocRef = doc(db, "groups", groupId)
        await updateDoc(groupDocRef, {
          members: updatedMembers,
        })

        setGroupMembers(updatedMembers)
        setNewMember("")
      } catch (error) {
        console.error("Error updating group members:", error)
      }
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
        const updatedMembers = [...groupData.members, ...groupMembers]

        await updateDoc(groupDocRef, {
          groupName: newGroupName,
          members: updatedMembers,
        })

        navigate(-1)
      } else {
        console.error("Group document does not exist.")
      }
    } catch (error) {
      console.error("Error updating group name:", error)
    }
  }

  const isButtonDisabled = newGroupName.trim() === "" || newMember.trim() === ""

  return (
    <div>
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
      <button onClick={handleAddMember} disabled={newMember.trim() === ""}>
        Add Member
      </button>
    </div>
  )
}

export default EditGroupPage
