import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import HeaderProps from "../../types/GlobalTypes/HeaderProps"
import Groups from "../../images/groups.png"
import QuickExpense from "../../images/quick-expense.png"
import Logout from "../../images/logout.png"
import Back from "../../images/back.png"

function Header({ handleLogout }: HeaderProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const handleGoBack = () => {
    navigate(-1)
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const isHomePage = location.pathname === "/"

  return (
    <>
      <div className="header">
        <div className="navigation">
          <Link to="/" onClick={closeMenu}>
            <h1 className="header-title">CostSquad</h1>
          </Link>
          <div
            className={`hamburger-menu ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
        <div className={`header-items ${menuOpen ? "open" : ""}`}>
          {!isHomePage && (
            <Link to="/create-group" onClick={closeMenu} className="menu-item">
              Groups
              <img src={Groups} height={30} width={30} alt="Groups" />
            </Link>
          )}
          {!isHomePage && (
            <Link to="/quick-expense" onClick={closeMenu} className="menu-item">
              Quick Expense
              <img src={QuickExpense} height={30} width={30} alt="Groups" />
            </Link>
          )}
          <a href="/cost-squad" onClick={handleLogout} className="menu-item">
            Logout
            <img src={Logout} height={30} width={30} alt="Groups" />
          </a>
        </div>
      </div>
      {!isHomePage && (
        <Link to="#" onClick={handleGoBack} className="back_feature">
          Back
          <img src={Back} height={30} width={30} alt="Groups" />
        </Link>
      )}
    </>
  )
}

export default Header
