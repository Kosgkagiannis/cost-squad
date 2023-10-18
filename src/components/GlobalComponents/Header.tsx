import React from "react"
import { Link, useNavigate } from "react-router-dom"
import HeaderProps from "../../types/GlobalTypes/HeaderProps"

function Header({ handleLogout }: HeaderProps) {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <>
      <div className="header">
        <div className="navigation">
          <Link to="/">
            <h1 className="header-title">CostSquad</h1>
          </Link>
        </div>
        <div>
          <div className="header-items">
            <Link to="/create-group">Groups</Link>
            <Link to="/quick-expense">Quick Expense</Link>
            <Link to="#" onClick={handleGoBack}>
              Back
            </Link>
          </div>
          <div className="header-items">
            <a href="/cost-squad" onClick={handleLogout}>
              Logout
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
