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
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"


const GroupCreationForm = () => {
  const [groupName, setGroupName] = useState("")
  const [createdGroupName, setCreatedGroupName] = useState<string | null>(null)
  const [userGroups, setUserGroups] = useState<GroupProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleCreateGroup = async () => {
    const user: User | null = auth.currentUser

    if (!user) {
      console.error("User is not signed in.")
      return
    }

    if (groupName.trim() === "") {
      return
    }

    try {
      const groupsCollection = collection(db, "groups")
      const groupDocRef = doc(groupsCollection)

      await setDoc(groupDocRef, {
        groupName,
        userId: user.uid,
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
      setIsLoading(false)
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
        setIsLoading(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div>
      <h2>Create a New Group</h2>
      {createdGroupName && <p>Group Created: {createdGroupName}</p>}
      <input
        type="text"
        placeholder="Enter Group Name"
        value={groupName}
        onChange={handleGroupNameChange}
      />
      <button onClick={handleCreateGroup} disabled={groupName.trim() === ""}>
        Create Group
      </button>

      <h3>Your Groups</h3>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul>
          {userGroups.map((group) => (
            <li key={group.id}>
              {group.groupName}
              <Link to={`/edit-group/${group.id}`} className="edit-button">
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
