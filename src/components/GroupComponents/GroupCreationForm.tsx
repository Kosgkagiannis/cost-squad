import React, { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  setDoc,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { User, onAuthStateChanged } from "firebase/auth"
import GroupProps from "../../types/GroupTypes/GroupProps"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import { allCurrencies } from "../GlobalComponents/currencies"

const GroupCreationForm = () => {
  const [groupName, setGroupName] = useState("")
  const [createdGroupName, setCreatedGroupName] = useState<string | null>(null)
  const [userGroups, setUserGroups] = useState<GroupProps[]>([])
  const [currency, setCurrency] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleCreateGroup = async () => {
    const user: User | null = auth.currentUser

    if (!user) {
      return
    }

    if (groupName.trim() === "" || currency === "") {
      setError("Please enter a group name and select a currency.")
      return
    } else {
      setError("")
    }

    try {
      const groupsCollection = collection(db, "groups")
      const groupDocRef = doc(groupsCollection)

      await setDoc(groupDocRef, {
        groupName,
        userId: user.uid,
        currency,
      })

      setCreatedGroupName(groupName)
      setGroupName("")

      await fetchUserGroups(user.uid)
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }
  const fetchUserGroups = async (userId: string) => {
    try {
      const groupsCollectionRef = collection(db, "groups")
      const q = query(groupsCollectionRef, where("userId", "==", userId))
      const data = await getDocs(q)
      const userGroups = data.docs.map((doc) => {
        const groupData = doc.data() as GroupProps
        return {
          ...groupData,
          id: doc.id,
        }
      })

      setUserGroups(userGroups)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    } catch (err) {
      console.error("Error fetching user groups:", err)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserGroups(user.uid)
      } else {
        setUserGroups([])
        setTimeout(() => {
          setLoading(false)
        }, 500)
        console.error("User is not signed in.")
        navigate("/")
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div>
      <h2>Create a New Squad</h2>
      <input
        type="text"
        placeholder="Enter Group Name"
        value={groupName}
        onChange={handleGroupNameChange}
        maxLength={20}
      />
      <div style={{ marginBlock: "1rem" }}>
        <label style={{ marginRight: "10px" }} htmlFor="currency">
          Currency:
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="">Select a currency</option>
          {allCurrencies.map((currencyOption, index) => (
            <option key={index} value={currencyOption.code}>
              {currencyOption.code} ({currencyOption.symbol})
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "#ff0000bd" }}>{error}</p>}

      <button onClick={handleCreateGroup}>Create Squad</button>

      <h3>Your Squads</h3>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ul className="expense-list">
          {userGroups.map((group) => (
            <li key={group.id} className="expense-item-squads">
              <p style={{ wordBreak: "break-word" }}>{group.groupName}</p>
              <Link
                to={`/edit-group/${group.id}?currency=${group.currency}`}
                className="edit-button"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GroupCreationForm
