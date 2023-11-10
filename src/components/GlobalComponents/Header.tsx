import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import HeaderProps from "../../types/GlobalTypes/HeaderProps"
import Groups from "../../images/groups.png"
import QuickExpense from "../../images/quick-expense.png"
import Logout from "../../images/logout.png"
import LogoHeader from "../../images/logo-header.jpg"

function Header({ handleLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

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
            <div className="logo">
              <img src={LogoHeader} height={48} width={64} alt="Logo" />
              <h1 className="header-title">CostSquad</h1>
            </div>
          </Link>
          <div
            className={`hamburger-menu ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            data-testid="hamburger-menu"
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
        <div
          className={`header-items ${menuOpen ? "open" : ""}`}
          data-testid="header-items"
        >
          {!isHomePage && (
            <Link to="/create-group" onClick={closeMenu} className="menu-item">
              Squads
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
    </>
  )
}

export default Header
