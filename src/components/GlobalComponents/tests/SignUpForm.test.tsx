import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import SignupForm from "../SignUpForm"
import LoginRegister from "../LoginRegister"

describe("SignUpFOrm Component", () => {
  it("renders without errors", () => {
    render(
      <SignupForm
        onClose={() => {}}
        onSignup={() => {}}
        onUserLogin={() => {}}
      />
    )
    const signupForm = screen.getByText("Sign Up")
    expect(signupForm).toBeInTheDocument()
  })

  it("Displays an error message when signup fails", async () => {
    const onSignup = jest.fn()
    const onUserLogin = jest.fn()

    render(
      <div>
        <LoginRegister onUserLogin={() => {}} />{" "}
        <SignupForm
          onClose={() => {}}
          onSignup={onSignup}
          onUserLogin={onUserLogin}
        />
      </div>
    )

    // Find and click the "here" link
    const hereLink = screen.getByText("here")
    fireEvent.click(hereLink)

    const signUpButton = screen.getAllByRole("button")[0]

    await act(async () => {
      fireEvent.click(signUpButton)
    })

    // NEED TO CHECK IF USER LOGIN ERROR APPEARS
    await screen.findByText("Firebase: Error (auth/invalid-email).")
  })
})
