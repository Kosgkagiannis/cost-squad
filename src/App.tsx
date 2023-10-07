import React, { useState } from "react"
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom"
import "./App.css"
import { User } from "firebase/auth"
import { auth, db } from "./config/firebase"
import {
  getDocs,
  collection,
  query as firestoreQuery,
  where,
} from "firebase/firestore"
import Header from "./components/Header"
import LoginRegister from "./components/LoginRegister"
import GroupProps from "./types/GroupProps"
import QuickExpenseComponent from "./components/QuickExpense"
import CreateGroupPage from "./components/CreateGroupPage"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Router>
      <div className="App">
        {user && <Header user={user} handleLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
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
          <Route path="/create-group" element={<CreateGroupPage />} />{" "}
        </Routes>
      </div>
    </Router>
  )
}

export default App
