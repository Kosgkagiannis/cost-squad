import React, { useState, useEffect } from "react"
import { HashRouter as Router, Route, Link, Routes } from "react-router-dom"
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
import GroupExpenseDetails from "./components/GroupComponents/GroupExpenseDetails"
import Groups from "./images/groups.png"
import QuickExpense from "./images/quick-expense.png"
import QuickExpenseDetails from "./components/QuickExpenseComponents/QuickExpenseDetails"

function App() {
  const [user, setUser] = useState<User | null>(null)

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
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        fetchUserGroups(user.uid).then((userGroups) => {})
      } else {
        setUser(null)
      }
    })

    if (auth.currentUser) {
      fetchUserGroups(auth.currentUser.uid).then((userGroups) => {})
    }

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Router basename="/">
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
                  <Link to="/create-group" style={{ textDecoration: "none" }}>
                    <button className="button-content">
                      Go to Groups
                      <img src={Groups} height={30} width={30} alt="Groups" />
                    </button>
                  </Link>

                  <div className="divider" />
                  <h2 className="questions">
                    Want to add a quick expense between 2 people?
                  </h2>
                  <Link to="/quick-expense" style={{ textDecoration: "none" }}>
                    <button className="button-content">
                      Go to QuickExpense
                      <img
                        src={QuickExpense}
                        height={30}
                        width={30}
                        alt="Groups"
                      />
                    </button>
                  </Link>
                </div>
              ) : (
                <LoginRegister onUserLogin={handleUserLogin} />
              )
            }
          />
          <Route path="/quick-expense" element={<QuickExpenseComponent />} />
          <Route
            path="/quick-expense/:expenseId"
            element={<QuickExpenseDetails />}
          />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/edit-group/:groupId" element={<EditGroupPage />} />
          <Route
            path="/edit-member/:groupId/:memberId"
            element={<EditMemberPage />}
          />
          <Route
            path="/expense-details/:groupId/:expenseId"
            element={<GroupExpenseDetails />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
