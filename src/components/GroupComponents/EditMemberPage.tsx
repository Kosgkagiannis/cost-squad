import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  deleteDoc,
  getDocs,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { useNavigate } from "react-router-dom"
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import { onAuthStateChanged } from "firebase/auth"

const EditMemberPage = () => {
  const navigate = useNavigate()
  const { groupId, memberId }: { groupId?: string; memberId?: string } =
    useParams()
  const [memberName, setMemberName] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [loading, setLoading] = useState(false)

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
        setProfilePicture(memberData.profilePicture)

        const expensesCollectionRef = collection(
          db,
          "groups",
          groupId,
          "expenses"
        )
        const expensesQuery = query(expensesCollectionRef)
        const querySnapshot = await getDocs(expensesQuery)

        querySnapshot.forEach(async (doc) => {
          const expenseData = doc.data()
          if (expenseData.payerId === memberId) {
            expenseData.payerName = memberName
            await updateDoc(doc.ref, expenseData)
          }

          const debtsCollectionRef = collection(doc.ref, "debts")
          const debtsQuery = query(debtsCollectionRef)
          const debtsQuerySnapshot = await getDocs(debtsQuery)

          debtsQuerySnapshot.forEach(async (debtDoc) => {
            const debtData = debtDoc.data()
            if (debtData.creditorId === memberId) {
              debtData.creditorName = memberName
              await updateDoc(debtDoc.ref, debtData)
            }
            if (debtData.debtorId === memberId) {
              debtData.debtorName = memberName
              await updateDoc(debtDoc.ref, debtData)
            }
          })
        })

        navigate(`/edit-group/${groupId}`)
      } else {
        console.error("Member document does not exist.")
      }
    } catch (error) {
      console.error("Error updating member name:", error)
    }
  }

  const handleUploadImage = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (!groupId || !memberId) {
        console.error("groupId or memberId is undefined")
        return
      }

      try {
        const storage = getStorage()
        const storageRef = ref(storage, `avatars/${groupId}/${memberId}`)
        const imageSnapshot = await uploadBytes(storageRef, file)

        const imageUrl = await getDownloadURL(imageSnapshot.ref)

        const memberDocRef = doc(db, "groups", groupId, "members", memberId)
        const memberDocSnapshot = await getDoc(memberDocRef)

        if (memberDocSnapshot.exists()) {
          const memberData = memberDocSnapshot.data()
          memberData.profilePicture = imageUrl

          await updateDoc(memberDocRef, memberData)
          setProfilePicture(imageUrl)
        } else {
          console.error("Member document does not exist.")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      } else {
        console.error("User is not signed in.")
        navigate("/")
      }
    })

    return () => {
      unsubscribe()
    }
  })
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
        setProfilePicture(memberData.profilePicture || "")
      }

      setLoading(false)
    }

    fetchMemberData()
  }, [groupId, memberId])

  const handleDeleteMember = async (memberId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?\nNote: All debts from and to this member will also be cleared."
    )
    console.log("memberId: ", memberId)

    if (confirmed) {
      try {
        if (!groupId) {
          console.error("groupId is undefined")
          return
        }

        const memberDocRef = doc(db, "groups", groupId, "members", memberId)
        await deleteDoc(memberDocRef)

        const expensesCollectionRef = collection(
          db,
          "groups",
          groupId,
          "expenses"
        )
        const expensesQuery = query(expensesCollectionRef)
        const querySnapshot = await getDocs(expensesQuery)

        querySnapshot.forEach(async (doc) => {
          const debtsCollectionRef = collection(doc.ref, "debts")
          const debtsQuery = query(debtsCollectionRef)
          const debtsQuerySnapshot = await getDocs(debtsQuery)

          debtsQuerySnapshot.forEach(async (debtDoc) => {
            const debtData = debtDoc.data()
            console.log("debtdata: ", debtData)

            if (
              debtData.creditorId === memberId ||
              debtData.debtorId === memberId
            ) {
              await deleteDoc(debtDoc.ref)
            }
          })
        })

        navigate(`/edit-group/${groupId}`)
      } catch (error) {
        console.error("Error deleting group member:", error)
      }
    }
  }

  return (
    <div>
      <button onClick={() => memberId && handleDeleteMember(memberId)}>
        Delete
      </button>{" "}
      <h2>Edit Member Info</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div>
            <h3>{memberName}</h3>
            <img src={profilePicture} alt="Profile" className="rounded-image" />
          </div>

          <label className="custom-upload-button">
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleUploadImage}
            />
          </label>

          <button onClick={handleUpdateMemberName}>Save</button>
        </>
      )}
    </div>
  )
}

export default EditMemberPage
