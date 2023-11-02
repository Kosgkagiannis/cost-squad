import React, { useState, useEffect } from "react"
import { HashRouter as Router, Route, Link, Routes } from "react-router-dom"
import "./App.css"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "./config/firebase"
import {
  getDocs,
  collection,
  doc,
  getDoc,
  setDoc,
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
import LoadingSpinner from "./components/GlobalComponents/LoadingSpinner"
import WelcomeCarousel from "./components/GlobalComponents/WelcomeCarousel"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCarousel, setShowCarousel] = useState(true)
  const [showModal, setShowModal] = useState(true)

  const userPreferencesCollection = collection(db, "user_preferences")

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

  const handleCarouselComplete = async () => {
    setShowModal(false)

    const userDocRef = doc(userPreferencesCollection, user.uid)
    const userDocSnapshot = await getDoc(userDocRef)

    if (!userDocSnapshot.exists()) {
      await setDoc(userDocRef, { hasSeenModal: true })
    }
  }
  const handleUserLogin = async () => {
    setUser(auth.currentUser)
    setLoading(false)
    setShowCarousel(true)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setShowCarousel(false)
      setShowModal(false)
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 5000)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        fetchUserGroups(user.uid).then(() => {
          setLoading(false)
        })

        const userDocRef = doc(userPreferencesCollection, user.uid)
        const userDocSnapshot = await getDoc(userDocRef)

        if (!userDocSnapshot.exists()) {
          setShowModal(true)
        } else {
          setShowModal(false)
        }
      } else {
        setUser(null)
        setTimeout(() => {
          setLoading(false)
        }, 500)
        setShowModal(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Router basename="/">
      <div className="App">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {user && <Header user={user} handleLogout={handleLogout} />}
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <>
                      {showModal && (
                        <WelcomeCarousel
                          onComplete={handleCarouselComplete}
                          visible={showCarousel}
                        />
                      )}
                      <div className="questions-form">
                        <h2 className="questions">
                          Want to add an expense between multiple people?
                        </h2>
                        <Link
                          to="/create-group"
                          style={{ textDecoration: "none" }}
                        >
                          <button className="button-content">
                            Go to Squads
                            <img
                              src={Groups}
                              height={30}
                              width={30}
                              alt="Groups"
                            />
                          </button>
                        </Link>

                        <div className="divider" />
                        <h2 className="questions">
                          Want to add an expense between 2 people?
                        </h2>
                        <Link
                          to="/quick-expense"
                          style={{ textDecoration: "none" }}
                        >
                          <button className="button-content">
                            Go to Quick Expense
                            <img
                              src={QuickExpense}
                              height={30}
                              width={30}
                              alt="Groups"
                            />
                          </button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <LoginRegister onUserLogin={handleUserLogin} />
                  )
                }
              />
              <Route
                path="/quick-expense"
                element={<QuickExpenseComponent />}
              />
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
          </>
        )}
      </div>
    </Router>
  )
}

export default App
