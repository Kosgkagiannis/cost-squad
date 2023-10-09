import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom" // Import useHistory
import "./App.css"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "./config/firebase"
import {
  getDocs,
  collection,
  query as firestoreQuery,
  where,
} from "firebase/firestore"
import Header from "./components/GlobalComponents/Header"
import LoginRegister from "./components/GlobalComponents/LoginRegister"
import GroupProps from "./types/GroupTypes/GroupProps"
import QuickExpenseComponent from "./components/QuickExpenseComponents/QuickExpense"
import CreateGroupPage from "./components/GroupComponents/CreateGroupPage"
import EditGroupPage from "./components/GroupComponents/EditGroupPage"
import EditMemberPage from "./components/GroupComponents/EditMemberPage"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userGroups, setUserGroups] = useState<GroupProps[]>([])

  const fetchUserGroups = async (userId: string): Promise<GroupProps[]> => {
    try {
      const groupsCollectionRef = collection(db, "groups")
      const query = firestoreQuery(
        groupsCollectionRef,
        where("userId", "==", userId)
      )
      const data = await getDocs(query)
      const userGroups = data.docs.map((doc) => {
        const groupData = doc.data() as Omit<GroupProps, "id">
        return {
          id: doc.id,
          ...groupData,
        } as GroupProps
      })

      return userGroups
    } catch (err) {
      console.error("Error fetching user groups:", err)
      return []
    }
  }

  const handleUserLogin = async () => {
    setUser(auth.currentUser)

    if (auth.currentUser) {
      const userGroups = await fetchUserGroups(auth.currentUser.uid)
      setUserGroups(userGroups)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setUserGroups([])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        fetchUserGroups(user.uid).then((userGroups) => {
          setUserGroups(userGroups)
        })
      } else {
        setUser(null)
        setUserGroups([])
      }
      setIsLoading(false)
    })

    if (auth.currentUser) {
      fetchUserGroups(auth.currentUser.uid).then((userGroups) => {
        setUserGroups(userGroups)
      })
    }

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Router>
      <div className="App">
        {user && <Header user={user} handleLogout={handleLogout} />}
        <Routes>
          <Route
            path="/cost-squad"
            element={
              user ? (
                <div className="questions-form">
                  <h2 className="questions">
                    Want to add an expense between multiple people?
                  </h2>
                  <h3 className="questions">
                    You can do that by creating a group:
                  </h3>
                  <Link to="/create-group">
                    <button>Create Group</button>
                  </Link>
                  <div className="divider" />
                  <h2 className="questions">
                    Want to add a quick expense between 2 people?
                  </h2>
                  <Link to="/quick-expense">
                    <button>Go to QuickExpense</button>
                  </Link>
                </div>
              ) : (
                <LoginRegister onUserLogin={handleUserLogin} />
              )
            }
          />
          <Route path="/quick-expense" element={<QuickExpenseComponent />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/edit-group/:groupId" element={<EditGroupPage />} />
          <Route
            path="/edit-member/:groupId/:memberId"
            element={<EditMemberPage />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
