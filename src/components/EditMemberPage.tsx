import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import { useNavigate } from "react-router-dom"

const EditMemberPage = () => {
  const navigate = useNavigate()
  const { groupId, memberId }: { groupId?: string; memberId?: string } =
    useParams()
  const [memberName, setMemberName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleMemberNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberName(e.target.value)
  }

  const handleUpdateMemberName = async () => {
    try {
      if (!groupId || !memberId) {
        console.error("groupId or memberId is undefined")
        return
      }

      const memberDocRef = doc(db, "groups", groupId, "members", memberId)
      const memberDocSnapshot = await getDoc(memberDocRef)

      if (memberDocSnapshot.exists()) {
        const memberData = memberDocSnapshot.data()
        memberData.name = memberName

        await updateDoc(memberDocRef, memberData)
        navigate(`/edit-group/${groupId}`)
      } else {
        console.error("Member document does not exist.")
      }
    } catch (error) {
      console.error("Error updating member name:", error)
    }
  }

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!groupId || !memberId) {
        console.error("groupId or memberId is undefined")
        return
      }

      setLoading(true)

      const memberDocRef = doc(db, "groups", groupId, "members", memberId)
      const memberDocSnapshot = await getDoc(memberDocRef)

      if (memberDocSnapshot.exists()) {
        const memberData = memberDocSnapshot.data()
        setMemberName(memberData.name || "")
      }

      setLoading(false)
    }

    fetchMemberData()
  }, [groupId, memberId])

  return (
    <div>
      <h2>Edit Member Name</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter New Member Name"
            value={memberName}
            onChange={handleMemberNameChange}
          />
          <button onClick={handleUpdateMemberName}>Save</button>
        </>
      )}
    </div>
  )
}

export default EditMemberPage
