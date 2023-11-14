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
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { useNavigate } from "react-router-dom"
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import LoadingAnimation from "../../images/loading2.gif"
import { onAuthStateChanged } from "firebase/auth"
import SendMail from "./SendMail"

const EditMemberPage = () => {
  const navigate = useNavigate()
  const { groupId, memberId }: { groupId?: string; memberId?: string } =
    useParams()
  const [memberName, setMemberName] = useState("")
  const [memberDebt, setMemberDebt] = useState("")
  const [currency, setCurrency] = useState<string>("")
  const [profilePicture, setProfilePicture] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberEmailFetch, setMemberEmailFetch] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    const currencyParamIndex = hash.indexOf("currency=")

    if (currencyParamIndex !== -1) {
      const currencyParam = hash.slice(currencyParamIndex + "currency=".length)
      setCurrency(decodeURIComponent(currencyParam))
    }
  }, [])

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const handleAddEmail = async () => {
    if (memberId && memberEmail && validateEmail(memberEmail)) {
      try {
        const memberDocRef = doc(db, "groups", groupId, "members", memberId)
        const memberDocSnapshot = await getDoc(memberDocRef)

        if (memberDocSnapshot.exists()) {
          const memberData = memberDocSnapshot.data()
          memberData.email = memberEmail

          await updateDoc(memberDocRef, memberData)
          setShowSuccessMessage(true)
          setTimeout(() => {
            setShowSuccessMessage(false)
          }, 3000)
        } else {
          console.error("Member document does not exist.")
        }
      } catch (error) {
        console.error("Error adding member's email:", error)
      }
    } else {
      setShowErrorMessage(true)
      setTimeout(() => {
        setShowErrorMessage(false)
      }, 3000)
    }
    setShowEmailInput(false)
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

        navigate(`/edit-group/${groupId}?currency=${currency}`)
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
      setLoadingImage(true)

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
          setTimeout(() => {
            setLoadingImage(false)
          }, 1500)
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

      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

    fetchMemberData()
  }, [groupId, memberId])

  const handleDeleteMember = async (memberId: string, memberName: string) => {
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
        const activityLogRef = collection(db, "activityLogs")
        const logData = {
          action: "MemberDeleted",
          memberName: memberName,
          timestamp: Timestamp.now(),
          deletedBy: auth.currentUser.email,
          groupId: groupId,
        }

        await addDoc(activityLogRef, logData)

        navigate(`/edit-group/${groupId}?currency=${currency}`)
      } catch (error) {
        console.error("Error deleting group member:", error)
      }
    }
  }
  const handleCancelEmail = () => {
    setShowEmailInput(false)
  }

  const fetchMemberDebts = async () => {
    if (!groupId || !memberId) {
      console.error("groupId or memberId is undefined")
      return
    }

    try {
      // We need to fetch the member's debt from Firestore so we can send him the email
      const memberDocRef = doc(db, "groups", groupId)
      const memberDocSnapshot = await getDoc(memberDocRef)

      if (memberDocSnapshot.exists()) {
        const groupData = memberDocSnapshot.data()

        const memberDebtsArray = groupData.debtsArray || []

        memberDebtsArray.forEach(async (debt) => {
          if (debt.member === memberName) {
            setMemberDebt(debt.totalDebt)
          }
        })
      } else {
        console.error("Group document does not exist.")
      }
    } catch (error) {
      console.error("Error fetching member debts:", error)
    }
  }

  const fetchMemberEmail = async () => {
    if (!groupId || !memberId) {
      console.error("groupId or memberId is undefined")
      return
    }

    try {
      const memberDocRef = doc(db, "groups", groupId, "members", memberId)
      const memberDocSnapshot = await getDoc(memberDocRef)

      if (memberDocSnapshot.exists()) {
        const memberData = memberDocSnapshot.data()

        const memberEmailFetchData = memberData.email || []

        setMemberEmailFetch(memberEmailFetchData)
      } else {
        console.error("Group document does not exist.")
      }
    } catch (error) {
      console.error("Error fetching member debts:", error)
    }
  }

  useEffect(() => {
    fetchMemberDebts()
    fetchMemberEmail()
  })

  return (
    <>
      <div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h2 className="group-title">{memberName}</h2>
            <button
              style={{ backgroundColor: "#ff0000bd" }}
              onClick={() =>
                memberId && handleDeleteMember(memberId, memberName)
              }
            >
              Delete member
            </button>
            <div className="upload-image-container">
              <div style={{ position: "absolute" }}>
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="rounded-image"
                />
                <label className="upload-profile-image" htmlFor="fileInput">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleUploadImage}
                  />
                </label>
              </div>
            </div>
            {loadingImage && (
              <>
                <img
                  src={LoadingAnimation}
                  width={48}
                  height={48}
                  alt="Loading"
                />
                <br />
              </>
            )}

            <div className="divider" />
            <h3>Debts</h3>
            {parseFloat(memberDebt) > 0 ? (
              <p>
                Total debt to the squad: {parseFloat(memberDebt).toFixed(2)}{" "}
                {currency}
              </p>
            ) : (
              <p>Member has no debts in the squad.</p>
            )}
            <>
              <div className="divider" />
              <h3>
                Notify this member about their debts by sending them an email.
              </h3>
              {showEmailInput ? (
                <div>
                  <input
                    type="text"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Enter member's email"
                  />
                  <button onClick={handleAddEmail}>Save email</button>
                  <button onClick={handleCancelEmail}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowEmailInput(true)}>
                  Add/Update Email
                </button>
              )}
              {showErrorMessage && (
                <p style={{ color: "#ff0000bd" }}>
                  Please enter a valid email address.
                </p>
              )}
              {showSuccessMessage && (
                <p style={{ color: "#00ed2d" }}>Email added successfully!</p>
              )}

              <SendMail
                memberName={memberName}
                memberDebt={parseFloat(memberDebt).toFixed(2)}
                memberEmail={memberEmailFetch}
                currency={currency}
              />
              <br />
              <button onClick={handleUpdateMemberName}>Save changes</button>
            </>
          </>
        )}
      </div>
    </>
  )
}

export default EditMemberPage
