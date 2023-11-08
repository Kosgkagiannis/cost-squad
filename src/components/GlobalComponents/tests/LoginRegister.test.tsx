import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import LoginRegister from "../LoginRegister"

describe("LoginRegister Component", () => {
  it("renders without errors", () => {
    const onUserLogin = jest.fn()
    render(<LoginRegister onUserLogin={onUserLogin} />)

    expect(screen.getByText("Log In")).toBeInTheDocument()
    expect(screen.getByText("Or Log in with Google")).toBeInTheDocument()
  })

  it("displays an error message when login fails", async () => {
    const onUserLogin = jest.fn()
    render(<LoginRegister onUserLogin={onUserLogin} />)

    const loginButton = screen.getByText("Log in")

    await act(async () => {
      fireEvent.click(loginButton)
    })

    // NEED TO CHECK IF USER LOGIN ERROR APPEARS
    await screen.findByText("Firebase: Error (auth/invalid-email).")
  })
})
