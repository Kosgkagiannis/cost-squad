import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { User } from "firebase/auth"
import { MemoryRouter } from "react-router-dom"
import Header from "../Header"

const dummyUser: Partial<User> = {
  uid: "HiMzHbOfcvksTjV6kHnxT4TpfKO2",
  displayName: "Test",
  email: "testuser@example.com",
}
describe("Header Component", () => {
  it("renders without errors", () => {
    render(
      <MemoryRouter>
        <Header handleLogout={() => {}} user={dummyUser} />
      </MemoryRouter>
    )

    expect(screen.getByText("CostSquad")).toBeInTheDocument()
  })

  it("toggles the menu on hamburger menu click", () => {
    render(
      <MemoryRouter>
        <Header handleLogout={() => {}} user={dummyUser} />
      </MemoryRouter>
    )
    const hamburgerMenu = screen.getByTestId("hamburger-menu")
    fireEvent.click(hamburgerMenu)
    expect(screen.getByTestId("header-items")).toHaveClass("open")
  })
})
