import React, { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import { User, onAuthStateChanged } from "firebase/auth"
import GroupProps from "../../types/GroupTypes/GroupProps"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"
import { allCurrencies } from "../GlobalComponents/currencies"
import MembersAnimation from "../../images/members-animation.gif"

const GroupCreationForm = () => {
  const [groupName, setGroupName] = useState("")
  const [userGroups, setUserGroups] = useState<GroupProps[]>([])
  const [currency, setCurrency] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [joiningGroupId, setJoiningGroupId] = useState("")
  const [joinError, setJoinError] = useState("")
  const navigate = useNavigate()

  const userGroupsCollection = collection(db, "userGroups")

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleJoinGroup = async () => {
    try {
      if (joiningGroupId.trim() === "") {
        setJoinError("Please enter a squad ID.")
        return
      } else {
        setJoinError("")
      }

      const groupDocRef = doc(db, "groups", joiningGroupId)
      const groupDoc = await getDoc(groupDocRef)

      if (groupDoc.exists()) {
        const groupData = groupDoc.data() as GroupProps
        setUserGroups([...userGroups, { ...groupData, id: joiningGroupId }])
        setJoiningGroupId("")

        const user = auth.currentUser
        if (user) {
          // Update the user's list of joined groups
          const userGroupDocRef = doc(userGroupsCollection, user.uid)
          const userGroupDoc = await getDoc(userGroupDocRef)

          if (userGroupDoc.exists()) {
            const userData = userGroupDoc.data()
            const updatedGroups = userData.groups || []
            updatedGroups.push(joiningGroupId)

            await setDoc(
              userGroupDocRef,
              { groups: updatedGroups },
              { merge: true }
            )
          } else {
            await setDoc(userGroupDocRef, { groups: [joiningGroupId] })
          }

          // Update the group's list of users
          const updatedGroupUsers = groupData.userId || []
          if (!updatedGroupUsers.includes(user.uid)) {
            updatedGroupUsers.push(user.uid)
            const updatedGroupDocRef = doc(db, "groups", joiningGroupId)
            await setDoc(
              updatedGroupDocRef,
              { userId: updatedGroupUsers },
              { merge: true }
            )
          }
        }
      } else {
        setJoinError("No squad found with this ID.")
      }
    } catch (error) {
      console.error("Error joining group:", error)
    }
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
        userId: [user.uid],
        currency,
        joiningGroupId,
      })

      setGroupName("")

      await fetchUserGroups(user.uid)
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }
  const fetchUserGroups = async (userId: string) => {
    try {
      const groupsCollectionRef = collection(db, "groups")
      const q = query(
        groupsCollectionRef,
        where("userId", "array-contains", userId)
      )
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
  }, [navigate, userGroups])

  const handleLeaveGroup = async (groupId: string) => {
    const confirm = window.confirm("Are you sure you want to leave this squad?")
    if (confirm) {
      try {
        const user = auth.currentUser

        if (user) {
          const groupDocRef = doc(db, "groups", groupId)
          const groupDoc = await getDoc(groupDocRef)

          if (groupDoc.exists()) {
            const groupData = groupDoc.data()
            const updatedGroupUsers = groupData.userId || []

            const userIndex = updatedGroupUsers.indexOf(user.uid)
            if (userIndex !== -1) {
              updatedGroupUsers.splice(userIndex, 1)
              await setDoc(
                groupDocRef,
                { userId: updatedGroupUsers },
                { merge: true }
              )

              // Fetch and update the user's list of joined groups
              const userGroupDocRef = doc(userGroupsCollection, user.uid)
              const userGroupDoc = await getDoc(userGroupDocRef)

              if (userGroupDoc.exists()) {
                const userData = userGroupDoc.data()
                const updatedGroups = userData.groups || []
                const groupIndex = updatedGroups.indexOf(groupId)
                if (groupIndex !== -1) {
                  updatedGroups.splice(groupIndex, 1)
                  await setDoc(
                    userGroupDocRef,
                    { groups: updatedGroups },
                    { merge: true }
                  )
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error leaving group:", error)
      }
    }
  }

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div>
      <h2 className="group-title">Create a New Squad</h2>
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
          className="currency"
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

      <button onClick={handleCreateGroup}>Create squad</button>
      <div className="divider" />
      <h3>Join another person's squad</h3>
      <input
        type="text"
        placeholder="Enter squad ID to join"
        value={joiningGroupId}
        onChange={(e) => setJoiningGroupId(e.target.value)}
      />
      <button onClick={handleJoinGroup}>Join squad</button>
      {joinError && <p style={{ color: "#ff0000bd" }}>{joinError}</p>}
      <div>
        <div className="divider" />

        {userGroups.length > 0 && (
          <div className="title-and-animation">
            <h2>Your Squads</h2>
            <img
              src={MembersAnimation}
              alt="Members animation"
              width={50}
              height={50}
            />
          </div>
        )}

        <ul className="expense-list">
          {userGroups.map((group) => (
            <li key={group.id} className="expense-item-squads">
              <p style={{ wordBreak: "break-word" }}>{group.groupName}</p>
              <Link
                to={`/edit-group/${group.id}?currency=${group.currency}`}
                className="edit-button"
              >
                View
              </Link>
              {group.userId[0] !== auth.currentUser.uid && (
                <button onClick={() => handleLeaveGroup(group.id)}>
                  Leave
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GroupCreationForm
