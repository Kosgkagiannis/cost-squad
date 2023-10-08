import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"

const EditGroupPage = () => {
  const { groupId } = useParams<{ groupId?: string }>()
  const [newGroupName, setNewGroupName] = useState("")
  const navigate = useNavigate()

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value)
  }

  const handleUpdateGroupName = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const groupDocRef = doc(db, "groups", groupId)
      await updateDoc(groupDocRef, {
        groupName: newGroupName,
      })
      navigate(-1)
    } catch (error) {
      console.error("Error updating group name:", error)
    }
  }

  const isButtonDisabled = newGroupName.trim() === ""

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
    </div>
  )
}

export default EditGroupPage
