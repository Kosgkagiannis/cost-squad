import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "../config/firebase"
import HeaderProps from "../types/HeaderProps"

function Header({ user, handleLogout }: HeaderProps) {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <>
      <div className="header">
        <div className="navigation">
          <Link to="/cost-squad">Home</Link>
          <Link to="/create-group">Group Creation</Link>
          <Link to="/quick-expense">Quick Expense</Link>
          <span className="nav-right">
            <Link to="#" onClick={handleGoBack}>
              Back
            </Link>
            <a href="/cost-squad" onClick={handleLogout}>
              Logout
            </a>
          </span>
        </div>
        <h1 className="header-title">CostSquad</h1>
      </div>
    </>
  )
}

export default Header
